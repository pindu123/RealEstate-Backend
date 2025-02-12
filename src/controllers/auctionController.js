const auctionModel = require("../models/auctionModel")
const commercialModel = require("../models/commercialModel")
const fieldModel = require("../models/fieldModel")
const layoutModel = require("../models/layoutModel")
const residentialModel = require("../models/residentialModel")

const postAuction = async (req, res) => {
    try {
        const data = req.body

        const propertyId=data.propertyId


        const auctions=await auctionModel.find({propertyId:propertyId,auctionStatus:"active"});

        console.log("auctions",auctions)
        if(auctions.length>0)
        {
            return res.status(400).json({"message":"Already the property is in auction"})
        }

        console.log(data)
        const auction = new auctionModel(data)

        auction.save()

        res.status(201).json("Auction Created Successfully")
    }
    catch (error) {
        res.status(500).json("Internal Server Error")
    }

}



const bidByBuyer = async (req, res) => {
    try {
        const auctionId = req.params.auctionId
        const bid = req.body;

        const auctionData = await auctionModel.find({ _id: auctionId })

        let buyers = auctionData[0].buyers

        const date=new Date()
        // for (let buyer of buyers) {
        //     if (buyer.buyerId === bid.buyerId) {
        //         return res.status(400).json({ "message": "You have already placed a bid in this auction." })
        //     }
        // }

          if(date<auctionData[0].startDate)
          {
            console.log("erere",)
            res.status(400).json({"message":"Auction Not Started Yet"})
          }

        buyers.push(bid)

        await auctionModel.findByIdAndUpdate({ _id: auctionId }, { buyers: buyers })


        res.status(201).json("Bid Successfull")

    }
    catch (error) {
        console.log(error)
        res.status(500).json("Internal Server Error")
    }
}


const getBidsOfAuction = async (req, res) => {
    try {
        const auctionId = req.params.auctionId

        const auctionData = await auctionModel.find({ _id: auctionId });

        let maxBid = 0
        let maxBidData = {}
        let buyerData = auctionData[0];

        for (let buyer of buyerData) {

            if (buyer.bidAmount > maxBid) {
                maxBid = buyer.bidAmount
                maxBidData = buyer
            }
        }


        let auctionDetails = {
            auctionData,
            maximumBid: maxBidData
        }

        if (!auctionDetails) {
            res.status(409).json({ "message": "Auction Details Not Found" })
        }
        else {
            res.status(200).json({ "data": auctionDetails })
        }

    }
    catch (error) {
        res.status(500).json({ "message": "Internal Server Error" })
    }
}


const closeAuction = async (req, res) => {
    try {
        const auctionId = req.body.auctionId
        
        const status=req.body.status
        

       const auctionStatus= await auctionModel.findByIdAndUpdate({ _id: auctionId }, { auctionStatus: "InActive" })

        res.status(200).json({ "message": "Auction Closed Successfully" })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ "error": "Internal Server Error" })
    }
}



const getAllAuctions = async (req, res) => {
    try {
        const auctionData = await auctionModel.find({ $or:[{auctionStatus: "active"},{auctionStatus: "closed"}] });


        let resultData = []
        for (let auction of auctionData) {
            let prop
            const fieldData = await fieldModel.find({ _id: auction.propertyId })
            const commData = await commercialModel.find({ _id: auction.propertyId })

            const residential = await residentialModel.find({ _id: auction.propertyId })

            const layout = await layoutModel.find({ _id: auction.propertyId })

            if (fieldData.length > 0) {
                prop = fieldData
            }
            if (commData.length > 0) {
                prop = commData
            } if (residential.length > 0) {
                prop = residential
            } if (layout.length > 0) {
                prop = layout
            }

            resultData.push({
                ...auction._doc,
                property: prop
            })

        }

        if (auctionData.length === 0) {
            return res.status(409).json({ "message": "No Active Auctions" })

        }

        res.status(200).json({ "data": resultData })
    }
    catch (error) {
        res.status(500).json({ "message": "Internal Server Error" })
        console.lof(error)
    }
}


const getTodayAuctions = async (req, res) => {
    try {
        const currentTime = new Date();

        const auctionData = await auctionModel.find({ startDate: { $lte: currentTime }, endDate: { $gt: currentTime },auctionStatus:"active"})

        if (auctionData.length === 0) {
            return res.status(409).json({ "message": "No Auction Found" })
        }


        let resultData = []
        for (let auction of auctionData) {
            let prop
            const fieldData = await fieldModel.find({ _id: auction.propertyId })
            const commData = await commercialModel.find({ _id: auction.propertyId })

            const residential = await residentialModel.find({ _id: auction.propertyId })

            const layout = await layoutModel.find({ _id: auction.propertyId })

            if (fieldData.length > 0) {
                prop = fieldData
            }
            if (commData.length > 0) {
                prop = commData
            } if (residential.length > 0) {
                prop = residential
            } if (layout.length > 0) {
                prop = layout
            }

            resultData.push({
                ...auction._doc,
                property: prop[0]
            })

        }
        res.status(200).json({ "data": resultData })
    }
    catch (error) {
        res.status(500).json({ "message": "Internal Server Error" })
    }
}


const getFutureAuctions = async (req, res) => {
    try {
        const currentTime = new Date();
        const nextTime = new Date(currentTime);
        nextTime.setDate(currentTime.getDate() + 2)

        const auctionData = await auctionModel.find()

        let resultData = []
        console.log(auctionData)
        for (let auction of auctionData) {
            console.log("abcd", auction.startDate > currentTime, currentTime)

            if (auction.startDate > currentTime && auction.startDate < nextTime) {
                resultData.push(auction)
            }
        }


        res.status(200).json({ "data": resultData })
    }
    catch (error) {
        res.status(500).json({ "message": "Internal Server Error" })
        console.log(error)
    }
}




const getAuctionDetailsofProperty = async (req, res) => {
    try {
const propertyId=req.params.propertyId

const auctionData=await auctionModel.find({"propertyId":propertyId})

const reslutData=[]

if(auctionData.length>0)
{
let prop
const fieldData = await fieldModel.find({ _id: propertyId })
const commData = await commercialModel.find({ _id: propertyId })

const residential = await residentialModel.find({ _id: propertyId })

const layout = await layoutModel.find({ _id: propertyId })

if (fieldData.length > 0) {
    prop = fieldData
}
if (commData.length > 0) {
    prop = commData
} if (residential.length > 0) {
    prop = residential
} if (layout.length > 0) {
    prop = layout
}




let maxBid = 0
let maxBidData = {}
 let buyerData = auctionData[0].buyers;
 console.log(buyerData,auctionData)

for (let buyer of buyerData) {

    if (buyer.bidAmount > maxBid) {
        maxBid = buyer.bidAmount
        maxBidData = buyer
    }
}


// let auctionDetails = {
//     auctionData,
//     maximumBid: maxBidData
// }

reslutData.push({
    ...auctionData[0]._doc,
    "property":prop[0],
    maximumBid: maxBidData

})
}

if(reslutData.length===0)
{
  return  res.status(400).json({"message":"No Auctions Found"})
}

res.status(200).json({"data":reslutData})
 


    }
    catch (error) {
        console.log(error)
res.status(500).json({"message":"Internal Server Error"})
    }
}



const auctionById=async(req,res)=>{
    try
    {
const auctionId=req.params.auctionId

const auctionData=await auctionModel.find({_id:auctionById})


if(auctionData.length===0)
{
    res.status(409).josn({"message":"No Data Found","data":auctionData[0]})
}
else
{
    res.status(200).json({"data":auctionData[0]})
}

    }
    catch(error)
    {
console.log(error)
res.status(500).json({"message":"Internal Server Error"})
    }
}


module.exports = {
    postAuction,
    bidByBuyer,
    getBidsOfAuction,
    closeAuction,
    getAllAuctions,
    getTodayAuctions,
    getFutureAuctions,
    getAuctionDetailsofProperty,
    auctionById
}