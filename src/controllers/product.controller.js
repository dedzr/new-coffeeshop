const fs=require('fs');

const cloudinary=require('cloudinary').v2;
const CustomAPIError = require("../errors");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");



async function httpSearchProduct(req,res)
{
    const {query}=req.query;

    if(!query)
        throw new CustomAPIError.BadRequestError("You must provide a search parameter");

    const regex = new RegExp(query, 'i'); 

    const products=await Product.find({$or:[{name:regex}]},{name:1}).limit(5);

    console.log(products);

    res.status(StatusCodes.OK).json({products});


}



async function httpCreatePorduct(req,res)
{

    req.body.user=req.user.userId;

    
    const product=await Product.create(req.body);

    res.status(StatusCodes.CREATED).json(product);


}

async function httpGetAllProducts(req,res)
{
    const products= await Product.find({});
    
    res.status(StatusCodes.OK).json({products,count:products.length});

}

async function httpGetSingleProduct(req,res)
{

    const {id:productID}=req.params;

    const product=await Product.findById(productID);

    if(!product)
        throw new CustomAPIError.NotFoundError("Product not found");

    res.status(StatusCodes.OK).json({product});
 
}



async function httpUpdateProduct(req,res)
{
    const {id:productID}=req.params;



    const product= await Product.findById(productID);

     await product.updateOne(req.body,{new:true,runValidators:true});
    
    
    if(!product)
        throw new CustomAPIError.NotFoundError("Product not found");

    const productUpdated={
        ...product._doc,
        ...req.body,
    }



    res.status(StatusCodes.OK).json({product:productUpdated});
}

async function httpDeleteProduct(req,res)
{
    
    const {id:productID}=req.params;


    const product= await Product.findById(productID);
    
    
    if(!product)
        throw new CustomAPIError.NotFoundError("Product not found");



    await product.deleteOne();
    res.sendStatus(StatusCodes.OK);
    
}
async function httpUploadImage(req,res)
{
    if(!req.files)
        throw new CustomAPIError.BadRequestError("No Image uploaded");

 
    const productImage=req.files.image;

    if(!productImage.mimetype.startsWith('image'))
        throw new CustomAPIError.BadRequestError("You must upload a image");


    const maxSize=1024*1024;

    if(productImage.size>maxSize)
        throw new CustomAPIError.BadRequestError("Max size of image must be 1MB");

    const result=await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
            use_filename:true,
            folder:'coffee-shop',
        }
    )

    fs.unlinkSync(req.files.image.tempFilePath);


    res.status(StatusCodes.CREATED).json({image:{src:result.secure_url,publicID:result.public_id}});
 
    
}


module.exports={
    httpCreatePorduct,
    httpGetAllProducts,
    httpGetSingleProduct,
    httpUpdateProduct,
    httpDeleteProduct,
    httpUploadImage,
    httpSearchProduct
}
