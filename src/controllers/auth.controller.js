const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomError=require('../errors');
const { generateUserTokenDB, attachCookiesToResponse, generateOtp, normalizePhoneNumber, isOtpCreatedWithinLastMinute } = require("../utils");
const OTP=require('../models/Otp');

require('dotenv').config();

async function httpLogin(req,res)
{
    const {phoneNumber,password}=req.body;

    if(!phoneNumber || !password)
        throw new CustomError.BadRequestError("You must provide Phone Number and password");
 

    const user=await User.findOne({phoneNumber});

    if(!user)
        throw new CustomError.NotFoundError('User matching the Phone Number not found');

    if(!user.isVerified)
        throw new CustomError.BadRequestError("You have not verifed your phone number yet!");

    

    const passwordCheck=user.comparePassword(password);

    if (!passwordCheck)
        throw new CustomError.UnauthenticatedError("Invalid credentails");
        
    const userToken=generateUserTokenDB(user);

    attachCookiesToResponse(res,userToken);


    res.status(StatusCodes.OK).json(userToken);



    

}

async function httpRegister(req,res)
{
    const {name,password}=req.body;

    let {phoneNumber}=req.body;

    phoneNumber=normalizePhoneNumber(phoneNumber);

    console.log("triggered");

    if(!name || !phoneNumber || !password)
    {
        throw new CustomError.BadRequestError("Please provide name, Phone number and password");
    }


    const userExists=await User.findOne({phoneNumber});

    if(userExists)
    {
        console.log(userExists);
        throw new CustomError.BadRequestError("User already exists/verify your number");
    }

    
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + process.env.OTP_EXPIRY * 60 * 1000); // 10 minutes expiry
  

    const otpDoc = new OTP({ phoneNumber, otp, expiresAt: otpExpires });

    await otpDoc.save();


    const user=await User.create({name,phoneNumber,password});

    const userToken=generateUserTokenDB(user);

    attachCookiesToResponse(res,userToken);
    res.status(StatusCodes.CREATED).json({userToken,otp});
    
}

async function httpVerifyOtp(req,res)
{
    let { phoneNumber } = req.body;

    const {otp}=req.body;
    
    phoneNumber=normalizePhoneNumber(phoneNumber);

    if(!phoneNumber || !otp)
    {
        throw new CustomError.BadRequestError("Please provide phone number and otp");
    }

    const otpDoc = await OTP.findOne({ phoneNumber, otp });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  
    // Mark user as verified
    await User.updateOne({ phoneNumber }, { isVerified: true });
  
    // Delete OTP record after verification
    await OTP.deleteOne({ _id: otpDoc._id });
  
    res.status(200).json({ message: 'OTP verified successfully' });
     
}

async function httpResendOtp(req,res)
{
    let { phoneNumber } = req.body;

    phoneNumber=normalizePhoneNumber(phoneNumber);


    const user = await User.findOne({ phoneNumber });
    if (!user)
        throw new CustomError.NotFoundError("User not found"); 

    const otpExists=await OTP.findOne({phoneNumber});

    const otp = generateOtp();

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    if(otpExists)
    {
        const otpResendCondition=isOtpCreatedWithinLastMinute(otpExists);

        if(!otpResendCondition)
        {
            await otpExists.updateOne({otp:otp,expiresAt:otpExpires},{upsert:true});
        }
        else
        {
            throw new CustomError.BadRequestError("You must wait 1 minute before sending OTP again");
        }
    }
    else
    {
          
        const otpDoc = new OTP({ phoneNumber, otp, expiresAt: otpExpires });

        await otpDoc.save();

    }

  
    res.status(StatusCodes.OK).json({ otp });
}

async function httpCreateAdmin(req,res)
{
    const { name, password } = req.body;
    let {phoneNumber}=req.body;

    if(!name || !phoneNumber || !password)
    {
        throw new CustomError.BadRequestError("Must provide name, phone number and password");
    }
    phoneNumber=normalizePhoneNumber(phoneNumber);

    const userExists = await User.findOne({ phoneNumber });
    if (userExists)
        throw new CustomError.BadRequestError("User already exists");

    const user = new User({
        name,
        phoneNumber,
        password,
        role: 'admin' // Explicitly set as 'admin'
    });

    await user.save();

    res.status(StatusCodes.CREATED).json({ user });

}

function httpLogout(req,res)
{


    if(!req.signedCookies.Token)
        throw new CustomError.BadRequestError("You must be logged in to sign out");

    
    res.cookie('cookie','logout',{maxAge:1000*5});

    res.status(StatusCodes.OK).json({msg:'user logged out'});
    
}

module.exports={
    httpLogin,
    httpRegister,
    httpLogout,
    httpVerifyOtp,
    httpResendOtp,
    httpCreateAdmin
}