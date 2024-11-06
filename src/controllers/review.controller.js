const { StatusCodes } = require("http-status-codes");
const Review = require("../models/Review");
const Product = require("../models/Product");
const checkPermission = require("../utils/check-permission");
const CustomAPIError = require("../errors");



async function httpCreateReview(req,res)
{
    const {product:productID}=req.body;

    req.body.user=req.user.userId;

    

    if(!productID)
        throw new CustomAPIError.BadRequestError("no found to reivew");


    const isValid=await Product.findById(productID);

    if(!isValid)
        throw new CustomAPIError.NotFoundError("No matching product");


    const isReviewed=await Review.findOne({
        product:productID,
        user:req.user.userId,
    });

    if(isReviewed)
        throw new CustomAPIError.BadRequestError("You have already reviewd this product");

    const review=await Review.create(req.body);


    res.status(StatusCodes.CREATED).json(review);




}

async function httpGetAllReviews(req,res)
{
    const reviews=await Review.find({});

    res.status(StatusCodes.OK).json({reviews,count:reviews.length});

}

async function httpGetSingleReview(req,res)
{   
    const {id:reviewID}=req.params;
    const review=await Review.findById(reviewID)
    .populate({path:'product',select:'name price company'})
    .populate({path:'user',select:'name'});

    if(!review)
        throw new CustomAPIError.NotFoundError("No matching review found");

    res.status(StatusCodes.OK).json({review});

    
}

async function httpUpdateReview(req,res)
{
    const {id:reviewID}=req.params;
    const {rating,title, comment}=req.body;
    let review=await Review.findById(reviewID);

    if(!review)
        throw new CustomAPIError.NotFoundError("No matching review found");

    review.rating=rating || review.rating;
    review.title=title || review.title;
    review.comment=comment || review.comment;

    await review.save();

    res.status(StatusCodes.OK).json({review});  

    
}

async function httpDeleteReview(req,res)
{
    const {id:reviewID}=req.params;
    const review=await Review.findById(reviewID);

    if(!review)
        throw new CustomAPIError.NotFoundError("No matching review found");


    checkPermission(req.user,review.user);

    await review.deleteOne();


    res.sendStatus(StatusCodes.OK);   
    
}

async function httpGetSingleProductReviews(req,res)
{
    const {id:productID}=req.params;

    const reviews=await Review.find({product:productID});

    res.status(StatusCodes.OK).json({reviews,count:reviews.length});
}



module.exports={
    httpCreateReview,
    httpGetAllReviews,
    httpGetSingleReview,
    httpUpdateReview,
    httpDeleteReview,
    httpGetSingleProductReviews
}