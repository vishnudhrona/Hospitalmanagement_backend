var express = require('express');
const cors = require("cors");
var router = express.Router();
var user = require('../models/user')
var adminControllers = require('../controllers/adminController')
const { autherizeRole, signUser } = require('../middlewares/jwt')

router.post('/adminlogin',adminControllers.adminLogin)
router.get('/usermanagement', adminControllers.getUser)
router.get('/userblock', adminControllers.blockUser)
router.get('/userunblock', adminControllers.unblockUser)
router.get('/doctormanagement',adminControllers.doctorManagement)
router.get('/doctorapproval',adminControllers.doctorApproval)


module.exports = router;