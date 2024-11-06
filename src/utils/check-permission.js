const {UnauthorizedError } = require("../errors")

function checkPermission(reqUser,resourceId)
{

    if(reqUser.role=='admin')
        return
    if(reqUser.userId==resourceId.toString())
        return
    throw new UnauthorizedError('you do not have access to this route');



}

module.exports=checkPermission;