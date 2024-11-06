const { httpLogin, httpLogout, httpRegister, httpVerifyOtp, httpResendOtp, httpCreateAdmin } = require('../controllers/auth.controller');
const { authenticateRoles, authenticateUser } = require('../middlewares/authentication');

const authRouter=require('express').Router();




authRouter.post('/login',httpLogin);
authRouter.post('/register',httpRegister);
authRouter.post('/verify-otp',httpVerifyOtp);
authRouter.post('/resend-otp',httpResendOtp);
authRouter.post('/create-admin',authenticateUser,authenticateRoles('super-admin'),httpCreateAdmin);
authRouter.get('/logout',httpLogout);




module.exports=authRouter;