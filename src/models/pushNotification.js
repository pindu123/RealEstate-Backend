const { number } = require('joi');
const mongoose = require('mongoose');

const pushModel = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        role:{
            type:Number,
            required:true
        },
        pushToken: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const pushNotification = mongoose.model('pushNotification', pushModel);

module.exports = pushNotification;
