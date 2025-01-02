const express=require('express')
const { getAllScheduledMeetings, scheduleMeeting, rescheduleMeeting, currentDayMeetings, checkUserAvailability, currentWeekMeetings } = require('../controllers/meetingsController')
const meetingRoutes=express.Router()

meetingRoutes.get("/getAllScheduledMeetings",getAllScheduledMeetings)

meetingRoutes.post("/schedule",scheduleMeeting)
meetingRoutes.put("/reSchedule",rescheduleMeeting)


meetingRoutes.get("/currentDayMeetings",currentDayMeetings)
meetingRoutes.get("/checkAvailability",checkUserAvailability)
meetingRoutes.get("/currentWeek",currentWeekMeetings)
module.exports=meetingRoutes