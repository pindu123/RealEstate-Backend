const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const residentialModel = require("../models/residentialModel");
const userModel = require("../models/userModel");
const viewsModel = require("../models/viewsModel");
const residentialRoutes = require("../routes/residentialRoutes");

const updateViewCount = async (req, res) => {
  try {
    const { userId, role } = req.user.user;
    const { propertyId, propertyType } = req.body;

    console.log(req.body);

    // Check if the document already exists
    const docs = await viewsModel.find({
      userId: userId,
      role: role,
      propertyId: propertyId,
    });

    if (docs.length !== 0) {
      const countDocs = docs[0].viewsCount;
      console.log("Existing document count:", countDocs);

      // Increment count or set to 1 if it's a new entry
      let newCount = countDocs + 1;
      console.log(newCount);
      // Update the existing document's view count
      const updated = await viewsModel.updateOne(
        { userId: userId, role: role, propertyId: propertyId },
        { $set: { viewsCount: newCount } }
      );
      console.log("Update result:", updated);
      return res
        .status(200)
        .json({ message: "View count updated", viewsCount: newCount });
    }

    // Create a new document if no existing match is found
    let data = {
      userId,
      role,
      propertyId,
      propertyType,
      viewsCount: 1, // Ensure this matches your schema field
    };

    console.log("New document data:", data);

    const newData = new viewsModel(data);
    await newData.save();
    console.log("New document saved:", newData);

    res.status(200).json({ message: "New view count added", newData });
  } catch (error) {
    console.error("Error during operation:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//total no. of views
const totalViews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const views = await viewsModel.find({ propertyId });
    let count = 0;
    views.forEach((view) => {
      count = count + view.viewsCount;
    });
    console.log(count);
    res.status(200).json(count);
  } catch (error) {
    console.log(error,'view error');
    res.status(500).json("Internal server error");
  }
};

//no. of views from the same buyer for the same property
const viewsFromABuyer = async (req, res) => {
  try {
    
    const { propertyId } = req.params;
    const views = await viewsModel.find({ propertyId }).sort({ updatedAt: -1 });
    const result = await Promise.all(
      views.map(async (view) => {
        const user = await userModel.findOne({ _id: view.userId });
        const buyerName = user.firstName + " " + user.lastName;
        const phone=user.phoneNumber;
        const email=user.email;
        const profilePicture=user.profilePicture;
        return {
          buyerName: buyerName,
          profilePicture:profilePicture,
          viewsCount: view.viewsCount,
          createdAt: view.createdAt,
          updatedAt: view.updatedAt,
          phone:phone,
          email:email,
        };
      })
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error,'view error')
    res.status(500).json("Internal server error");
  }
};

const getRecientView = async (req, res) => {};

const getTopView = async (req, res) => {
  try {
    const userData = await userModel.find({ role: 3 });
    let topViews = [];
    for (let user of userData) {
      let userId = user.id;
      const views = await viewsModel.find({ userId: userId });
      let totalViews = 0;

      views.forEach(async (view) => {
        totalViews += view.viewsCount;
      });
      let buyer = {
        name: user.firstName + " " + user.lastName,
        userId: user.id,
        profile: user.profilePicture,
        totalViews: totalViews,
      };
      topViews.push(buyer);
    }

    topViews.sort((a, b) => b.totalViews - a.totalViews);
    res.status(200).json({ topViews: topViews });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getTopProperties = async (req, res) => {
  try {
    const field = await fieldModel.find();
    const com = await commercialModel.find();
    const layout = await layoutModel.find();
    const resi = await residentialModel.find();
    let propViews = [];

    for (const item of field) {
      let id = item.id;
      const views = await viewsModel.find({ propertyId: id });
      let vc = 0;
      for (const i of views) {
        vc += i.viewsCount;
      }

      let prop = {
        propertyId: id,
        propertyName: item.landDetails.title,
        viewsCount: vc,
        propertyImage: item.landDetails.images[0],

        propertyType: item.propertyType,
        ownerName: item.ownerDetails.ownerName,
        ownerContact: item.ownerDetails.phoneNumber,
        electricity: item.amenities.electricity,
        BoreWell: item.amenities.boreWell,
        StorageFacility: item.amenities.storageFacility,
        distanceFromRoad: item.amenities.distanceFromRoad,
        pincode: item.address.pinCode,
        village: item.address.village,
        mandal: item.address.mandal,
        district: item.address.district,
        state: item.address.state,
        country: item.address.country,
        landType: item.landDetails.landType,
        crops: item.landDetails.crops,
        size: item.landDetails.size,
        price: item.landDetails.priceUnit,
        totalPrice: item.landDetails.price,
      };
      propViews.push(prop);
    }

    for (const item of com) {
      const views = await viewsModel.find({ propertyId: item.id });
      let vc = 0;
      for (const i of views) {
        vc += i.viewsCount;
      }
      let prop = {
        propertyId: item.id,
        propertyName: item.propertyTitle,
        viewsCount: vc,
        propertyImage: item.propertyDetails.uploadPics[0],
        propertyType: item.propertyType,

        ownerName: item.propertyDetails.owner.ownerName,
        ownerContact: item.propertyDetails.owner.ownerContact,
        ownerEmail: item.propertyDetails.owner.ownerEmail,
        electricity: item.propertyDetails.amenities.isElectricity,
        water: item.propertyDetails.amenities.isWaterFacility,

        plotSize:
          item.propertyDetails.landDetails.sell.plotSize ||
          item.propertyDetails.landDetails.rent.plotSize ||
          item.propertyDetails.landDetails.lease.plotSize,
        price:
          item.propertyDetails.landDetails.sell.priceUnit ||
          item.propertyDetails.landDetails.rent.priceUnit ||
          item.propertyDetails.landDetails.lease.priceUnit,
        totalPrice:
          item.propertyDetails.landDetails.sell.totalAmount ||
          item.propertyDetails.landDetails.rent.totalAmount ||
          item.propertyDetails.landDetails.lease.totalAmount,

        pincode: item.propertyDetails.landDetails.address.pinCode,
        village: item.propertyDetails.landDetails.address.village,
        mandal: item.propertyDetails.landDetails.address.mandal,
        district: item.propertyDetails.landDetails.address.district,
        state: item.propertyDetails.landDetails.address.state,
        country: item.propertyDetails.landDetails.address.country,
      };
      propViews.push(prop);
    }

    for (const item of layout) {
      const views = await viewsModel.find({ propertyId: item.id });

      let vc = 0;
      for (const i of views) {
        vc += i.viewsCount;
      }

      let prop = {
        propertyId: item.id,
        propertyName: item.layoutDetails.layoutTitle,
        viewsCount: vc,
        propertyImage: item.uploadPics[0],

        propertyType: item.propertyType,

        ownerName: item.ownerDetails.ownerName,
        ownerContact: item.ownerDetails.ownerContact,
        ownerEmail: item.ownerDetails.ownerEmail,

        electricity: item.amenities.electricityFacility,
        swimmingPool: item.amenities.swimmingPool,
        playGround: item.amenities.playZone,
        gym: item.amenities.gym,
        water: item.amenities.underGroundWater,
        drainageSystem: item.amenities.drainageSystem,
        conventionHall: item.amenities.conventionHall,

        plotSize: item.layoutDetails.plotSize,
        plotCount: item.layoutDetails.plotCount,
        plotPrice: item.layoutDetails.plotPrice,
        totalPrice: item.layoutDetails.totalAmount,

        pincode: item.layoutDetails.address.pinCode,
        village: item.layoutDetails.address.village,
        mandal: item.layoutDetails.address.mandal,
        district: item.layoutDetails.address.district,
        state: item.layoutDetails.address.state,
        country: item.layoutDetails.address.country,
      };
      propViews.push(prop);
    }

    for (const item of resi) {
      const views = await viewsModel.find({ propertyId: item.id });

      let vc = 0;
      for (const i of views) {
        vc += i.viewsCount;
      }
      let prop = {
        propertyId: item.id,
        propertyName: item.propertyDetails.apartmentName,
        viewsCount: vc,
        propertyImage: item.propPhotos[0],

        propertyType: item.propertyType,

        ownerName: item.owner.ownerName,
        ownerContact: item.owner.contact,
        ownerEmail: item.owner.ownerEmail,
        water: item.amenities.waterFacility,
        grocery: item.amenities.grocery,
        gym: item.amenities.gym,
        educational: item.amenities.educational,
        medical: item.amenities.medical,

        plotSize: item.propertyDetails.flatSize,
        price: item.propertyDetails.flatCost,
        totalPrice: item.propertyDetails.totalCost,
        pincode: item.address.pinCode,
        village: item.address.village,
        mandal: item.address.mandal,
        district: item.address.district,
        state: item.address.state,
        country: item.address.country,
      };
      propViews.push(prop);
    }

    console.log(propViews);
    // Sort properties by views count in descending order
    propViews.sort((a, b) => b.viewsCount - a.viewsCount);
    res.status(200).json(propViews);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const totalViews1 = async (req, res) => {

  try {
    console.log('in total views')
 const { propertyId,propertyType } = req.params;
 const views = await viewsModel.find({ propertyId:propertyId });
 console.log(views,'views')
 
 let intrestedCount=0;
 if(propertyType==="Residential")
  {
 const data=await residentialModel.findById(propertyId);
 intrestedCount=data.propertyInterestedCount;
 console.log("intrestedCount",data)
 }
 else if(propertyType==="Commercial")
  {
 const data=await commercialModel.findById(propertyId);
  intrestedCount=data.propertyInterestedCount;
  console.log("intrestedCount",data)

  }
 else if(propertyType==="Layout")
 {
 const data=await layoutModel.findById(propertyId);
  intrestedCount=data.propertyInterestedCount;
  console.log("intrestedCount",data)

 }
 else
 {
 const data=await fieldModel.findById(propertyId);
  intrestedCount=data.propertyInterestedCount;
  console.log("intrestedCount",data._id,data.propertyInterestedCount)

 }
 
 let viewrs=[]
 
  console.log("views",views)
  for(let view of views)
  {
    console.log("view1232443432",view)
    const user=await userModel.find({_id:view.userId})
console.log("user",user)
if(user.length>0)
{
  viewrs.push(user)
}

   // if(!viewrs.includes(view.userId))
    // {
    //   views.push(view.userId)
    // }
  }

 


  let uniqueViews = [];
  let userIds = new Set();  // Set to track unique userIds
  
  for (let view of views) {
    // If the userId is not in the Set, add it and push the view to uniqueViews
    if (!userIds.has(view.userId)) {
      userIds.add(view.userId);  // Add userId to the Set
      uniqueViews.push(view);     // Add the view to the uniqueViews array
    }
  }


  console.log("viewrs.length",uniqueViews.length,viewrs.length)
 
 
 let count = 0;
  views.forEach((view) => {
  count = count + view.viewsCount;
  });
  console.log(count);
  res.status(200).json({"viewCount":count,"buyerCount":intrestedCount||0,"viewrsCount":uniqueViews.length});
  } catch (error) {
  console.log(error,'view error');
  res.status(500).json("Internal server error");
  }
 };





module.exports = {
  updateViewCount,
  totalViews,
  viewsFromABuyer,
  getTopView,
  getTopProperties,
  totalViews1,
};
