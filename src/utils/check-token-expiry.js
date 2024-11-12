function willTokenExpireInOneMinute(tokenExpTime)
{
    const currentTime = Math.floor(Date.now() / 1000); 

    if (tokenExpTime - currentTime < 1 * 60) {
        return true;

    }
    return false;
    
}

module.exports=willTokenExpireInOneMinute;