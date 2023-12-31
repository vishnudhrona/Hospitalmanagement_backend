var db = require('../config/connection')
const bcrypt = require('bcrypt');
const env = require('dotenv').config({path: __dirname + '/../.env'})
var User = require('../models/user')
var temporaryUser = require('../models/temporaryUser')
var DoctorProfile = require('../models/doctorProfile')
var Doctor = require('../models/doctor')
var DoctorTime = require('../models/docScheduledTime')
const BookingSlot = require('../models/bookingSlot')
const BookingDetails = require('../models/bookingDetails')
const { signUser } = require('../middlewares/jwt');
const Razorpay = require('razorpay');


var instance = new Razorpay({ 
    key_id: process.env.key_id, 
    key_secret: process.env.key_secret 
})


const accountSid = process.env.accountSID
const authToken = process.env.authToken
const serviceSID = "VAe42f5796539e7ae82e0a2a4e4f53596f"
const client = require("twilio")(accountSid, authToken);


const userSignup = async (userData) => {
    let user = null
    try {
        if(!userData.formData.password) {
            return res.status(400).json({ error : "Password is required"});
        }
        userData.formData.password = await bcrypt.hash(userData.formData.password, 10)
        user = await temporaryUser.create(userData.formData)
        console.log(user,'user added in database');
        if (user) {
            console.log('otp verification start');
          client.verify.v2
            .services(serviceSID)
            .verifications.create({
              to: `+91${userData.formData.number}`,
              channel: "sms",
            })
            .then((verifications) => {
              console.log(verifications, "hey this is the verification");
            })
            .catch((err) => {
              console.log(err, "bnbnbnbnbnbnbnbn");
            });
        }
        
    } catch(err) {
        console.error(err,'yyyyyyyyyyyyy');
    }
    
    return { user }
}

const otpVerification = async(otpDetails, res) => {

   try {
    const {otp, number} = otpDetails
    if(otp) {
        let otpVerifiedStatus = "";
        console.log(otp,number,'iiiiiiiiiiooooooooooooooooo');
    
        const verification_check = await client.verify.v2
        .services(serviceSID)
        .verificationChecks.create({ to: `+91${number}`, code: otp })
            otpVerifiedStatus = verification_check.status
            console.log(otpVerifiedStatus,'bbbbbbrrrrrrr')
       
        if(otpVerifiedStatus === "approved") {
            let user = await temporaryUser.findOne({number : number})
            if(!user) {
                return res.status(404).json({ error : "Verification Timeout" })
            }
            let newPatient = new User(user.toObject())
            newPatient.signupStatus = 'unblock';
            let patient = await newPatient.save()
            patient = patient.toObject()
            delete patient.password
            let tempUser = await temporaryUser.deleteOne({ number : number })
            console.log(tempUser,'temporary user deleted');
    
            return {otpVerifiedStatus, patient}
        }else {
            console.log(otpVerifiedStatus,'eeeeeeeeeerrrrrrr');
            return otpVerifiedStatus
        }
    } else {
        res.status(400).json({ error : "No Otp entered" })
    }
   
   } catch (err) {
     console.error(err);
   }
}

const userLogin = (loginCredentials) => {
    return new Promise(async(resolve, reject) => {
        let response = {};
        console.log(loginCredentials.formData.number,'qgqgqgqgqgqgqgqgqgqgqgqgqg');
        let user = await User.findOne({ number : loginCredentials.formData.number })
        if(!user) {
            resolve({status : 'nouser'})
        } else {
            user = await user.toObject()
        console.log(user,'tytyytytytytytytytyt');
        }
        
        if(user) {
            bcrypt.compare(loginCredentials.formData.password, user.password).then((status) => {
                console.log(status,'qwvcfghhhhhhhhhhhhhh');
                delete user.password
                if(status) {
                    response.user = user
                    response.status = "unblock"
                    resolve(response);
                } else {
                    resolve({ status : "block" })
                }
            })
        } else {
            resolve({ status : "block" })
        }
    })
}

const forgotPassword = (number) => {
        console.log(number,'i got password otp send number');
        return new Promise(async(resolve, reject) => {
            let response = {}
            try{
                let user = await User.findOne({ number : number.formData.number })
            user = await user.toObject() 
            console.log(user,'hythtyhtyhyttttt');

            if(user) {
                let userNumber = user.number
                response.status = true
                response.number = userNumber
                console.log('otp verification start');
              client.verify.v2
                .services(serviceSID)
                .verifications.create({
                  to: `+91${user.number}`,
                  channel: "sms",
                })
                .then((verifications) => {
                  console.log(verifications, "hey this is the verification");
                })
            console.log(response,'i got response');
                resolve(response)
                .catch((err) => {
                  console.log(err, "bnbnbnbnbnbnbnbn");
                });
        } else {
            response.status = false;
            resolve(response)
        }
            } catch(err) {
                console.log(err,'tyutyutyu');
            }
            
        })
}

const forgotPasswordConfirm = (newPassword) => {
    console.log(newPassword,'bubububububububububu');
    return new Promise(async(resolve, reject) => {
        try {
            let updatedPassword;
            let { otp, password, number } = newPassword
            console.log(number,'cxcxcxcxcxcxcxcx');
            let hashPassword = await bcrypt.hash(password, 10)
            console.log(hashPassword,'hjhjhjhjhj');
            updatedPassword = await User.updateOne(
                {number : number},
                {$set: { password : hashPassword } }
                );

                console.log(updatedPassword,'dfgdfgggggggggggg');

                const verification_check = await client.verify.v2
        .services(serviceSID)
        .verificationChecks.create({ to: `+91${number}`, code: otp })
            otpVerifiedStatus = verification_check.status
            console.log(otpVerifiedStatus,'bbbbbbrrrrrrr')
            if(otpVerifiedStatus === 'approved') {
                resolve({ status : true })
            } else {
                resolve({ status : false })
            }
        } catch(err) {
            console.error(err);
        }

    })
}

const fetchAllDoctors = () => {
    return new Promise(async(resolve, reject) => {
        try {
           await DoctorProfile.find().sort({ firstname : 1 }).then((docProf) => {
            resolve(docProf)
           })
           .catch((error) => {
            reject(error)
           })
        } catch(err) {

        }   
    })
}

const fetchAllSpeciality = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let signedDoctor = await Doctor.find()
            // const department = signedDoctor.map((doctor) => doctor.department)
            resolve(signedDoctor)
        } catch(err) {
            console.log(err, 'i got userHelpers speciality error');
        }
    })
}

const sortDoctor = (speciality) => {
    console.log(speciality,'ghhhh');
 return new Promise(async(resolve, reject) => {
    console.log('haiiiiiiii dearrrrrrrrrrr');
    if(speciality.selectedOption && speciality.selectedOption.length === 0) {
        await DoctorProfile.find().sort({ firstname : 1 }).then((docProf) => {
            resolve(docProf)
        })
    } else {
        let dep = await DoctorProfile.find({
            department: speciality.selectedOption
          }); 
          console.log(dep,'gggtttt55555');
          resolve(dep)
    }
 })
}

const searchDoctor = (searchingText) => {
    console.log(searchingText,'nuuunuuunuuunuuuunnnnuuuuu');
    return new Promise(async(resolve, reject) => {
        let searchedDoc = await DoctorProfile.find({firstname : searchingText.searchInput})
        console.log(searchedDoc,'vvvvvvvvvvvvnnnnnnnnnnnnn');

    })
}

const fetchUserSideSchedule = (docId) => {
    console.log(docId,'hhhhhhhqqqqqqqq')
    return new Promise(async(resolve, reject) => {
       await DoctorProfile.findOne({doctorId : docId.docId}).then(async(doctor) => {
            console.log(doctor,'vvvvvtttttqqqqqqqq')
            if(doctor) {
               await DoctorTime.find({doctorId : docId.docId}).then((timeSchedule) => {
                    console.log(timeSchedule,'cccccrrrooorrreeeeeeeee');
                    resolve({scheduledTime : timeSchedule, doctor : doctor})
                })
            } else {
                resolve({ doctor: null, scheduledTime: null });
            }
        })
    })
}

const fetchTime = (timeId) => {
    return new Promise(async(resolve, reject) => {
        try {
            let timeSchedule = await DoctorTime.findOne({_id : timeId.timeId})
            if(timeSchedule) {
                let doctorId = timeSchedule.doctorId
                let doctor = await DoctorProfile.findOne({doctorId : doctorId})
                resolve({timeSchedule, doctor})
            }
        } catch(err) {
            reject(err)
        }
       
    })
}

const slotBooking = (slotBookingDetails) => {
    console.log(slotBookingDetails,'i got in user helpers');
    return new Promise(async(resolve, reject) => {
        try {
            let bookingDate = new Date(slotBookingDetails.currentDate)
            bookingDate.setHours(0, 0, 0, 0);
            console.log(bookingDate,'vvvvvvvvvvvvvvvv')
            let bookingSlot = await BookingSlot.findOne({patientId : slotBookingDetails.patientId})
            
            if(bookingSlot) {
                let bookedDate = new Date(bookingSlot.currentDate)
            bookedDate.setHours(0, 0, 0, 0);
            console.log(bookedDate,'bbbbbbbbbbbbbbbb');

            // if(slotBookingDetails.slotTime === bookingSlot.slotTime && bookingDate <= bookedDate) {
            //     resolve({message : 'got it', BookedSlot : bookingSlot})
            // } else {
                resolve({message : "You have already another booking", bookingSlot})
            // } 
                
            } else {
                await BookingSlot.create(slotBookingDetails).then((response) => {
                    console.log(response,'i got slot booking response');
                    resolve(response)
                })
            } 
        } catch(err) {
            console.error(err);
        }
    })
}

const fetchPaymentDetails = (fetchDetails) => {
    console.log(fetchDetails,'hhhhhhheeeeerrrrrrrrrr');
    const {docId, userId, dateId} = fetchDetails
    return new Promise(async(resolve, reject) => {
        try {
            let doctorProfile = await DoctorProfile.findOne({_id: docId})
            let user = await User.findOne({_id : userId})
            user = await user.toObject()
            let bookedDate = await DoctorTime.findOne({ _id : dateId})
            console.log(bookedDate,'got booked date');
    
            if(doctorProfile && user) {

                let bookedSlot = await BookingSlot.findOne({ patientId : userId })
                bookedSlot = await bookedSlot.toObject()

                resolve({doctorProfile, user, bookedSlot, bookedDate})
            }
        } catch(err) {
            reject(err)
        }
    })
}

const razorPayPayment = (paymentDetails) => {
    console.log(paymentDetails,'rrrrttttooooooo');
    const {totalAmount, user, doctor, date, timeSchedule} = paymentDetails
    console.log(timeSchedule,'got timeschedule');
    console.log(user,'got userrrrrrrrrrr');

    return new Promise(async(resolve, reject) => {
        docBookingObj = {
            doctorDetails : {
                doctorFirstName : doctor.firstname,
                doctorLastName : doctor.lastname,
                department : doctor.department,
                qualification : doctor.degree,
                hospital : doctor.hospital,
                fee : totalAmount,
            },
            userId : user._id,
            userFirstName : user.patientfirstname,
            userLastName : user.lastName,
            userNumber : user.number,
            userDob : user.dob,
            userEmail : user.email,
            bookingDate : date.dateObject,
            bookingTime : timeSchedule.slotTime,
            doctorId : doctor.doctorId

        }

        let bookedDetails = await BookingDetails.create(docBookingObj)
            resolve(bookedDetails._id)
    })
}

const generateRazorPay = (bookedId, totalAmount) => {
    return new Promise((resolve, reject) => {
        var options = {
            amount : totalAmount*100 ,
            currency : 'INR',
            receipt : ""+bookedId
        }

        instance.orders.create(options, function(err, order) {
            if(err) {
                console.log(err,'payment error');
            } else {
                console.log(order,'order successsss');
                resolve(order)
            }
          });

    })
}

const paymentVerification = (paymentDetails) => {
    console.log(paymentDetails.res.razorpay_payment_id,'zzzzzzzzzzzzzzzzzzzzzzzzzzz');
    return new Promise(async(resolve, reject) => {
        try {
            const crypto = require('crypto')
            function calculateHmacSha256(data, key) {
                const hmac = crypto.createHmac('sha256', key);
                hmac.update(data);
                return hmac.digest('hex');
              }

              const order_id = paymentDetails.order.id;
              const razorpay_payment_id = paymentDetails.res.razorpay_payment_id;
              const secret = process.env.key_secret;

              const generated_signature = calculateHmacSha256(`${order_id}|${razorpay_payment_id}`, secret);

              console.log(generated_signature,'hhhhhhtttttrrrrrrrrrr');

            if(generated_signature == paymentDetails.res.razorpay_signature) {
                resolve({ status : true })
            } else {
                reject(new Error("HMAC verification failed"))
            }
        } catch(err) {
            console.error(err,'nnnnnnnn');
        }
    })
}

const landingPageFetchDoctors = () => {
    return new Promise((resolve, reject) => {
        DoctorProfile.find().then((doctors) => {
            console.log(doctors,'hhhhhhh');
                resolve(doctors)
        })
    })
}

const signupResendOtp = (number) => {
    console.log(number,'resend otp number');
    return new Promise((resolve, reject) => {
        client.verify.v2
        .services(serviceSID)
        .verifications.create({
          to: `+91${number.number}`,
          channel: "sms",
        })
        .then((verifications) => {
          console.log(verifications, "hey this is the verification");
        })
    // console.log(response,'i got response');
    //     resolve(response)
        .catch((err) => {
          console.log(err, "bnbnbnbnbnbnbnbn");
        });

    })
}


module.exports = {
    userSignup,
    otpVerification,
    userLogin,
    forgotPassword,
    forgotPasswordConfirm,
    fetchAllDoctors,
    fetchAllSpeciality,
    sortDoctor,
    searchDoctor,
    fetchUserSideSchedule,
    fetchTime,
    slotBooking,
    fetchPaymentDetails,
    razorPayPayment,
    generateRazorPay,
    paymentVerification,
    landingPageFetchDoctors,
    signupResendOtp
}