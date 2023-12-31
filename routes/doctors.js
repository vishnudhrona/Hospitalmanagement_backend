var express = require('express');
const cors = require("cors");
var router = express.Router();
var user = require('../models/user');
var multer = require('multer');
var doctorControllers = require('../controllers/doctorControllers')
const { autherizeRole, signUser } = require('../middlewares/jwt')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/doctorsignup',doctorControllers.doctorSignup)
router.post('/docotpverification',doctorControllers.doctorOtpVerification)
router.post('/doctorlogin', doctorControllers.doctorLogin)
router.post('/uploadprofile',upload.single('image'),doctorControllers.doctorAddProfile)
router.get('/fetchdoctorprofile',autherizeRole('doctor'), doctorControllers.fetchDoctorProfile)
router.post('/timeschedule',autherizeRole('doctor'), doctorControllers.doctorTimeschedule)
router.get('/fetchtimeschedule', doctorControllers.fetchDoctorTimeSchedule)
router.get('/fetchbookingdetails', doctorControllers.fetchBookingDetails)
router.get('/invitingpatient',doctorControllers.invitingPatient)

module.exports = router;

