const mongoose=require('mongoose');
const cloudinary=require('cloudinary');



const ProductSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'You must provide a name'],
        maxlength:[100,"Product name cannot exceed 100 characters"],
    },
    price:{
        type:Number,
        required:[true,"You must provide the price of a item"],
    },
    description:{
        type:String,
        required:[true,'You must provide a description'],
        maxlength:[1000,'Product description should not exceed 1000  charcaters'],
    },
    image:{
        type:String,
        default:'/uploads/example.jpeg'
    },
    imagePublicID:{
        type:String,
    },
    category:{
        type:String,
        required:[true,'you must provide a category'],
        enum:
        {
            values:['coffee','fastfood','colddrinks'],
            message:'{VALUE} is not supported',
        },
    
    },
    featured:{
        type:Boolean,
        default:false,
    },
    freeShipping:{
        type:Boolean,
        default:false,
    },
    inventory:{
        type:Number,
        min:0,
        default:15,
    },
    numOfReviews:{
        type:Number,
        default:0,
    },
    averageRating:{
        type:Number,
        default:0
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'Users',
        required:true,
    }

},{
    timestamps:true,
});

ProductSchema.statics.calulcateInventory=async function(cartItems)
{
    cartItems.forEach(async (cart) => {

        console.log(cart);

        const product=await this.findOne({_id:cart.product});

        product.inventory=product.inventory-cart.amount;

        await product.save();

        
    });


}



ProductSchema.pre('deleteOne',{query:false,document:true}, async function(){

    if(!this.imagePublicID)
        return

    await this.model('Reviews').deleteMany({product:this._id});

    try {
        cloudinary.uploader.destroy(this.imagePublicID);
    } catch (error) {
        console.log("error deleting image",error);
        
    }

    

});


module.exports=mongoose.model("Products",ProductSchema);
