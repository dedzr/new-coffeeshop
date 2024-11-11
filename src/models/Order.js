
const mongoose=require('mongoose');

const singleCartItem=new mongoose.Schema({

    name:{type:String,required:true},
    image:{type:String,required:true},
    price:{type:Number,required:true},
    amount:{type:Number,required:true},
    product:{
        type:mongoose.Types.ObjectId,
        ref:"Products",
        required:true,
    },
 
});



const orderSchemma= new mongoose.Schema({

    tax:{
        type:Number,
        required:true,
    },
    shippingType:{
        type:String,
        enums:['standard','express'],
        required:true,
        default:'standard'

    },
    address:{
        type:String,
        required:[true,"You must provide an address"]
    },
    shippingFee:{
        type:Number,
        required:true,
    },
    subTotal:{
        type:Number,
        required:true,

    },
    total:{
        type:Number,
        required:true,
    },
    cartItems:[singleCartItem],
    status:{
        type:String,
        enums:{
            values:['pending','failed','accepted','delivered','canceled'],
            message:"{VALUE} is not supported. please provide between these 'pending','failed','accepted','delivered','canceled'" ,
        },
        required:true,
        default:'pending',
    },
    paymentStatus:{
        type:String,
        enums:{
            values:['paid','not-paid'],
            message:"{VALUE} is not supported. please provide between these 'paid','not-paid'" ,
        },
        default:'not-paid',
    },
    paymentType:{
        type:String,
        enums:{
            values:['cash-on-delivery','stripe'],
            message:"{VALUE} is not supported. please provide between these 'cash-on-delivery','stripe'" ,
        },
        required:true,
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"Users",
        required:true,
    },
    clientSecret:{
        type:String,
    },
    paymentIntentId:{
        type:String,
    },

},
{
    timestamps:true,
});


orderSchemma.post('save',{document:true,query:false},async function(){


    await this.model("Products").calulcateInventory(this.cartItems);

});

// orderSchemma.post('updateOne',{document:true,query:false}, async function(){


//     const modifiedCarts=[];

//     this.cartItems.forEach(async cart =>{

//         if(cart.isModified('amount'))
//         {
//             modifiedCarts.push(cart);

//         }



//     });


//     await this.model("Products").calulcateInventory(this.cartItems);

// });



module.exports=mongoose.model("Orders",orderSchemma);