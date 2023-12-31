var express = require("express");
const cors = require("cors");
var router = express.Router();
var user = require('../models/user')
var userHelpers = require('../helpers/userHelpers')
const {signUser} = require('../middlewares/jwt')
const { S3Client, PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const bucketName = process.env.BUCKET_NAME
const region = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials : {
        accessKeyId: accessKey,
        secretAccessKey:secretAccessKey,
    },
    region: region
})



let userSignup = async (req, res, next) => {
    try {
        console.log(req.body,'njnjnjnnjnjnnjj');
        const updatedUserData = await userHelpers.userSignup(req.body);
        const userSecure = {
            _id : updatedUserData.user._id,
            name : updatedUserData.user.patientfirstname,
            email : updatedUserData.user.email
        }
        res.status(200).json({userSecure}); // Send a response with the updated user data
      } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: "Something went wrong" }); // Handle the error gracefully
      }

}

let otpVerification = async(req, res) => {
    try {
        const {otp, number} = req.body
        let otpVerify = await userHelpers.otpVerification(req.body) 
        if(otpVerify.otpVerifiedStatus === "approved"){
            let {otpVerifiedStatus, patient} = otpVerify
            const token = await signUser(patient)
            res.status(200).json({message : 'otp verified successfully',otpVerifiedStatus, patient, auth : token})
        }else {
            res.status(200).json({ error : "Otp is incorrect"})
        }
       
    }catch(error) {
        console.error(error,'Otp is not verified');
        if (error) {
            res.status(500).json({ error: "Twilio resource not found" });
        } else {
            res.status(500).json({ message: 'OTP is not matched' });
        }
    }
    
}

let userLogin = async(req, res) => {
    console.log(req.body,'qwerqwerqwerqwer');
        try {
            let response = await userHelpers.userLogin(req.body)
            console.log(response,'login Response');
            if(response.status === 'true') {
                
            }
            if(response.status ==="unblock" && response.user.signupStatus === 'unblock') {
                const token = await signUser(response.user)
                res.status(200).json({status: "unblock", message: 'Login successful', user: response.user, auth : token});
            } else if(response.status === 'nouser') {
                console.log('haooiiiii')
                res.status(200).json({ status: "nouser", message: "user does not exist"})
            } else {
                res.status(200).json({status: "block", error: 'Login failed. Invalid credentials. or You are blocked by admin'});
            }

        } catch(err) {
            console.error(err,'aaaaaaaa');
            res.status(500).json({ status: false, message: 'Internal server error.' });
        }
}

let forgotPassword = async(req, res) => {
    console.log(req.body,'forgot password number');
    userHelpers.forgotPassword(req.body).then((response) => {
        console.log(response,'vgvgvgvgvgvgvgvvg');
        if(response.status) {
            res.status(200).json({ message : "Otp send successfully", response })
        } else {
            res.status(200).json({ error : "Otp error", response })
        }

    })
}

let forgotPasswordConfirm = async (req, res) => {
    console.log(req.body,'this is my bosy');
    const {otp, password, number} = req.body
    console.log(otp,password,number,'hjhjhjhjh');
    userHelpers.forgotPasswordConfirm(req.body).then((response) => {
        console.log(response,'qwertyuioppppppppppppppppppppppp');
        if(response.status) {
            res.status(200).json({ message : "Password updated successfully", response })
        } else [
            res.status(200).json({ error : "Password not changed", response })
        ]
    })
}

let doctorBooking = (req, res) => {
    try {
        userHelpers.fetchAllDoctors().then(async(doc) => {
            if(doc && doc.length > 0) {
                const doctorImage = [];

                const getImageName = (doctor) => doctor.imageName;
                // const imageNames = response.map(getImageName);
                for(const doctor of doc) {
                    const imageName = getImageName(doctor)

                    const getObjectParams = {
                        Bucket : bucketName,
                        Key : imageName,
                    };

                    const command = new GetObjectCommand(getObjectParams);
                    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                    let docImageUrl = url;

                    // let docProfile = {
                    //     doctor : doc,
                    //     image : docImageUrl
                    // }
                     
                    doctorImage.push(docImageUrl)
                }
                let docProfile = {
                    image : doctorImage,
                    doctorDetails : doc
                }

                    if(doctorImage.length > 0) {
                        res.status(200).json({ docProfile })
                    } else {
                        res.status(401).json({message : 'something went wrong'})
                    }

            } else {
                res.status(401).json({message : 'something went wrong'})
            }
        })
    } catch(err) {
        console.error(err,'can not access doctor booking details');
        res.status(500).json({ message: 'Server error' });
    }
}

let getSpeciality = (req, res) => {
    try {
        userHelpers.fetchAllSpeciality()
        .then((doctor) => {
            if(doctor && doctor.length > 0) {
                res.status(200).json({doctor})
            } else {
                res.status(401).json({ message : 'i did not find user' })
            }
        })
    } catch(err) {
        console.log(err, 'i got speciality error');
    }
}

const sortDoctor = async(req, res) => {
    try {
        let sortedDocs = await userHelpers.sortDoctor(req.body)

        if(sortedDocs && sortedDocs.length > 0) {
            const doctorImage = [];
            const getImageName = (doctor) => doctor.imageName;

            for(const doctor of sortedDocs) {
                const imageName = getImageName(doctor)


                const getObjectParams = {
                    Bucket : bucketName,
                    Key : imageName,
                };

                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                let docImageUrl = url;

                // let docProfile = {
                //     doctor : doc,
                //     image : docImageUrl
                // }
                 
                doctorImage.push(docImageUrl)
            }

            let sortedDoc = {
                image : doctorImage,
                doctorDetails : sortedDocs
            }

            if(doctorImage.length > 0) {
                res.status(200).json({ sortedDoc })
            } else {
                res.status(401).json({message : 'something went wrong'})
            }
        } else {
            res.status(401).json({message : 'something went wrong'})
        }

    } catch(err) {
        console.error(err);
    }
}

const searchDoctor = (req, res) => {
 console.log(req.body,'jaaaannnnn');
 userHelpers.searchDoctor(req.body)
}

const fetchUserSideSchedule = (req, res) => {
    try {
        userHelpers.fetchUserSideSchedule(req.query).then(async(response) => {
            console.log(response.scheduledTime,'zzzzzzzzzzxxxxxxxxxx');
            let docProfile = response.doctor
            if(docProfile && response.scheduledTime) {
                let imageName = docProfile.imageName
                console.log(imageName,'i got imageName');


                const getObjectParams = {
                    Bucket : bucketName,
                    Key : imageName,
                };

                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                let docImageUrl = url;

                console.log(docImageUrl,'ggggttttrrrrr');

                res.status(200).json({ scheduledTime : response.scheduledTime, doctorProfile : docProfile, imageUrl : docImageUrl })
            } else {
                res.status(401).json({message : 'something went to wrong'})
            }
        })
    } catch(err) {
        console.error(err);
    }
}

const fetchTimeDetailse = (req, res) => {
    try {
        userHelpers.fetchTime(req.query).then(async(response) => {
            console.log(response,'sssssssssssssssssss');
            if(response.doctor && response.timeSchedule) {
                let imageName = response.doctor.imageName
                console.log(imageName,'i got imageName');

                const getObjectParams = {
                    Bucket : bucketName,
                    Key : imageName,
                };

                const command = new GetObjectCommand(getObjectParams);
                const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
                let docImageUrl = url;

                console.log(docImageUrl,'vvvvaaayyoooo');
                res.status(200).json({ timeSchedule : response.timeSchedule, doctor : response.doctor, imageUrl : docImageUrl })
            }
        })
    } catch(err) {
        console.error(err);
    }
}

const userBookedSlots = (req, res) => {
    console.log(req.body,'i got booking slot body');
    let slotTime = req.body.slotTime
    let docId = req.body.docId
    let patientId = req.body.patientId
    let currentDate = new Date()

    const bookingSlotDetails = {
        slotTime,
        docId,
        patientId,
        currentDate
    }

    userHelpers.slotBooking(bookingSlotDetails).then((response) => {
        console.log(response,'got booking response');
        if(response.message) {
            console.log('fuckerrrrr');
            res.status(200).json({ message : "You alredy have another booking", status : true, response})
        } else {
            console.log('fuckerrrrrsssssssssss');
            res.status(200).json({ message : "Your booking is successfull", status : false, response })
        }
    })

}

const fetchPaymentDetails = (req, res) => {
    userHelpers.fetchPaymentDetails(req.query).then((response) => {
        console.log(response,'i got payment details in server');
        if(response) {
            res.status(200).json({ response })
        } else {
            res.status(401).json({ message : 'Payment details fetching error' })
        }
    })
}

const razorPayment = (req, res) => {
    const { totalAmount } = req.body
    console.log(totalAmount,'payment body');
    userHelpers.razorPayPayment(req.body).then((response) => {
        console.log(response,'booking details in contriller');
        if(response) {
            userHelpers.generateRazorPay(response,totalAmount).then((order) => {
                if(order) {
                    res.status(200).json({ order })
                } else {
                    res.status(401).json({ message : 'order not created' })
                }
            })
        }
    })
}

const verifyPayment = (req, res) => {
    try {
        userHelpers.paymentVerification(req.body).then((response) => {
            if(response) {
                res.status(200).json({ response })
            } else {
                res.status(401).json({ message : "payment failed"})
            }
        })
    } catch(err) {
        console.error(err);
    }
}

const landingPageFetchDoctors = async(req, res) => {
    let doctors = await userHelpers.landingPageFetchDoctors()

    console.log(doctors,'fetching doctor');

    if(doctors && doctors.length > 0) {
        const doctorImage = []
        const getImageName = (doctor) => doctor.imageName

        for(const doctor of doctors) {
            const imageName = getImageName(doctor)

            const getObjectParams = {
                Bucket : bucketName,
                Key : imageName
            }

            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn : 3600});
            let docImageUrl = url
            doctorImage.push(docImageUrl)
        }

        let doctorsDetails = {
            image : doctorImage,
            details : doctors
        }

        if(doctorImage.length > 0) {
            res.status(200).json({ doctorsDetails })
        } else {
            res.status(401).json({ message : 'Something went to wrong' })
        }
    } else {
        res.status(200).json({ message : 'something went to wrong' })
    }
}

const resendOtp = (req, res) => {
    const number = {
        formData : req.body
    }
    console.log(number,'bbbbbb');
    userHelpers.forgotPassword(number)
}

const signupResendOtp = (req, res) => {
    console.log(req.body,'bbbbbbbbb');
    userHelpers.signupResendOtp(req.body)
}


module.exports = {
    userSignup,
    otpVerification,
    userLogin,
    forgotPassword,
    forgotPasswordConfirm,
    doctorBooking,
    getSpeciality,
    sortDoctor,
    searchDoctor,
    fetchUserSideSchedule,
    fetchTimeDetailse,
    userBookedSlots,
    fetchPaymentDetails,
    razorPayment,
    verifyPayment,
    landingPageFetchDoctors,
    resendOtp,
    signupResendOtp
}