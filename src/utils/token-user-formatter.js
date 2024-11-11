 function tokenUserFormatter(tokenUser)
{

    return {userId:tokenUser.userId,name:tokenUser.name,role:tokenUser.role,tokenVersion:tokenUser.tokenVersion};


}


module.exports=tokenUserFormatter;