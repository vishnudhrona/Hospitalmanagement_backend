var express = require("express");
const cors = require("cors");
var router = express.Router();
var user = require('../models/user')
var adminHelpers = require('../helpers/adminHelpers')
const {signUser, signDoctor, autherizeRole} = require('../middlewares/jwt')

const adminCredential = {
    number : "8089445128",
    password : "123456"
}

let adminLogin = async (req, res) => {
    let response = {}
    console.log(req.body,'adminlogin detailsssss');
    try {
        if(req.body.formData.number === adminCredential.number && req.body.formData.password === adminCredential.password) {
            console.log('hai i am admin');
            response.status = true
            res.status(200).json({ message : 'Admin login successfully', response })
        } else {
            response.status = false
            res.status(200).json({ error : 'incorrect credentials', response })
        }
    } catch(err) {
        console.error(err,'admin login error');
    }

}

let getUser = (req, res) => {
    try {
        adminHelpers.getAllUsers().then((users) => {
            console.log(users,'i get all users from my database');
            if(users) {
                res.status(200).json({ users : users })
            }
        })
    } catch(err) {
        console.error(err);
    }
}

let blockUser = (req, res) => {
    let userId = req.query.userId
    console.log(userId,'reqqqqqqqqqqqqqq');
    try {
        adminHelpers.blockUser(userId).then((status) => {
            console.log(status,'bvbvbvbvbvbvbv');
            if(status === "block") {
                res.status(200).json({ message : 'User is blocked', status })
            }
        })
    } catch(err) {
        console.error(err,'block user error');
    }
    
}

let unblockUser = (req, res) => {
    let userId = req.query.userId
    console.log(userId,'zzzzzzzzzzzzzz');
    try {
        adminHelpers.unblockUser(userId).then((status) => {
            console.log(status,'errrrrrrrrrrrrrrr');
            if(status === "unblock") {
                res.status(200).json({ message : 'user is Unblocked', status})
            }
        })
    } catch(err) {
        console.error(err,'unblock user error');
    }
    
}

let doctorManagement = (req, res) => {
    console.log('fuck');
    try {
        adminHelpers.getAllDoctors().then((doctors) => {
            console.log(doctors,'rtuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
            if(doctors) {
                res.status(200).json({ doctors : doctors })
            }
        })
    } catch(err) {
        console.error(err);
    }
}

let doctorApproval = (req, res) => {
    let doctorId = req.query.doctorId
    try {
        adminHelpers.doctorApproval(doctorId).then((status) => {
            res.status(200).json({ status : status })
        })
    } catch(err) {
        console.error(err,'jkjkjkjkjk');
    }
    console.log(doctorId,'byubyubyubyu');
}

let doctorInterdict = (req, res) => {
    let doctorId = req.query.doctorId
    console.log(doctorId,'gygygygygygygygygy'); 
    try {
        adminHelpers.doctorInterdict(doctorId).then((status) => {
            console.log(status,'byyyyyyyyyyyyyyyyuuuuuuu');
            res.status(200).json({ status : status })
        })
    } catch(err) {
        console.error(err,'qsdqsddddddddddddd');
    }
}



module.exports = {
    adminLogin,
    getUser,
    blockUser,
    unblockUser,
    doctorManagement,
    doctorApproval,
    doctorInterdict,
}