const { STANDARD_SHIPPING, EXPRESS_SHIPPING } = require("./constants");
const generateOtp = require("./generate-otp");
const  {attachCookiesToResponse,verifyJWT } = require("./jwt");
const isOtpCreatedWithinLastMinute = require("./otp-time-checker");
const normalizePhoneNumber = require("./phone-checker");
const generateUserTokenDB = require("./userTokenDB");
const validateImage = require("./validate-image");
const validateRequiredFields = require("./validate-requiredFields");


module.exports={
    verifyJWT,
    attachCookiesToResponse,
    generateUserTokenDB,
    generateOtp,
    normalizePhoneNumber,
    isOtpCreatedWithinLastMinute,
    STANDARD_SHIPPING,
    EXPRESS_SHIPPING,
    validateImage,
    validateRequiredFields
    
}