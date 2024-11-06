const path=require('path');
const cors=require('cors');
const helmet=require('helmet');
const xss=require('xss');
require('express-async-errors');
const express=require('express');
const morgan = require('morgan');
const apiRouter = require('./api');
const cloudinary=require('cloudinary').v2;
const cookieParser=require('cookie-parser');
const fileUpload=require('express-fileupload');
const rateLimiter=require('express-rate-limiter');
const mongoSanitize=require('express-mongo-sanitize');
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');



require('dotenv').config();


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
});



const app=express();

app.set('trust proxy',1);
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());


app.use(fileUpload({useTempFiles:true}));
app.use(morgan('combined'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname,'public')));

// app.use('/api/v1',(req,res)=>{
//     console.log(req.signedCookies);
//     res.send(req.signedCookies);
// });


app.use('/api/v1',apiRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


module.exports=app;








