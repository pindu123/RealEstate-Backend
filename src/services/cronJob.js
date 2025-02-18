
const cron = require('node-cron');
const { updatePropertyOnHoldStatus } = require('../services/propertyService');
const auctionModel = require('../models/auctionModel');
const { auctionWinner, AuctionPushNotification } = require('../controllers/auctionController');
const fieldModel = require('../models/fieldModel');
const layoutModel = require('../models/layoutModel');
const commercialModel = require('../models/commercialModel');
const residentialModel = require('../models/residentialModel');
const { sendPropertyDetailsToCustomer } = require('../controllers/customerController');

// Schedule the task to run every day at midnight
cron.schedule('0 0 * * *', updatePropertyOnHoldStatus);

// Run immediately when the server starts
updatePropertyOnHoldStatus();


cron.schedule('* * * * *', async () => {
    const currentTime = new Date();


    const auctions = await auctionModel.find();


    auctions.forEach(async (auction) => {
        console.log("asdladsa")

        if (auction.endDate < currentTime) {
            console.log("asdladsa")

            console.log(auction.endDate, currentTime, auction.endDate < currentTime)
            if (auction.auctionStatus === "active") {
                console.log("asdladsa")

                auction.auctionStatus = 'InActive';
                await auction.save();
                auctionWinner(auction._id)
                console.log(`Auction ${auction._id} marked as inactive.`);
            }
        }
        console.log(auction.endDate < currentTime, auction.endDate)

    });
});



cron.schedule('* * * * *', async () => {
    const time = new Date()

    const auctionData = await auctionModel.find()


    for (let auction of auctionData) {
        if (auction.auctionStatus === "active" || auction.auctionStatus === "Active") {
            const auctionStartTime = new Date(auction.startDate)
            let propertyData

            propertyData = await fieldModel.find({ _id: auction.propertyId })
            if (propertyData.length === 0) {
                propertyData = await layoutModel.find({ _id: auction.propertyId })

            }
            if (propertyData.length === 0) {
                propertyData = await commercialModel.find({ _id: auction.propertyId })
            }
            if (propertyData.length === 0) {
                propertyData = await residentialModel.find({ _id: auction.propertyId })
            }

            let propertyName

            if (propertyData[0].propertyType === "Agricultural land") {
                propertyName = propertyData[0].landDetails.title
            }
            else if (propertyData[0].propertyType === "Layout") {
                propertyName=await propertyData[0].layoutDetails.layoutTitle
            }
            else if (propertyData[0].propertyType === "Residential") {
                propertyName=await propertyData[0].propertyDetails.apartmentName
            }
            else {
                  propertyName=await propertyData[0].propertyTitle
            }


            const dateDiff = (Math.floor((auctionStartTime.getTime() - time.getTime())/(1000*3600)));

            console.log("dateDiff", Math.floor(dateDiff),dateDiff,dateDiff === 22)

            if (dateDiff === 22 || dateDiff === "22") {
                console.log("api call")
                AuctionPushNotification(`The auction for the property ${propertyName} will begin in one hour. ⏳`)
            }
        }
    }
})