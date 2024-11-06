const mongoose=require('mongoose');



const ReviewSchema=new mongoose.Schema({
    rating:{
        type:Number,
        required:[true,"you must provide a rating"],
        min:1,
        max:5,
    },
    title:{
        type:String,
        required:[true,"You must provide review title"],
        maxlength:[100,"title must be within 100 words"]
    },
    comment:{
        type:String,
        required:[true,"You must provide a comment"],

    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"Users",
        required:true,
    },
    product:{
        type:mongoose.Types.ObjectId,
        ref:"Products",
        required:true,
    },



    

},
{
    timestamps:true,

});

ReviewSchema.index({product:1,user:1},{unique:true});

ReviewSchema.statics.calculateAverageRating=async function(productID){
    const result=await this.aggregate([
        {$match:{product:productID}},
        {
            $group:{
                _id:null,
                averageRating:{$avg:'$rating'},
                numOfReviews:{$sum:1},

            }

        }

    ]);

    try{
        this.model('Products').findOneandUpdate({_id:productID},
            {
                averageRating:result[0]?.averageRating||0,
                numOfReviews:result[0]?.numOfReviews||0,

            });
    }
    catch(e)
    {
        console.log(`Error calculating review average and number:${e}`);
    }

}

ReviewSchema.post('save',{document:true,query:false},async function () {
    await this.constructor.calculateAverageRating(this.product);
    
});

ReviewSchema.post('deleteOne',{document:true,query:false},async function(){
    await this.constructor.calculateAverageRating(this.product);


});



module.exports=mongoose.model("Reviews",ReviewSchema);