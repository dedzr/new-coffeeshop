const authRouter = require('./routes/authRoutes');
const orderRouter = require('./routes/orderRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const userRouter = require('./routes/userRoutes');

const apiRouter=require('express').Router();


apiRouter.use('/auth',authRouter);
apiRouter.use('/users',userRouter);
apiRouter.use('/products',productRouter);
apiRouter.use('/reviews',reviewRouter);
apiRouter.use('/orders',orderRouter);


module.exports=apiRouter;