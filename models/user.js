const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    patientfirstname : {
        type : String,
        required : true
    },

    lastName : {
        type : String,
        required : true
    },

    dob : {
        type : String,
        required : true
    },

    gender : {
        type : String,
        required : true
    },

    number : {
        type : String,
        required : true
    },

    email : {
        type : String,
        required : true
    },

    password : {
        type : String,
        required : true
    },

    otp: {
        type: String,
        required: false 
    },

    signupStatus : {
        type: String,
        required: false 
        // default : false
    }



})

module.exports = mongoose.model('User', userSchema)