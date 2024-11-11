const { httpCreateProduct, httpGetAllProducts, httpGetSingleProduct, httpUpdateProduct, httpDeleteProduct, httpUploadImage, httpSearchProduct } = require('../controllers/product.controller');
const { httpGetSingleProductReviews } = require('../controllers/review.controller');
const { authenticateUser, authenticateRoles } = require('../middlewares/authentication');

const productRouter=require('express').Router();




productRouter.get('/',httpGetAllProducts);
productRouter.post('/',authenticateUser,authenticateRoles('admin','super-admin'),httpCreateProduct);
productRouter.get('/search',authenticateUser,httpSearchProduct);
productRouter.patch('/:id',authenticateUser,authenticateRoles('admin','super-admin'),httpUpdateProduct);
productRouter.delete('/:id',authenticateUser,authenticateRoles('admin','super-admin'),httpDeleteProduct);
productRouter.post('/uploadImage',authenticateUser,authenticateRoles('admin','super-admin'),httpUploadImage);

productRouter.get('/:id',httpGetSingleProduct);

productRouter.get('/:id/reviews',httpGetSingleProductReviews);


module.exports=productRouter;