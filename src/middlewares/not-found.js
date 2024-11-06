const { StatusCodes } = require("http-status-codes");

function notFoundMiddleware(req,res,next)
{
    res.status(StatusCodes.NOT_FOUND).send("Route does not exist");

}


module.exports=notFoundMiddleware;