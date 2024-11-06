const userRouter=require('express').Router();

const { httpGetAllUsers, httpGetSingleUser, httpShowCurrentUser, httpUpdateUser, httpUpdateUserPassword, httpUpdateUserRole, httpGetAllUsersExceptAdmin } =require('../controllers/user.controller');
const { authenticateUser, authenticateRoles }=require('../middlewares/authentication');


userRouter.get('/normal',authenticateUser,authenticateRoles('admin','super-admin'),httpGetAllUsersExceptAdmin);
userRouter.get('/all',authenticateUser,authenticateRoles('admin','super-admin'),httpGetAllUsers);

userRouter.get('/showMe',authenticateUser,httpShowCurrentUser);
userRouter.patch('/updateUser-role',authenticateUser,authenticateRoles('admin','super-admin'),httpUpdateUserRole);
userRouter.patch('/updateUser',authenticateUser,httpUpdateUser);
userRouter.patch('/updatePassword',authenticateUser,httpUpdateUserPassword);
userRouter.get('/:id',authenticateUser,httpGetSingleUser);




module.exports=userRouter;