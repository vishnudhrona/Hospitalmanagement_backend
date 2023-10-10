var express = require('express');
const cors = require("cors");
var router = express.Router();
var user = require('../models/user')
var userControllers = require('../controllers/userController')
const { autherizeRole, signUser } = require('../middlewares/jwt')
/* GET home page. */
router.post('/signup',userControllers.userSignup)
router.post('/otpverification', userControllers.otpVerification)
router.post('/userlogin', userControllers.userLogin)
router.post('/userforgotpassword',userControllers.forgotPassword)
router.post('/userforgotpasswordconfirm',userControllers.forgotPasswordConfirm)

module.exports = router;
