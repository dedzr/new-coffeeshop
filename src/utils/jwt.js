const jwt=require('jsonwebtoken');
require('dotenv').config();

function createJWT(user) {


    return jwt.sign({userId:user.userId,name:user.name,role:user.role,tokenVersion:user.tokenVersion},process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME});
}

function verifyJWT(token)
{
    return jwt.verify(token,process.env.JWT_SECRET)

}

function attachCookiesToResponse(res,user)
{
    const token=createJWT(user);

    res.cookie('Token',token,{maxAge:1000*60*5,httpOnly:true,signed:true,});
}

module.exports={
    createJWT,
    verifyJWT,
    attachCookiesToResponse
}


