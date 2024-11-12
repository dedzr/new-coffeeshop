
const { verifyJWT, attachCookiesToResponse, willTokenExpireInOneMinute } = require('../utils');
const CustomAPIError = require('../errors');
const tokenUserFormatter = require('../utils/token-user-formatter');
const User = require('../models/User');

async function authenticateUser(req,res,next)
{

    const token=req.signedCookies.Token;


    if(!token)
        throw new CustomAPIError.UnauthenticatedError('You are not logged in');

    else
    {
        try {
            const verifedToken=verifyJWT(token);

            const user=await User.findById(verifedToken.userId);

            if(!user || user.tokenVersion!==verifedToken.tokenVersion)
            {
                throw new CustomAPIError.UnauthenticatedError("Invalid credentials");
            }

    
            req.user=tokenUserFormatter(verifedToken);
           

            const tokenExpTime = verifedToken.exp;

            if (willTokenExpireInOneMinute(tokenExpTime)) {
               attachCookiesToResponse(res,req.user);
            }

            next();
        

            
        } catch (error) {

            throw new CustomAPIError.UnauthenticatedError("Invalid credentails");
            
        }
    }
       


}

function authenticateRoles(...roles)
{
    return (req,res,next) =>
    {
 
        if(!roles.includes(req.user.role))
        {
            throw new CustomAPIError.UnauthorizedError("Unauthorized access to this route");

        }
        else
        {
            next();
        }
    }

}





module.exports={
    authenticateUser,
    authenticateRoles,
}

