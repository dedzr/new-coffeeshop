const { httpGetAllReviews, httpGetSingleReview, httpCreateReview, httpUpdateReview,httpDeleteReview} = require('../controllers/review.controller');
const { authenticateUser } = require('../middlewares/authentication');

const reviewRouter=require('express').Router();


reviewRouter.post('/',authenticateUser,httpCreateReview);
reviewRouter.get('/',httpGetAllReviews);
reviewRouter.get('/:id',httpGetSingleReview);
reviewRouter.patch('/:id',authenticateUser,httpUpdateReview);
reviewRouter.delete('/:id',authenticateUser,httpDeleteReview);




module.exports=reviewRouter;