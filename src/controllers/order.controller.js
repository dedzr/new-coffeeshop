const { StatusCodes } = require("http-status-codes");
const Order = require('../models/Order');
const Product = require("../models/Product");
const checkPermission = require("../utils/check-permission");
const CustomAPIError = require("../errors");
const { STANDARD_SHIPPING, EXPRESS_SHIPPING } = require("../utils");

// Fake Stripe API simulation for testing
async function fakeStripeAPI(amount, currency) {
    return { client_secret: "asdasd", amount };
}

// Helper function for creating order items and calculating subTotal
async function createOrderItems(cartItems) {
    let orderItems = [];
    let subTotal = 0;
    let willChargeShipping = false;

    await Promise.all(cartItems.map(async (item) => {
        if (item.amount === 0) throw new CustomAPIError.BadRequestError("Amount cannot be zero");

        const dbProduct = await Product.findOne({ _id: item.product });
        if (!dbProduct) throw new CustomAPIError.NotFoundError("Product not found");
        if (item.amount > dbProduct.inventory) throw new CustomAPIError.BadRequestError("Amount exceeds stock");

        const { name, price, image, _id, freeShipping } = dbProduct;
        if (!freeShipping) willChargeShipping = true;

        const singleOrderItem = {
            name,
            price,
            image,
            amount: item.amount,
            product: _id,
        };

        orderItems.push(singleOrderItem);
        subTotal += item.amount * price;
    }));

    return { orderItems, subTotal, willChargeShipping };
}

// Helper function to calculate total with tax and shipping
function calculateTotal(subTotal, shippingFee) {
    const tax = Math.round(subTotal * 0.15);
    return { tax, total: tax + shippingFee + subTotal };
}

async function httpGetAllOrders(req, res) {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({ orders });
}

async function httpGetOrderByStatus(req, res) {
    const { status } = req.query;
    const orders = await Order.find({ status });
    res.status(StatusCodes.OK).json({ orders });
}

async function httpGetSingleOrder(req, res) {
    const { id: orderID } = req.params;
    const order = await Order.findOne({ _id: orderID });
    if (!order) throw new CustomAPIError.NotFoundError("No order found");

    checkPermission(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
}

async function httpGetCurrentUserOrders(req, res) {
    const orders = await Order.find({ user: req.user.userId });
    res.status(StatusCodes.OK).json({ orders });
}

async function httpCreateOrder(req, res) {
    const { paymentType, address, shippingType, items: cartItems } = req.body;

    if (!cartItems || cartItems.length < 1) throw new CustomAPIError.BadRequestError("No cart provided");
    if (!['standard', 'express'].includes(shippingType)) throw new CustomAPIError.BadRequestError("Invalid shipping type");
    if (!paymentType) throw new CustomAPIError.BadRequestError("Payment type required");

    const { orderItems, subTotal, willChargeShipping } = await createOrderItems(cartItems);
    const shippingFee = willChargeShipping
        ? (shippingType === 'express' ? EXPRESS_SHIPPING : STANDARD_SHIPPING)
        : 0;

    const { tax, total } = calculateTotal(subTotal, shippingFee);

    let order;
    let clientSecret = null;

    if (paymentType === 'cash-on-delivery') {
        order = await Order.create({
            tax,
            address,
            shippingFee,
            shippingType,
            subTotal,
            total,
            cartItems: orderItems,
            user: req.user.userId,
            paymentType,
        });
    } else if (paymentType === 'stripe') {
        const paymentIntent = await fakeStripeAPI(total, 'usd');
        clientSecret = paymentIntent.client_secret;
        order = await Order.create({
            tax,
            address,
            shippingFee,
            shippingType,
            subTotal,
            total,
            cartItems: orderItems,
            user: req.user.userId,
            clientSecret,
            paymentType,
        });
    }
    else{
        order = await Order.create({
            tax,
            address,
            shippingFee,
            shippingType,
            subTotal,
            total,
            cartItems: orderItems,
            user: req.user.userId,
            paymentType,
        });

    }

    res.status(StatusCodes.CREATED).json({ order, clientSecret });
}

async function httpUpdateOrder(req, res) {
    const { paymentIntent } = req.body;
    const { id: orderID } = req.params;

    if (!paymentIntent) throw new CustomAPIError.BadRequestError("No payment provided");

    const order = await Order.findOne({ _id: orderID });
    if (!order) throw new CustomAPIError.NotFoundError("No order found");

    checkPermission(req.user, order.user);

    order.paymentIntentId = paymentIntent;
    order.paymentStatus = 'paid';
    await order.save();

    res.status(StatusCodes.OK).json({ order });
}

async function httpUpdateOrderAdmin(req, res) {
    const { id: orderID } = req.params;
    const order = await Order.findById(orderID);

    if (!order) throw new CustomAPIError.NotFoundError("Order not found");

    await order.updateOne(req.body, { runValidators: true });
    const updatedOrder = { ...order._doc, ...req.body };

    res.status(StatusCodes.OK).json({ order: updatedOrder });
}

module.exports = {
    httpGetAllOrders,
    httpGetSingleOrder,
    httpGetCurrentUserOrders,
    httpUpdateOrder,
    httpCreateOrder,
    httpUpdateOrderAdmin,
    httpGetOrderByStatus,
};
