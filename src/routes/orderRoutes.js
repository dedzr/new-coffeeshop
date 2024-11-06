const { httpGetAllOrders, httpGetSingleOrder, httpGetCurrentUserOrders, httpCreateOrder, httpUpdateOrder, httpUpdateOrderAdmin, httpGetOrderByStatus } = require('../controllers/order.controller');
const { authenticateUser, authenticateRoles } = require('../middlewares/authentication');

const orderRouter=require('express').Router();




orderRouter.get('/',authenticateUser,authenticateRoles('admin','super-admin'),httpGetAllOrders);
orderRouter.get('/status',authenticateUser,authenticateRoles('admin','super-admin'),httpGetOrderByStatus);

orderRouter.get('/showAllMyOrders',authenticateUser,httpGetCurrentUserOrders);

orderRouter.post('/',authenticateUser, httpCreateOrder);

orderRouter.patch('/:id',authenticateUser,httpUpdateOrder);
orderRouter.patch('/admin/:id',authenticateUser,authenticateRoles('admin','super-admin'),httpUpdateOrderAdmin);


orderRouter.get('/:id',authenticateUser,httpGetSingleOrder);



module.exports=orderRouter;