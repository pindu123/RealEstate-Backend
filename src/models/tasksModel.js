const { required, string } = require("joi");
const mongoose = require("mongoose");


const taskSchema=new mongoose.Schema({

    platformTitle:{
        type:String,
        required:true
    },
    target:{
        type:String,
        required:true
    },
    pampletDist:{
        type:String,
        required:false
    }
},  { timestamps: true }
)

const tasksModel = mongoose.model("tasks", taskSchema);

module.exports=tasksModel