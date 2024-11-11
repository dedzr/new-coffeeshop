

function generateUserTokenDB(user)
{
    return {userId:user._id,name:user.name,role:user.role,tokenVersion:user.tokenVersion};
}


module.exports=generateUserTokenDB;