const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSlotSchema = new Schema({
    slotTime : {
        type : String,
        required : true
    },

    docId : {
        type : String,
        required : true
    },

    patientId: {
        type : String,
        required : true
    },

    currentDate : {
        type : Date,
        required : true
    },

})

module.exports = mongoose.model('BookingSlot', bookingSlotSchema)