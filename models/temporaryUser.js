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

    // createdAt: { 
    //     type: Date,
    //     expires: '5m', 
    //     default: Date.now 
    // },

})

module.exports = mongoose.model('temporaryUser', userSchema)