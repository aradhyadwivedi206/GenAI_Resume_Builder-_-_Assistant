const {Router} =require('express')

const authController=require("../controllers/auth.controller")

const authMiddleware=require("../middleware/auth.middleware")

const authRouter=Router()




/**
 * @route POsT/api/auth/register
 * @description register a new user
 * @access Public
 */

authRouter.post("/register",authController.registerUserController)
/**
 * @route POsT/api/auth/login
 * @description  login a user with email and password
 * @access Public
 */
authRouter.post("/login",authController.loginUserController)

/**
 * @route get/api/auth/logout
 * @description  clear token from user cookie and add token from balcklist
 * @access Public
 */

authRouter.get("/logout",authController.logoutUserController)

/**
 * @route get /api/auth/get-me
 * @description  get the current loogged in user details
 * @access Private
 */

authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)
module.exports=authRouter