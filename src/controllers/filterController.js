const { query, json } = require("express")


const residentialModel = require("../models/residentialModel");

const layoutModel = require("../models/layoutModel");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");

const stripe = require("stripe")("sk_test_51QprXqCIFuzY1JYT9bNmazVb5i33rA8MWn6IZ9mYledfMfG46fhBo5OHm04AyBVyMO04ncZE6vzLQ3nykElkOr4t00gcRgxcCl");



const residentialSearch = async (req, res) => {
  try {

    const propertyType = req.query.propertyType
    const purchaseType = req.query.purchaseType

    const amenities = req.query.amenities

    const furniture = req.query.furniture

    const price = req.query.price
    const size = req.query.size
    const facing = req.query.facing

    const bedRoom = req.query.bedRoom

    const propertyLayout = req.query.propertyLayout

    const road = req.query.road

    const medical = req.query.medical

    const educational = req.query.educational

    const approvals = req.query.approvals

    const sizeUnit = req.query.sizeUnit

    const minPrice = req.query.minPrice

    const maxPrice = req.query.maxPrice

    const location = req.query.location

    const propertyName = req.query.propertyName


    const maxSize = req.query.maxSize

    const minSize = req.query.minSize

    console.log("Properties", req.query)

    let filterQuery = {
      $and: [],
    };

    location

    if (propertyType) {
      filterQuery.$and.push({
        "propertyDetails.type": propertyType
      })
    }



    if (location) {
      filterQuery.$and.push({
        "propertyDetails.address.district": location
      },
        {
          "propertyDetails.address.mandal": location

        },
        {
          "propertyDetails.address.village": location
        },
        {
          "propertyDetails.address.landMark": location
        },
        {
          "propertyDetails.address.state": location
        }
      )
    }



    if (propertyName) {

      filterQuery.$and.push(
        {
          "propertyDetails.apartmentName": propertyName
        },
        {
          "propertyId": propertyName
        }
      )
    }



    if (purchaseType) {

      filterQuery.$and.push(
        { "propertyDetails.propertyPurpose": purchaseType },
      )
    }

    if (furniture) {

      let sample = { $or: [] }
      sample.$or.push({
        "propertyDetails.furnitured": furniture

      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              "furnitured": furniture
            }
          }
        })


      filterQuery.$and.push(sample)
    }

    if (facing) {

      let sample = { $or: [] }

      sample.$or.push({
        "propertyDetails.flatFacing": facing
      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              "flatFacing": facing
            }
          }
        }
      )

      filterQuery.$and.push(sample)
    }

    if (bedRoom) {
      filterQuery.$and.push({
        "propertyDetails.flat": {
          $elemMatch: {
            "bedroomCount": bedRoom
          }
        }
      });
    }


    if (propertyLayout) {
      filterQuery.$and.push({
        "propertyDetails.apartmentLayout": propertyLayout
      })
    }


    if (size) {

      let sample = { $or: [] }

      sample.$or.push({
        "propertyDetails.flatSize": size
      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              flatSize: size
            }
          }
        })

      filterQuery.$and.push(sample)

    }


    if (minSize) {

      let sample = { $or: [] }

      sample.$or.push({
        "propertyDetails.flatSize": { $gte: minSize }
      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              flatSize: { $gte: minSize }
            }
          }
        })

      filterQuery.$and.push(sample)
    }



    if (maxSize) {
      let sample = { $or: [] }



      sample.$or.push({
        "propertyDetails.flatSize": { $lte: maxSize }
      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              flatSize: { $lte: minSize }
            }
          }
        })


      filterQuery.$and.push(sample)

    }


    // if (minSize && maxSize) {

    //   let sample = { $or: [] }
    //   sample.$or.push({
    //     "propertyDetails.flatSize": { $gte: minSize, $lte: maxSize }
    //   },
    //     {
    //       "propertyDetails.flat": {
    //         $elemMatch: {
    //           flatSize: { $gte: minSize, $lte: maxSize }
    //         }
    //       }
    //     })

    //   filterQuery.$and.push(sample)
    // }




    if (size && sizeUnit) {
      let sample = { $or: [] }

      sample.$or.push({
        "propertyDetails.flatSize": size,
      }, {
        "propertyDetails.sizeUnit": sizeUnit,

      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              flatSize: size,
              flatSizeUnit: sizeUnit
            }
          },
        })

      filterQuery.$and.push(sample)
    }

    if (price) {

      let sample = { $or: [] }

      sample.$or.push({
        "propertyDetails.flatCost": { $lte: price }
      }, {
        "propertyDetails.flat": {
          $elemMatch: {
            flatCost: { $lte: price }
          }
        }
      })

      filterQuery.$and.push(sample)
    }

    if (amenities) {

      const amenty1 = JSON.stringify(amenities)
      console.log("amenities", amenty1)

      const amenty = JSON.parse(amenty1)
      console.log(amenty.powerSupply)

      if (amenty.powerSupply === true || amenty.powerSupply === false) {
        console.log("asdsadsadasd")

        filterQuery.$and.push({
          "amenities.powerSupply": amenty.powerSupply
        })
      }

      if (amenty.waterFacility === true || amenty.waterFacility === false) {
        filterQuery.$and.push({
          "amenities.waterFacility": amenty.waterFacility
        })
      }

      if (amenty.electricityFacility === true || amenty.electricityFacility === false) {
        filterQuery.$and.push({
          "amenities.electricityFacility": amenty.electricityFacility
        })
      }

      if (amenty.security === true || amenty.security === false) {
        filterQuery.$and.push({
          "amenities.watchman": amenty.security,
          "amenities.cctv": amenty.cctv
        })
      }

      if (amenty.gymFacility === true || amenty.gymFacility === false) {
        filterQuery.$and.push({
          "amenities.gymFacility": amenty.gymFacility
        })
      }

      if (amenty.elevator === true || amenty.elevator === false) {
        filterQuery.$and.push({
          "amenities.elevator": amenty.elevator
        })
      }
    }

    // if(approvals)
    // {
    //   const approve=JSON.parse(approvals)

    //   if(approve.)

    // }



    if (minPrice) {
      let sample = { $or: [] }

      sample.$or.push({
        "propertyDetails.flatCost": { $gte: minPrice }
      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              "flatCost": { $gte: minPrice }
            }
          }
        })

      filterQuery.$and.push(sample)
    }


    if (maxPrice) {

      let sample = { $or: [] }
      sample.$or.push({
        "propertyDetails.flatCost": { $lte: maxPrice }
      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              "flatCost": { $lte: maxPrice }
            }
          }
        })

      filterQuery.$and.push(sample)
    }

    if (minPrice && maxPrice) {
      let sample = { $or: [] }
      sample.$or.push({
        "propertyDetails.flatCost": { $gte: minPrice, $lte: maxPrice }
      },
        {
          "propertyDetails.flat": {
            $elemMatch: {
              "flatCost": { $gte: minPrice, $lte: maxPrice }
            }
          }
        })

      filterQuery.$and.push(sample)
    }



    if (road) {
      filterQuery.$and.push({
        "amenities.distanceFromRoad": road
      })
    }

    if (medical) {
      filterQuery.$and.push({
        "amenities.medical": medical
      })
    }

    if (educational) {
      filterQuery.$and.push({
        "amenities.educational": educational
      })
    }

    const residential = await residentialModel.find(filterQuery);


    console.log(filterQuery, residential)

    if (residential.length == 0) {
      res.status(409).json({
        "message": "No Data Found", "data": residential
      })
    }
    else {

      res.status(200).json({ "data": residential })
    }
  }
  catch (error) {
    res.status(500).json("Internal Server Error")
    console.log(error)
  }
}





const layoutSearch = async (req, res) => {
  try {

    const approvals = req.query.approvals
    const amenities = req.query.amenities
    const location = req.query.location
    const road = req.query.road
    const medical = req.query.medical

    const educational = req.query.educational

    const minPrice = req.query.minPrice
    const maxPrice = req.query.maxPrice

    const size = req.query.size

    const sizeUnit = req.query.sizeUnit


    let filterQuery = { $and: [] }



    if (minPrice) {
      let sample = { $or: [] }

      sample.$or.push({
        "layoutDetails.totalAmount": { $gte: minPrice }
      },
        {
          "layoutDetails.plots": {
            $elemMatch: { "plotAmount": { $gte: plotAmount } }
          }
        }
      )


      filterQuery.$and.push(sample)
    }

    if (maxPrice) {
      let sample = { $or: [] }

      sample.$or.push(
        { "layoutDetails.totalAmount": { $lte: maxPrice } },
        { "layoutDetails.plots": { $elemMatch: { "plotAmount": { $lte: maxPrice } } } }
      )

      filterQuery.$and.push(sample)
    }


    if (size) {
      let sample = { $or: [] }

      sample.$or.push(
        { "layoutDetails.plotSize": size },
        { "layoutDetails.plots": { $elemMatch: { "plotSize": size } } }
      )

      filterQuery.$and.push(sample)
    }

    if (location) {

      let sample = { $or: [] }
      sample.$or.push({
        "layoutDetails.address.district": location
      },
        {
          "layoutDetails.address.mandal": location

        },
        {
          "layoutDetails.address.village": location

        },
        {
          "layoutDetails.address.landMark": location

        }
      )


      filterQuery.$and.push(sample)
    }

    if (amenities) {
      const amenty1 = JSON.stringify(amenities)
      console.log("amenities", amenty1)

      const ameniti = JSON.parse(amenty1)

      if (ameniti.underGroundWater === true || ameniti.underGroundWater === false) {
        filterQuery.$and.push({
          "amenities.underGroundWater": ameniti.underGroundWater
        })
      }


      if (ameniti.drainageSystem === true || ameniti.drainageSystem === false) {
        filterQuery.$and.push({
          "amenities.drainageSystem": ameniti.drainageSystem
        })
      }

      if (ameniti.playZone === true || ameniti.playZone === false) {
        filterQuery.$and.push({
          "amenities.playZone": ameniti.playZone
        })
      }

      if (ameniti.conventionHall === true || ameniti.conventionHall === false) {
        filterQuery.$and.push({
          "amenities.conventionHall": ameniti.conventionHall
        })
      }

    }



    if (approvals) {
      const approval = JSON.parse(approvals)

      if (approval.reraRegistered) {
        filterQuery.$and.push({
          "layoutDetails.reraRegistered": approval.reraRegistered
        })
      }

      if (approval.dtcpApproved) {
        filterQuery.$and.push({
          "layoutDetails.dtcpApproved": approval.dtcpApproved
        })
      }

      if (approval.tlpApproved) {
        filterQuery.$and.push({
          "layoutDetails.tlpApproved": approval.tlpApproved
        })
      }

      if (approval.flpApproved) {
        filterQuery.$and.push({
          "layoutDetails.flpApproved": approval.flpApproved
        })
      }
    }


    if (road) {
      filterQuery.$and.push({
        "amenities.distanceFromRoad": road
      })
    }



    const layoutData = await layoutModel.find(filterQuery)

    if (layoutData.length === 0) {
      res.status(409).json({ message: "No Data Found", "data": layoutData })
    }
    else {
      res.status(200).json({ "data": layoutData })
    }
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ "message": "Internal Server Error" })

  }
}



const agriSearch = async (req, res) => {
  try {

    const location = req.query.location

    const maxPrice = req.query.maxPrice

    const minPrice = req.query.minPrice


    const landType = req.query.landType

    const amenities = req.query.amenities

    const litigation=req.query.litigation

   const road=req.query.road
    const size=req.query.size
    
    const sizeUnit=req.query.sizeUnit

    let filterQuery = { $and: [] }

    if (location) {
      let sample = { $or: [] }

      sample.$or.push({
        "address.district": location
      },
        {
          "address.mandal": location
        },
        {
          "address.landMark": location

        },
        {
          "address.village": location
        }

      )
      filterQuery.$and.push(sample)
    }

    if (maxPrice) {

      filterQuery.$and.push({ "landDetails.price": { $lte: maxPrice } }
      )
    }


    if (minPrice) {
      filterQuery.$and.push({ "landDetails.price": { $gte: minPrice } })
    }


    if (landType) {
      filterQuery.$and.push({ "landDetails.landType": landType })
    }
console.log("litigationnnn",litigation)

    if (litigation === "true" || litigation==="false") {

      console.log("litigation")
      filterQuery.$and.push(
        { "landDetails.litigation": litigation }
      )
    }

    if (amenities) {
      const aminiti = JSON.stringify(amenities)

      const amenitie = JSON.parse(aminiti)


      if (amenitie.boreWell === true || amenitie.boreWell === false) {
        filterQuery.$and.push(
          {
            "amenities.boreWell": amenitie.boreWell
          }
        )
      }


      if (amenitie.electricity) {
        filterQuery.$and.push(
          {
            "amenities.electricity": amenitie.electricity
          }
        )
      }


      if (amenitie.roadType) {
        filterQuery.$and.push(
          {
            "amenities.roadType": amenitie.roadType
          })
      }

      if (amenitie.storageFacility === true || amenitie.storageFacility === false) {
        filterQuery.$and.push(
          { "amenities.storageFacility": amenitie.storageFacility }
        )
      }


    }

    if(road)
    {
      filterQuery.$and.push(
        {
          "amenities.distanceFromRoad":road
        }
      )
    }
     
    if(size) 
    {
      filterQuery.$and.push(
        {"landDetails.size":size}
      )
    }

    if(sizeUnit)
    {
      filterQuery.$and.push(
        {"landDetails.sizeUnit":sizeUnit}
      )
    }

    const agriData=await fieldModel.find(filterQuery)

    if(agriData.length===0)
    {
      res.status(409).json({"message":"No Data Found","data":agriData})
    }
    else
    {
      res.status(200).json({"data":agriData})
    }
  }
  catch (error) {
    console.log(error)
    res.status(500).json({"message":"Internal Server Error"})
  }
}


const commercialSearch = async (req, res) => {
  try {
    const propertyFor = req.query.propertyFor

    const usage = req.query.usage

    const amenities = req.query.amenities

    const location = req.query.location

    const minPrice = req.query.minPrice
    const maxPrice = req.query.maxPrice
    
    const size=req.query.size
    const road=req.query.road

    let filterQuery = { $and: [] }


    if(road)
    {
      filterQuery.$and.push({
        "propertyDetails.amenities.distanceFromRoad":road
      })
    }

 
    if (minPrice) {
      let sample = { $or: [] }

      sample.$or.push({
        "propertyDetails.landDetails.sell.price": { $gte: minPrice }
      },
        {
          "propertyDetails.landDetails.rent.rent": { $gte: minPrice }

        },
        {
          "propertyDetails.landDetails.lease.leasePrice": { $gte: minPrice }

        }
      )


      filterQuery.$and.push(sample)
    }

    if (maxPrice) {
      let sample = { $or: [] }

      sample.$or.push(
        {
          "propertyDetails.landDetails.sell.price": { $lte: maxPrice }
        },
        {
          "propertyDetails.landDetails.rent.rent": { $lte: maxPrice }

        },
        {
          "propertyDetails.landDetails.lease.leasePrice": { $lte: maxPrice }

        }
      )

      filterQuery.$and.push(sample)
    }


    if (size) {
      let sample = { $or: [] }

      sample.$or.push(
        {
          "propertyDetails.landDetails.sell.plotSize": size 
        },
        {
          "propertyDetails.landDetails.rent.plotSize": size 

        },
        {
          "propertyDetails.landDetails.lease.plotSize": size 

        }
      )

      filterQuery.$and.push(sample)
    }

    if (propertyFor) {


      console.log("sell", propertyFor)
      if (propertyFor === "sell" || propertyFor == "Sell") {
        console.log("sell", propertyFor)
        filterQuery.$and.push({
          $expr: { $gt: [{ $size: "$propertyDetails.landDetails.sell.landUsage" }, 0] }
        });
      }

      if (propertyFor === "rent" || propertyFor === "Rent") {
        filterQuery.$and.push({
          $expr: { $gt: [{ $size: "$propertyDetails.landDetails.rent.landUsage" }, 0] }
        });
      }


      if (propertyFor === "lease" || propertyFor === "Lease") {
        filterQuery.$and.push({
          $expr: { $gt: [{ $size: "$propertyDetails.landDetails.lease.landUsage" }, 0] }
        });
      }
    }

 

    if (usage && Array.isArray(usage) && usage.length > 0) {
      let sample = { $or: [] };

      console.log("usage:", usage);

      sample.$or.push(
        {
          "propertyDetails.landDetails.sell.landUsage": { $in: usage }
        },
        {
          "propertyDetails.landDetails.rent.landUsage": { $in: usage }
        },
        {
          "propertyDetails.landDetails.lease.landUsage": { $in: usage }
        }
      );

      console.log("sample query:", sample);

      try {
        const commData = await commercialModel.find(sample);
        console.log("dataaaaaaaa", commData);

        if (!filterQuery.$and) {
          filterQuery.$and = [];
        }

        filterQuery.$and.push(sample);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }



    if (amenities) {
      const amenity = JSON.parse(amenities)

      if (amenity.isElectricity === true || amenity.isElectricity === false) {
        filterQuery.$and.push({
          "propertyDetails.amenities.isElectricity": amenity.isElectricity
        })
      }
      if (amenity.isWaterFacility === true || amenity.isWaterFacility === false) {
        filterQuery.$and.push({
          "propertyDetails.amenities.isWaterFacility": amenity.isWaterFacility
        })
      }

      if (amenity.isRoadFace === true || amenity.isRoadFace === false) {
        filterQuery.$and.push({
          "propertyDetails.amenities.isRoadFace": amenity.isRoadFace
        })
      }
    }


    console.log("Filter", filterQuery)

    if (location) {

      let sample = { $or: [] }
      sample.$or.push({
        "propertyDetails.landDetails.address.district": location
      },
        {
          "layoutDetails.landDetails.address.mandal": location

        },
        {
          "layoutDetails.landDetails.address.village": location

        },
        {
          "layoutDetails.landDetails.address.landMark": location

        }
      )


      filterQuery.$and.push(sample)
    }

    console.log("filterQuery.$and:");
    filterQuery.$and.forEach((item, index) => {
      console.log(`Item ${index}:`, item.$or);
    });
    const commData = await commercialModel.find(filterQuery)






    if (commData.length === 0) {
      res.status(409).json({ "message": "No Data Found", "data": commData })
    }
    else {
      res.status(200).json({ "data": commData })
    }


  }
  catch (error) {
    console.log(error)
    res.status(500).json({ "message": "Internal Server Error" })
  }
}


const payment = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
    });
    console.log("paymentIntent", paymentIntent)
    res.send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.log("error", error)
    res.status(500).send({ error: error.message });
  }
}






module.exports = {
  residentialSearch,
  payment,
  layoutSearch,
  commercialSearch,
  agriSearch
}