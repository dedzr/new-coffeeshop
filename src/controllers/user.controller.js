const CustomAPIError = require('../errors/');
const User=require('../models/User');
const {StatusCodes}=require('http-status-codes');
const checkPermission = require('../utils/check-permission');
const { normalizePhoneNumber, attachCookiesToResponse, generateUserTokenDB } = require('../utils');

async function httpGetAllUsersExceptAdmin(req,res)
{
    const users=await User.find({role:'user'}).select('-password -__v');

    res.status(StatusCodes.ACCEPTED).json(users);

}

async function httpGetAllUsers(req,res)
{
    const users=await User.find().select('-password -__v');

    res.status(StatusCodes.ACCEPTED).json(users);

}

async function httpGetSingleUser(req,res)
{
    const {id}=req.params;
    const user=await User.findOne({_id:id},{password:0,__v:0});
    if(!user)
        throw new CustomAPIError.BadRequestError("user not found");

    checkPermission(req.user,user._id);
    res.status(StatusCodes.ACCEPTED).json(user);
    

}

function httpShowCurrentUser(req,res)
{
    if(!req.user)
        throw new CustomAPIError.UnauthenticatedError("you are not logged in");
    else
    {
        res.status(StatusCodes.OK).json({user:req.user});
    }
    

}


async function httpUpdateUser(req,res)
{
    const {name}=req.body;
   
    if(!name)
    {
        throw new ("Please provide some value to change");
    }

    const user=await User.findOneAndUpdate({_id:req.user.userId},{name},{new:true,runValidators:true}).select('-password -__v');

    const userToken=generateUserTokenDB(user);

    attachCookiesToResponse(res,userToken);


    if(!user)
        throw new CustomAPIError.UnauthenticatedError("Invalid credentials");

    res.status(StatusCodes.OK).json(user);
    
    

}



async function httpUpdateUserPassword(req,res)
{
    const {oldPassword,newPassword}=req.body;

    if(!oldPassword || !newPassword)
        throw new CustomAPIError.BadRequestError('You did not provide password');
    else
    {
        const user=await User.findById(req.user.userId);


        if(!user)
            throw new CustomAPIError.BadRequestError("No user found")

        const passwordCheck=user.comparePassword(oldPassword);

        if(!passwordCheck)
        {
            throw new CustomAPIError.UnauthenticatedError("invalid credentails");
            
        }
        else
        {
            user.password=newPassword;
            await user.save();
            res.sendStatus(StatusCodes.OK);
           
        }
 
    }

}

async function httpUpdateUserRole(req,res) {

    const { userId, role } = req.body;

  // Additional checks to prevent assigning admin role freely
    if (role !== 'user' && role !== 'admin') {
       throw new CustomAPIError.BadRequestError("You must assign user or admin");
    }

  const user=await User.findByIdAndUpdate(userId, { role },{new:true,runValidators:true}).select('name role id');
  res.status(StatusCodes.OK).json({user});

    
}



module.exports={
    httpGetAllUsersExceptAdmin,
    httpGetAllUsers,
    httpGetSingleUser,
    httpShowCurrentUser,
    httpUpdateUser,
    httpUpdateUserPassword,
    httpUpdateUserRole,
};