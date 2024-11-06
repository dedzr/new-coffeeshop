
const { verifyJWT, createTokenUser, attachCookiesToResponse } = require('../utils');
const CustomAPIError = require('../errors');
const tokenUserFormatter = require('../utils/token-user-formatter');

function authenticateUser(req,res,next)
{

    const token=req.signedCookies.Token;


    if(!token)
        throw new CustomAPIError.UnauthenticatedError('You are not logged in');

    else
    {
        try {
            const verifedToken=verifyJWT(token);

    
            req.user=tokenUserFormatter(verifedToken);
           

            const currentTime = Math.floor(Date.now() / 1000); 
            const tokenExpTime = verifedToken.exp;


            if (tokenExpTime - currentTime < 1 * 60) { // Less than 1 minutes to expire
                // Generate a new token
                console.log("new token");
               attachCookiesToResponse(res,req.user);

            }

            next();
        

            
        } catch (error) {

            console.log(error);
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

