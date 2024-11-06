function isOtpCreatedWithinLastMinute(otp) {
    const currentTime = new Date();
    const oneMinuteAgo = new Date(currentTime.getTime() - 1 * 60 * 1000); // Current time minus 1 minute
    
    // Check if created time is greater than or equal to one minute ago

    if(otp.createdAt==otp.updatedAt)
        return otp.createdAt >= oneMinuteAgo;
    else
        return otp.updatedAt >=oneMinuteAgo;
}

module.exports=isOtpCreatedWithinLastMinute;