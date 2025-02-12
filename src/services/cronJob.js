 
const cron = require('node-cron');
const { updatePropertyOnHoldStatus } = require('../services/propertyService');
const auctionModel = require('../models/auctionModel');

// Schedule the task to run every day at midnight
cron.schedule('0 0 * * *', updatePropertyOnHoldStatus);

// Run immediately when the server starts
updatePropertyOnHoldStatus();


cron.schedule('* * * * *', async () => {
    const currentTime = new Date();


    const auctions = await auctionModel.find();

 
    auctions.forEach(async (auction) => {

        if (auction.endDate < currentTime) {
            console.log(auction.endDate, currentTime, auction.endDate < currentTime)
            if (auction.auctionStatus === "active") {

                auction.auctionStatus = 'InActive';
                await auction.save();
                console.log(`Auction ${auction._id} marked as inactive.`);
            }
        }
        console.log(auction.endDate < currentTime, auction.endDate)

    });
});