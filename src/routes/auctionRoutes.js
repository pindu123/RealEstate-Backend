const express=require('express')
const { postAuction, bidByBuyer, getBidsOfAuction, closeAuction, getAllAuctions, getTodayAuctions, getFutureAuctions, getAuctionDetailsofProperty, auctionById } = require('../controllers/auctionController')

const auctionRoutes=express.Router()


auctionRoutes.post("/postAuction",postAuction)

auctionRoutes.put("/bid/:auctionId",bidByBuyer)

auctionRoutes.get("/getBidsOfAuction/:auctionId",getBidsOfAuction)

auctionRoutes.put("/closeAuction",closeAuction)

auctionRoutes.get("/getAllAuctions",getAllAuctions)

auctionRoutes.get("/getTodayAuctions",getTodayAuctions)

auctionRoutes.get("/getFutureAuctions",getFutureAuctions) 

auctionRoutes.get("/getAuctionDetailsProperty/:propertyId",getAuctionDetailsofProperty)

auctionRoutes.get("/auctionById/:auctionId",auctionById)

module.exports=auctionRoutes