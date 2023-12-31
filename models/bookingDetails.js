const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const doctorDetailsSchema = new Schema({
    doctorFirstName : {
        type : String,
        required : true
    },

    doctorLastName : {
        type : String,
        required : true
    },

    department: {
        type : String,
        required : true
    },

    qualification : {
        type : String,
        required : true
    },

    hospital : {
        type : String,
        required : true
    },

    fee : {
        type : String,
        required : true
    },

});


const bookingDetailsSchema = new Schema({
    doctorDetails : doctorDetailsSchema,

    userId : {
        type : String,
        required : true
    },

    userFirstName : {
        type : String,
        required : true
    },

    userLastName: {
        type : String,
        required : true
    },

    userNumber : {
        type : String,
        required : true
    },

    userDob: {
        type : String,
        required : true
    },

    userEmail : {
        type : String,
        required : true
    },

    bookingDate : {
        type : String,
        required : true
    },

    bookingTime : {
        type : String,
        required : true
    },

    doctorId : {
        type : String,
        required : true
    },
})

module.exports = mongoose.model('BookingDetails', bookingDetailsSchema)