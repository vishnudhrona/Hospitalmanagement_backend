var db = require('../config/connection')
const bcrypt = require('bcrypt');
const env = require('dotenv').config({path: __dirname + '/../.env'})
var temporaryDoctor = require('../models/temporaryDoctor')
var Doctor = require('../models/doctor')
var User = require('../models/user')
const { Vonage } = require('@vonage/server-sdk');
const { signUser } = require('../middlewares/jwt');
var temporaryDoctor = require('../models/temporaryDoctor');
const nodemailer = require("nodemailer");



const getAllUsers = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let users = await User.find()
            console.log(users,'tyqwerrrrrrrrrr');
            users.forEach((user) => {
                user.password = undefined
            })
            resolve(users)
        } catch(err) {
            console.log(err);
            reject(err)
        }
    })
}

let blockUser = (userId) => {
 return new Promise(async(resolve, reject) => {
    try {
        let blockUser = await User.findByIdAndUpdate(userId, { signupStatus : "block" }, { new : true })
        blockUser = blockUser.toObject()
        console.log(blockUser.signupStatus,'aaaaaaAAAAAAAAAA');
        resolve(blockUser.signupStatus)
    } catch(err) {
        console.error(err,'mjmjmjmjmj');
    }
    
 })
}

let unblockUser = (userId) => {
    return new Promise(async(resolve, reject) => {
        try {
            let unblockUser = await User.findByIdAndUpdate(userId, { signupStatus : "unblock" }, { new : true })
        unblockUser = unblockUser.toObject()
        console.log(unblockUser.signupStatus,'tttttvvvvv');
        resolve(unblockUser.signupStatus)
        } catch(err) {
            console.error(err,'njnjnjnjnjnjn');
        }
        
    })
}

let getAllDoctors = () => {
    return new Promise((resolve, reject) => {
        try {
            Doctor.find().then(async(doctors) => {
                console.log(doctors,'igot doc')
                doctors.forEach((doctor) => {
                    doctor.password = undefined
                })
                resolve(doctors)
            })
        } catch(err) {
            console.error(err,'ghgh');
        }
        
    })
}

let doctorApproval = (doctorId) => {
    return new Promise(async(resolve, reject) => {
        try {
         await Doctor.findByIdAndUpdate(doctorId, { signupStatus : "Approved" }, { new : true }).then(async(approvedDoctor) => {
             approvedDoctor = await approvedDoctor
             console.log(approvedDoctor,'guattttt');
                if(approvedDoctor.signupStatus === "Approved") {
                    console.log('why did not get email');
                    const transporter = nodemailer.createTransport({
                        host: "forward-email=centaurr252@gmail.com",
                        port: 465,
                        secure: true,
                        service: 'Gmail',
                        auth: {
                          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                          user: 'centaurr252@gmail.com',
                          pass: 'nuslvzvfidhqyjrr',
                        },
                      });


                      async function main() {
                          // send mail with defined transport object
                          const info = await transporter.sendMail({
                              from: 'centaurr252@gmail.com', // sender address
                              to: approvedDoctor.email, // list of receivers
                          subject: "Hello ✔", // Subject line
                          text: "Hello world?", // plain text body
                          html: "<b>Hello world?</b>", // html body
                        });
                        console.log('this is working');
                      
                        console.log("Message sent: %s", info.messageId);
                        
                      }
                      
                      main().catch(console.error);


                }
                resolve(approvedDoctor.signupStatus)
            })
        } catch(err) {
            console.error(err,'vtvtvtv');
        }
    })
}

let doctorInterdict = (doctorId) => {
    return new Promise(async(resolve, reject) => {
        try {
           await Doctor.findByIdAndUpdate(doctorId, {signupStatus : 'Interdict'}, { new : true }).then(async(interdictDoctor) => {
            interdictDoctor = await interdictDoctor
                console.log(interdictDoctor.signupStatus,'tyuuuuuuuxxxxxxxx');
                if(interdictDoctor.signupStatus === "Interdict") {
                    console.log('its inderdicttt');
                    const transporter = nodemailer.createTransport({
                        host: "forward-email=centaurr252@gmail.com",
                        port: 465,
                        secure: true,
                        service: 'Gmail',
                        auth: {
                          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                          user: 'centaurr252@gmail.com',
                          pass: 'nuslvzvfidhqyjrr',
                        },
                      });


                      async function main() {
                          // send mail with defined transport object
                          const info = await transporter.sendMail({
                              from: 'centaurr252@gmail.com', // sender address
                              to: interdictDoctor.email, // list of receivers
                          subject: "Hello ✔", // Subject line
                          text: "Hello world?", // plain text body
                          html: "<b>Hello world?</b>", // html body
                        });
                        console.log('this is working');
                      
                        console.log("Message sent: %s", info.messageId);
                        
                      }
                      
                      main().catch(console.error);

                      resolve(interdictDoctor.signupStatus)
                }
            })
        } catch(err) {
            console.error(err,'tyhtyhtyhhhhhhhhhh');
        }
    })
}

module.exports = {
    getAllUsers,
    blockUser,
    unblockUser,
    getAllDoctors,
    doctorApproval,
    doctorInterdict,
}