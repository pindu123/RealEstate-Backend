const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
{
dealingId: {
type: String,
required: true
},
agentId: {
type: String,
required: false
},
meetingDate: {
type: Date
},
startTime: {
type: Date
},
endTime: {
type: Date
},
location: {
type: String
},
csrId: {
type: String
},
comment: {
type: String,
required: true
},
activityBy: {
type: String,
},
activityType:{
    type:String,
}
},
{ timestamps: true }
);
module.exports = mongoose.model("Activity", activitySchema);
