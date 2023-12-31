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
router.post('/doctorbooking',userControllers.doctorBooking)
router.get('/getspeciality',userControllers.getSpeciality)
router.post('/sortdoctor', userControllers.sortDoctor)
router.post('/searchdoctor', userControllers.searchDoctor)
router.get('/usersidetimeschedule', userControllers.fetchUserSideSchedule)
router.get('/timeslots', userControllers.fetchTimeDetailse)
router.post('/userbookingslots', userControllers.userBookedSlots)
router.get('/fetchpaymentdetails', userControllers.fetchPaymentDetails)
router.post('/userpayment', userControllers.razorPayment)
router.post('/verifypayment', userControllers.verifyPayment)
router.get('/landingpagefetchDoctors', userControllers.landingPageFetchDoctors)
router.post('/resendotp', userControllers.resendOtp)
router.post('/signupresendotp', userControllers.signupResendOtp)


module.exports = router;
