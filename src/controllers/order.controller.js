const { StatusCodes } = require("http-status-codes");

const Order=require('../models/Order');
const checkPermission = require("../utils/check-permission");
const CustomAPIError = require("../errors");
const { STANDARD_SHIPPING, EXPRESS_SHIPPING } = require("../utils");
const Product = require("../models/Product");


async function fakeStripeAPI(amount,currency)
{
    const client_secret="asdasd";

    return {client_secret,amount};

}



async function httpGetAllOrders(req,res){

    const orders=await Order.find({});

    res.status(StatusCodes.OK).json({orders});
}

async function httpGetOrderByStatus(req,res)
{
    const {status}=req.query;
    console.log(status)
    const orders=await Order.find({status:status});

    res.status(StatusCodes.OK).json({orders});
}


async function httpGetSingleOrder(req,res){

    const {id:orderID}=req.params;

    const order=await Order.findOne({_id:orderID});

    if(!order)
        throw CustomAPIError.NotFoundError("No order found");

    checkPermission(req.user,order.user);

    res.status(StatusCodes.OK).json({order});

}
async function httpGetCurrentUserOrders(req,res){


    const orders=await Order.find({user:req.user.userId});

    res.status(StatusCodes.OK).json({orders});

}
async function httpCreateOrder(req,res){

    const{paymentType,address,shippingType,items:cartItems}=req.body;


    if(!cartItems || cartItems.length<1)
    {
        throw new CustomAPIError.BadRequestError("No cart provided");
    }

    if(!shippingType==='standard' || !shippingType=='express')
    {
        throw new CustomAPIError.BadRequestError("Invalid shipping type");
    }

    if(!paymentType)
    {
        throw  new CustomAPIError.BadRequestError("You must provide a payment type");
    }

    let orderItems=[];
    let subtotal=0;

    
    let willChargeShipping=false;
    
    for(const item of cartItems)
    {

        if(item.amount==0)
            throw new CustomAPIError.BadRequestError("Amount cannot be zero");
        const dbProduct=await Product.findOne({_id:item.product});

        


        if(!dbProduct)
            throw new CustomAPIError.NotFoundError("No product found");

        if(item.amount>dbProduct.inventory)
        {
            throw new CustomAPIError.BadRequestError("The amount you have ordered exceeds our stock");
        }


        const {name,price,image,_id,freeShipping}=dbProduct;

        if(!freeShipping)
            willChargeShipping=true;

        

        const singleOrderItem={
            name,
            price,
            image,
            amount:item.amount,
            product:_id,
        };

        

        orderItems=[...orderItems,singleOrderItem];

        subtotal+=item.amount*price;
 
    }

    let shippingFee=0;

    if(willChargeShipping)
    {
        if(shippingType=='express')
            shippingFee=EXPRESS_SHIPPING;
        else 
            shippingFee=STANDARD_SHIPPING;

    }

   


    const tax=Math.round(subtotal*0.15);


    const total=tax+shippingFee+subtotal;

   
    let order;
    let paymentIntent={
        client_secret:null
    };

    if(paymentType=='cash-on-delivery')
    {
        
        order=await Order.create({
            tax,
            address,
            shippingFee,
            shippingType,
            subTotal:subtotal,
            total,
            cartItems:orderItems,
            user:req.user.userId,
            paymentType,
            
        });

    }
    else if(paymentType=='stripe')
    {
        const paymentIntent=await fakeStripeAPI({
            amount:total,
            currency:'usd',
        });
        order=await Order.create({
            tax,
            address,
            shippingFee,
            shippingType,
            subTotal:subtotal,
            total,
            cartItems:orderItems,
            user:req.user.userId,
            clientSecret:paymentIntent.client_secret,
            paymentType,
            
        });


        
    }




    res.status(StatusCodes.CREATED).json({order,clientSecret:paymentIntent.client_secret});

}
async function httpUpdateOrder(req,res){
    const {paymentIntent:paymentID}=req.body;
    const {id:orderID}=req.params;

    if(!paymentIntent)
    {
        throw CustomAPIError.BadRequestError("You did not pay");

    }


    const order=await Order.findOne({_id:orderID});


    if(!order)
        throw new CustomAPIError.NotFoundError("No order found");

    checkPermission(req.user,order.user);

    order.paymentIntentId=paymentID;
    order.paymentStatus='paid';


    await order.save();



    res.status(StatusCodes.OK).json({order});

}

async function httpUpdateOrderAdmin(req,res){
    const {id:orderID}=req.params;

    const order=await Order.findById(orderID);



    if(!order)
        CustomAPIError.NotFoundError("Order not found");

    await order.updateOne(req.body,{runValidators:true});

    const orderUpdated={
        ...order._doc,
        ...req.body


    }

    res.status(StatusCodes.OK).json({order:orderUpdated});


}

module.exports={
    httpGetAllOrders,
    httpGetSingleOrder,
    httpGetCurrentUserOrders,
    httpUpdateOrder,
    httpCreateOrder,
    httpUpdateOrderAdmin,
    httpGetOrderByStatus
}