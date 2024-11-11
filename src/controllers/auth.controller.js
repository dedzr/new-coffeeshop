const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const OTP = require('../models/Otp');
const CustomError = require('../errors');
const {
  generateUserTokenDB,
  attachCookiesToResponse,
  generateOtp,
  normalizePhoneNumber,
  isOtpCreatedWithinLastMinute,
  validateRequiredFields
} = require("../utils");

require('dotenv').config();


async function httpLogin(req, res) {
  const { phoneNumber, password } = req.body;
  validateRequiredFields(['phoneNumber', 'password'], req.body);

  const user = await User.findOne({ phoneNumber: normalizePhoneNumber(phoneNumber) });
  if (!user || !user.comparePassword(password)) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  if (!user.isVerified) {
    throw new CustomError.BadRequestError("Phone number not verified");
  }

  const userToken = generateUserTokenDB(user);
  attachCookiesToResponse(res, userToken);
  res.status(StatusCodes.OK).json({ userToken });
}

async function httpRegister(req, res) {
  const { name, password, phoneNumber: rawPhone } = req.body;
  validateRequiredFields(['name', 'password', 'phoneNumber'], req.body);

  const phoneNumber = normalizePhoneNumber(rawPhone);
  const userExists = await User.findOne({ phoneNumber });
  if (userExists) throw new CustomError.BadRequestError("User already exists or not verified");

  const otp = generateOtp();
  await OTP.updateOne(
    { phoneNumber },
    { otp, expiresAt: Date.now() + process.env.OTP_EXPIRY * 60000 },
    { upsert: true }
  );

  const user = await User.create({ name, phoneNumber, password });
  const userToken = generateUserTokenDB(user);

  attachCookiesToResponse(res, userToken);
  res.status(StatusCodes.CREATED).json({ userToken, otp });
}

async function httpVerifyOtp(req, res) {
  const { phoneNumber: rawPhone, otp } = req.body;
  validateRequiredFields(['phoneNumber', 'otp'], req.body);

  const phoneNumber = normalizePhoneNumber(rawPhone);
  const user = await User.findOne({ phoneNumber });
  if (user.isVerified) throw new CustomError.BadRequestError("Already verified");

  const otpDoc = await OTP.findOne({ phoneNumber, otp });
  if (!otpDoc || otpDoc.expiresAt < Date.now()) {
    throw new CustomError.BadRequestError("Invalid or expired OTP");
  }

  await User.updateOne({ phoneNumber }, { isVerified: true });
  await OTP.deleteOne({ _id: otpDoc._id });
  res.status(StatusCodes.OK).json({ message: 'OTP verified successfully' });
}

async function httpResendOtp(req, res) {
  const { phoneNumber: rawPhone } = req.body;
  const phoneNumber = normalizePhoneNumber(rawPhone);

  const user = await User.findOne({ phoneNumber });
  if (!user) throw new CustomError.NotFoundError("User not found");
  if (user.isVerified) throw new CustomError.BadRequestError("Already verified");

  const otpDoc = await OTP.findOne({ phoneNumber });
  if (otpDoc && isOtpCreatedWithinLastMinute(otpDoc)) {
    throw new CustomError.BadRequestError("Please wait 1 minute to resend OTP");
  }

  const otp = generateOtp();
  await OTP.updateOne(
    { phoneNumber },
    { otp, expiresAt: Date.now() + 10 * 60000 },
    { upsert: true }
  );

  res.status(StatusCodes.OK).json({ otp });
}

async function httpCreateAdmin(req, res) {
  const { name, password, phoneNumber: rawPhone } = req.body;
  validateRequiredFields(['name', 'password', 'phoneNumber'], req.body);

  const phoneNumber = normalizePhoneNumber(rawPhone);
  const userExists = await User.findOne({ phoneNumber });
  if (userExists) throw new CustomError.BadRequestError("User already exists");

  const user = await User.create({
    name, phoneNumber, password, isVerified: true, role: 'admin'
  });
  res.status(StatusCodes.CREATED).json({ user });
}

function httpLogout(req, res) {
  if (!req.signedCookies.Token) {
    throw new CustomError.BadRequestError("You must be logged in to log out");
  }

  res.clearCookie('Token', { httpOnly: true });
  res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
}

module.exports = {
  httpLogin,
  httpRegister,
  httpVerifyOtp,
  httpResendOtp,
  httpCreateAdmin,
  httpLogout
};
