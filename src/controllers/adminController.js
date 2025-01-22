const bookingModel = require("../models/bookingModel");
const commercialModel = require("../models/commercialModel");
const fieldModel = require("../models/fieldModel");
const layoutModel = require("../models/layoutModel");
const notifyModel = require("../models/notificationModel");
const residentialModel = require("../models/residentialModel");
const userModel = require("../models/userModel");

const { ObjectId } = require("mongodb");
    
const countOfPropsInMandal = async (req, res) => {
  try {
    const { type, mandal } = req.params;
    let props;
    if (type === "agriculture") {
      props = await fieldModel.countDocuments({ "address.mandal": mandal });
    } else if (type === "residential") {
      props = await residentialModel.countDocuments({
        "address.mandal": mandal,
      });
    } else if (type === "layout") {
      props = await layoutModel.countDocuments({
        "layoutDetails.address.mandal": mandal,
      });
    } else if (type === "commercial") {
      props = await commercialModel.countDocuments({
        "propertyDetails.landDetails.address.mandal": mandal,
      });
    }
    return res.status(200).json(props);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

const countOfPropsInVillage = async (req, res) => {
  try {
    const { type, village } = req.params;
    let props;
    if (type === "agriculture") {
      props = await fieldModel.countDocuments({ "address.village": village });
    } else if (type === "residential") {
      props = await residentialModel.countDocuments({
        "address.village": village,
      });
    } else if (type === "layout") {
      props = await layoutModel.countDocuments({
        "layoutDetails.address.village": village,
      });
    } else if (type === "commercial") {
      props = await commercialModel.countDocuments({
        "propertyDetails.landDetails.address.village": village,
      });
    }
    return res.status(200).json(props);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

const countOfPropsInDistrict = async (req, res) => {
  try {
    const { type, district } = req.params;
    let soldprops, unsoldprops;
    if (type === "agriculture") {
      soldprops = await fieldModel.countDocuments({
        "address.district": district,
        status: 1,
      });
      unsoldprops = await fieldModel.countDocuments({
        "address.district": district,
        status: 0,
      });
    } else if (type === "residential") {
      soldprops = await residentialModel.countDocuments({
        "address.district": district,
        status: 1,
      });
      unsoldprops = await residentialModel.countDocuments({
        "address.district": district,
        status: 0,
      });
    } else if (type === "layout") {
      soldprops = await layoutModel.countDocuments({
        "layoutDetails.address.district": district,
        status: 1,
      });
      unsoldprops = await layoutModel.countDocuments({
        "layoutDetails.address.district": district,
        status: 0,
      });
    } else if (type === "commercial") {
      soldprops = await commercialModel.countDocuments({
        "propertyDetails.landDetails.address.district": district,
        status: 1,
      });
      unsoldprops = await commercialModel.countDocuments({
        "propertyDetails.landDetails.address.district": district,
        status: 0,
      });
    }
    return res.status(200).json({ sold: soldprops, unsold: unsoldprops });
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await userModel.find({ role: 1 }, { password: 0 });
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json(agents);
  }
};

const removeAgent = async (req, res) => {
  try {
    const result = await userModel.findByIdAndDelete({
      _id: req.params.agentId,
    });
    const result1 = await bookingModel.deleteMany({
      agentId: req.params.agentId,
    });
    if (!result) {
      res.status(409).json(" Agent Not Found ");
    }
    res.status(200).json("Agent Removed Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getFeildStats = async (req, res) => {
  try {
    const soldData = await fieldModel.find({ status: 1 });
    const unSoldData = await fieldModel.find({ status: 0 });
    const data = await fieldModel.find();

    let totalPrice = 0;

    data.forEach((item) => {
      totalPrice += item.landDetails.price;
    });

    let result = {
      sold: soldData.length,
      unSoldData: unSoldData.length,
      totalProperties: data.length,
      totalValue: totalPrice,
    };
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getCommercialStats = async (req, res) => {
  try {
    const soldData = await commercialModel.find({ status: 1 });
    const unSoldData = await commercialModel.find({ status: 0 });

    let rentSold = 0;
    let leaseSold = 0;
    let sellSold = 0;
    let rentUnSold = 0;
    let leaseUnSold = 0;
    let sellUnSold = 0;
    let totalProperty = soldData.length + unSoldData.length;

    let totalPrice = 0;
    soldData.forEach((item) => {
      if (item.propertyDetails.landDetails.rent.landUsage.length > 0) {
        rentSold += 1;
        totalPrice += item.propertyDetails.landDetails.rent.totalAmount;
      }

      if (item.propertyDetails.landDetails.lease.landUsage.length > 0) {
        leaseSold += 1;

        totalPrice += item.propertyDetails.landDetails.lease.totalAmount;
      }
      if (item.propertyDetails.landDetails.sell.landUsage.length > 0) {
        sellSold += 1;
        totalPrice += item.propertyDetails.landDetails.sell.totalAmount;
      }
    });

    unSoldData.forEach((item) => {
      if (item.propertyDetails.landDetails.rent.landUsage.length > 0) {
        rentUnSold += 1;
        totalPrice += item.propertyDetails.landDetails.rent.totalAmount;
      }

      if (item.propertyDetails.landDetails.lease.landUsage.length > 0) {
        leaseUnSold += 1;
        totalPrice += item.propertyDetails.landDetails.lease.totalAmount;
      }
      if (item.propertyDetails.landDetails.sell.landUsage.length > 0) {
        sellUnSold += 1;
        totalPrice += item.propertyDetails.landDetails.sell.totalAmount;
      }
    });
    let result = {
      sold: {
        rent: rentSold,
        lease: leaseSold,
        sell: sellSold,
      },
      unSold: {
        rent: rentUnSold,
        lease: leaseUnSold,
        sell: sellUnSold,
      },
      totalProperty: totalProperty,
      totalValue: totalPrice,
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getResidentialStats = async (req, res) => {
  try {
    const soldData = await residentialModel.find({ status: 1 });
    const unSoldData = await residentialModel.find({ status: 0 });

    let appartSold = 0;
    let buildingSold = 0;
    let appartUnSold = 0;
    let buildingUnSold = 0;
    let totalPrice = 0;
    soldData.forEach((item) => {
      if (item.propertyDetails.type === "Flat") {
        appartSold += 1;
        totalPrice += item.propertyDetails.totalCost;
      }

      if (item.propertyDetails.type === "House") {
        buildingSold += 1;
        totalPrice += item.propertyDetails.totalCost;
      }
    });

    unSoldData.forEach((item) => {
      if (item.propertyDetails.type === "Flat") {
        appartUnSold += 1;
        totalPrice += item.propertyDetails.totalCost;
      }

      if (item.propertyDetails.type === "House") {
        buildingUnSold += 1;
        totalPrice += item.propertyDetails.totalCost;
      }
    });

    let totalProperty = soldData.length + unSoldData.length;

    let result = {
      sold: {
        flat: appartSold,
        house: buildingSold,
      },
      unSold: {
        flat: appartUnSold,
        house: buildingUnSold,
      },
      totalProperty: totalProperty,
      totalValue: totalPrice,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const getLayoutStats = async (req, res) => {
  try {
    const soldData = await layoutModel.find({ status: 1 });
    const unSoldData = await layoutModel.find({ status: 0 });
    let totalProperty = soldData.length + unSoldData.length;
    let totalPrice = 0;

    soldData.forEach((item) => {
      totalPrice += item.layoutDetails.totalAmount;
    });

    unSoldData.forEach((item) => {
      totalPrice += item.layoutDetails.totalAmount;
    });
    let result = {
      sold: soldData.length,
      unSold: unSoldData.length,
      totalProperty: totalProperty,
      totalValue: totalPrice,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const removeProperties = async (req, res) => {
  try {
    let result;

    if (req.params.type === "Agricultural land") {
      result = await fieldModel.findByIdAndDelete({
        _id: req.params.propertyId,
      });
    } else if (req.params.type === "Commercial") {
      result = await commercialModel.findByIdAndDelete({
        _id: req.params.propertyId,
      });
    } else if (req.params.type === "Layout") {
      result = await layoutModel.findByIdAndDelete({
        _id: req.params.propertyId,
      });
    } else {
      result = await residentialModel.findByIdAndDelete({
        _id: req.params.propertyId,
      });
    }
    if (!result) {
      res.status(404).json(" Property Not Found ");
    }
    res.status(200).json("Property Removed Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getTotalSales = async (req, res) => {
  try {
    const fieldsSold = await fieldModel.find({ status: 1 });
    const comSold = await commercialModel.find({ status: 1 });
    const layoutSold = await layoutModel.find({ status: 1 });
    const resSold = await residentialModel.find({ status: 1 });

    const fields = await fieldModel.find();
    const com = await commercialModel.find();
    const layout = await layoutModel.find();
    const resi = await residentialModel.find();
    const totalProperty =
      fields.length + com.length + resi.length + layout.length;
    const totalSales =
      fieldsSold.length + comSold.length + layoutSold.length + resSold.length;
    res
      .status(200)
      .json({ totalSales: totalSales, totalProperty: totalProperty });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getStateWiseStats = async (req, res) => {
  try {
    const feilds = await fieldModel.find();
    const commercial = await commercialModel.find();
    const residential = await residentialModel.find();
    const layout = await layoutModel.find();

    let ap = 0; // Andhra Pradesh
    let tn = 0; // Tamil Nadu
    let ts = 0; // Telangana
    let od = 0; // Odisha
    let k = 0; // Karnataka
    let mp = 0; // Madhya Pradesh
    let ar = 0; // Arunachal Pradesh
    let as = 0; // Assam
    let br = 0; // Bihar
    let cg = 0; // Chhattisgarh
    let ga = 0; // Goa
    let gj = 0; // Gujarat
    let hr = 0; // Haryana
    let hp = 0; // Himachal Pradesh
    let jh = 0; // Jharkhand
    let kl = 0; // Kerala
    let ml = 0; // Meghalaya
    let mz = 0; // Mizoram
    let mn = 0; // Manipur
    let nl = 0; // Nagaland
    let pb = 0; // Punjab
    let rj = 0; // Rajasthan
    let sk = 0; // Sikkim
    let up = 0; // Uttar Pradesh
    let uk = 0; // Uttarakhand
    let wb = 0; // West Bengal
    let an = 0; // Andaman and Nicobar Islands
    let ch = 0; // Chandigarh
    let dn = 0; // Dadra and Nagar Haveli and Daman and Diu
    let lk = 0; // Lakshadweep
    let dl = 0; // Delhi
    let py = 0; // Puducherry

    for (let prop of feilds) {
      if (prop.propertyType === "Agricultural land") {
        if (prop.address.state === "Andhra Pradesh") {
          ap += 1;
        } else if (prop.address.state === "Tamil Nadu") {
          tn += 1;
        } else if (prop.address.state === "Telangana") {
          ts += 1;
        } else if (prop.address.state === "Odisha") {
          od += 1;
        } else if (prop.address.state === "Karnataka") {
          k += 1;
        } else if (prop.address.state === "Madhya Pradesh") {
          mp += 1;
        } else if (prop.address.state === "Arunachal Pradesh") {
          ar += 1;
        } else if (prop.address.state === "Assam") {
          as += 1;
        } else if (prop.address.state === "Bihar") {
          br += 1;
        } else if (prop.address.state === "Chhattisgarh") {
          cg += 1;
        } else if (prop.address.state === "Goa") {
          ga += 1;
        } else if (prop.address.state === "Gujarat") {
          gj += 1;
        } else if (prop.address.state === "Haryana") {
          hr += 1;
        } else if (prop.address.state === "Himachal Pradesh") {
          hp += 1;
        } else if (prop.address.state === "Jharkhand") {
          jh += 1;
        } else if (prop.address.state === "Kerala") {
          kl += 1;
        } else if (prop.address.state === "Meghalaya") {
          ml += 1;
        } else if (prop.address.state === "Mizoram") {
          mz += 1;
        } else if (prop.address.state === "Manipur") {
          mn += 1;
        } else if (prop.address.state === "Nagaland") {
          nl += 1;
        } else if (prop.address.state === "Punjab") {
          pb += 1;
        } else if (prop.address.state === "Rajasthan") {
          rj += 1;
        } else if (prop.address.state === "Sikkim") {
          sk += 1;
        } else if (prop.address.state === "Uttar Pradesh") {
          up += 1;
        } else if (prop.address.state === "Uttarakhand") {
          uk += 1;
        } else if (prop.address.state === "West Bengal") {
          wb += 1;
        } else if (prop.address.state === "Andaman and Nicobar Islands") {
          an += 1;
        } else if (prop.address.state === "Chandigarh") {
          ch += 1;
        } else if (
          prop.address.state === "Dadra and Nagar Haveli and Daman and Diu"
        ) {
          dn += 1;
        } else if (prop.address.state === "Lakshadweep") {
          lk += 1;
        } else if (prop.address.state === "Delhi") {
          dl += 1;
        } else if (prop.address.state === "Puducherry") {
          py += 1;
        }
      }
    }

    for (let prop of commercial) {
      if (prop.propertyType === "Commercial") {
        if (
          prop.propertyDetails.landDetails.address.state === "Andhra Pradesh"
        ) {
          ap += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Tamil Nadu"
        ) {
          tn += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Telangana"
        ) {
          ts += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Odisha"
        ) {
          od += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Karnataka"
        ) {
          k += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Madhya Pradesh"
        ) {
          mp += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Arunachal Pradesh"
        ) {
          ar += 1;
        } else if (prop.propertyDetails.landDetails.address.state === "Assam") {
          as += 1;
        } else if (prop.propertyDetails.landDetails.address.state === "Bihar") {
          br += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Chhattisgarh"
        ) {
          cg += 1;
        } else if (prop.propertyDetails.landDetails.address.state === "Goa") {
          ga += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Gujarat"
        ) {
          gj += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Haryana"
        ) {
          hr += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Himachal Pradesh"
        ) {
          hp += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Jharkhand"
        ) {
          jh += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Kerala"
        ) {
          kl += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Meghalaya"
        ) {
          ml += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Mizoram"
        ) {
          mz += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Manipur"
        ) {
          mn += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Nagaland"
        ) {
          nl += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Punjab"
        ) {
          pb += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Rajasthan"
        ) {
          rj += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Sikkim"
        ) {
          sk += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Uttar Pradesh"
        ) {
          up += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Uttarakhand"
        ) {
          uk += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "West Bengal"
        ) {
          wb += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state ===
          "Andaman and Nicobar Islands"
        ) {
          an += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Chandigarh"
        ) {
          ch += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state ===
          "Dadra and Nagar Haveli and Daman and Diu"
        ) {
          dn += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Lakshadweep"
        ) {
          lk += 1;
        } else if (prop.propertyDetails.landDetails.address.state === "Delhi") {
          dl += 1;
        } else if (
          prop.propertyDetails.landDetails.address.state === "Puducherry"
        ) {
          py += 1;
        }
      }
    }

    for (let prop of residential) {
      if (prop.propertyType === "Residential") {
        if (prop.address.state === "Andhra Pradesh") {
          ap += 1;
        } else if (prop.address.state === "Tamil Nadu") {
          tn += 1;
        } else if (prop.address.state === "Telangana") {
          ts += 1;
        } else if (prop.address.state === "Odisha") {
          od += 1;
        } else if (prop.address.state === "Karnataka") {
          k += 1;
        } else if (prop.address.state === "Madhya Pradesh") {
          mp += 1;
        } else if (prop.address.state === "Arunachal Pradesh") {
          ar += 1;
        } else if (prop.address.state === "Assam") {
          as += 1;
        } else if (prop.address.state === "Bihar") {
          br += 1;
        } else if (prop.address.state === "Chhattisgarh") {
          cg += 1;
        } else if (prop.address.state === "Goa") {
          ga += 1;
        } else if (prop.address.state === "Gujarat") {
          gj += 1;
        } else if (prop.address.state === "Haryana") {
          hr += 1;
        } else if (prop.address.state === "Himachal Pradesh") {
          hp += 1;
        } else if (prop.address.state === "Jharkhand") {
          jh += 1;
        } else if (prop.address.state === "Kerala") {
          kl += 1;
        } else if (prop.address.state === "Meghalaya") {
          ml += 1;
        } else if (prop.address.state === "Mizoram") {
          mz += 1;
        } else if (prop.address.state === "Manipur") {
          mn += 1;
        } else if (prop.address.state === "Nagaland") {
          nl += 1;
        } else if (prop.address.state === "Punjab") {
          pb += 1;
        } else if (prop.address.state === "Rajasthan") {
          rj += 1;
        } else if (prop.address.state === "Sikkim") {
          sk += 1;
        } else if (prop.address.state === "Uttar Pradesh") {
          up += 1;
        } else if (prop.address.state === "Uttarakhand") {
          uk += 1;
        } else if (prop.address.state === "West Bengal") {
          wb += 1;
        } else if (prop.address.state === "Andaman and Nicobar Islands") {
          an += 1;
        } else if (prop.address.state === "Chandigarh") {
          ch += 1;
        } else if (
          prop.address.state === "Dadra and Nagar Haveli and Daman and Diu"
        ) {
          dn += 1;
        } else if (prop.address.state === "Lakshadweep") {
          lk += 1;
        } else if (prop.address.state === "Delhi") {
          dl += 1;
        } else if (prop.address.state === "Puducherry") {
          py += 1;
        }
      }
    }

    for (let prop of layout) {
      if (prop.propertyType === "Layout") {
        if (prop.layoutDetails.address.state === "Andhra Pradesh") {
          ap += 1;
        } else if (prop.layoutDetails.address.state === "Tamil Nadu") {
          tn += 1;
        } else if (prop.layoutDetails.address.state === "Telangana") {
          ts += 1;
        } else if (prop.layoutDetails.address.state === "Odisha") {
          od += 1;
        } else if (prop.layoutDetails.address.state === "Karnataka") {
          k += 1;
        } else if (prop.layoutDetails.address.state === "Madhya Pradesh") {
          mp += 1;
        } else if (prop.layoutDetails.address.state === "Arunachal Pradesh") {
          ar += 1;
        } else if (prop.layoutDetails.address.state === "Assam") {
          as += 1;
        } else if (prop.layoutDetails.address.state === "Bihar") {
          br += 1;
        } else if (prop.layoutDetails.address.state === "Chhattisgarh") {
          cg += 1;
        } else if (prop.layoutDetails.address.state === "Goa") {
          ga += 1;
        } else if (prop.layoutDetails.address.state === "Gujarat") {
          gj += 1;
        } else if (prop.layoutDetails.address.state === "Haryana") {
          hr += 1;
        } else if (prop.layoutDetails.address.state === "Himachal Pradesh") {
          hp += 1;
        } else if (prop.layoutDetails.address.state === "Jharkhand") {
          jh += 1;
        } else if (prop.layoutDetails.address.state === "Kerala") {
          kl += 1;
        } else if (prop.layoutDetails.address.state === "Meghalaya") {
          ml += 1;
        } else if (prop.layoutDetails.address.state === "Mizoram") {
          mz += 1;
        } else if (prop.layoutDetails.address.state === "Manipur") {
          mn += 1;
        } else if (prop.layoutDetails.address.state === "Nagaland") {
          nl += 1;
        } else if (prop.layoutDetails.address.state === "Punjab") {
          pb += 1;
        } else if (prop.layoutDetails.address.state === "Rajasthan") {
          rj += 1;
        } else if (prop.layoutDetails.address.state === "Sikkim") {
          sk += 1;
        } else if (prop.layoutDetails.address.state === "Uttar Pradesh") {
          up += 1;
        } else if (prop.layoutDetails.address.state === "Uttarakhand") {
          uk += 1;
        } else if (prop.layoutDetails.address.state === "West Bengal") {
          wb += 1;
        } else if (
          prop.layoutDetails.address.state === "Andaman and Nicobar Islands"
        ) {
          an += 1;
        } else if (prop.layoutDetails.address.state === "Chandigarh") {
          ch += 1;
        } else if (
          prop.layoutDetails.address.state ===
          "Dadra and Nagar Haveli and Daman and Diu"
        ) {
          dn += 1;
        } else if (prop.layoutDetails.address.state === "Lakshadweep") {
          lk += 1;
        } else if (prop.layoutDetails.address.state === "Delhi") {
          dl += 1;
        } else if (prop.layoutDetails.address.state === "Puducherry") {
          py += 1;
        }
      }
    }

    let result = {
      "Andhra Pradesh": ap,
      "Tamil Nadu": tn,
      Telangana: ts,
      Odisha: od,
      Karnataka: k,
      "Madhya Pradesh": mp,
      "Arunachal Pradesh": ar,
      Assam: as,
      Bihar: br,
      Chhattisgarh: cg,
      Goa: ga,
      Gujarat: gj,
      Haryana: hr,
      "Himachal Pradesh": hp,
      Jharkhand: jh,
      Kerala: kl,
      Meghalaya: ml,
      Mizoram: mz,
      Manipur: mn,
      Nagaland: nl,
      Punjab: pb,
      Rajasthan: rj,
      Sikkim: sk,
      "Uttar Pradesh": up,
      Uttarakhand: uk,
      "West Bengal": wb,
      "Andaman and Nicobar Islands": an,
      Chandigarh: ch,
      "Dadra and Nagar Haveli and Daman and Diu": dn,
      Lakshadweep: lk,
      Delhi: dl,
      Puducherry: py,
    };
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

// const getTopPropOnPrice = async (req, res) => {
//   try {
//     let fieldData = await fieldModel.find();
//     let comData = await commercialModel.find();
//     let layoutData = await layoutModel.find();
//     let resData = await residentialModel.find();

//     let totalProps = [...fieldData, ...comData, ...layoutData, ...resData];
//     let maxprice = 0;
//    let properties=[]
//     for (let prop of totalProps) {
//       let property;
//       if (prop.propertyType === "Commercial") {
      
//         // price =
//         //   prop.propertyDetails.landDetails.sell.totalAmount ||
//         //   prop.propertyDetails.landDetails.rent.totalAmount ||
//         //   prop.propertyDetails.landDetails.lease.totalAmount;
//         // maxprice = price > maxprice ? price : maxprice
        
//         property = {
//           images: prop.propertyDetails.uploadPics,

//           name: prop.propertyTitle,
//           price: price,
//           size:
//             prop.propertyDetails.landDetails.sell.plotSize ||
//             prop.propertyDetails.landDetails.rent.plotSize ||
//             prop.propertyDetails.landDetails.lease.plotSize,
//           district: prop.propertyDetails.landDetails.address.district,
//         };
//       } else if (prop.propertyType === "Layout") {
//         property = {
//           name: prop.propertyTitle,

//           images: prop.uploadPics,
//           size: prop.layoutDetails.plotSize,

//           price: prop.layoutDetails.totalAmount,
//           district: prop.layoutDetails.address.district,
//          };


//       } else if (prop.propertyType === "Residential") {
//                 property = {
//                   images: prop.propPhotos,
//                   size: prop.propertyDetails.flatSize,

//                   price: prop.propertyDetails.totalCost,
//                   district: prop.address.district,
//                   name: prop.propertyTitle,
//                 };
//         price = prop.propertyDetails.totalCost;
//       } else {
//         price = prop.landDetails.totalPrice;
//         console.log(prop.propertyTitle)
//               property = {
//                 images: prop.landDetails.images,
//                 size: prop.landDetails.size,

//                 price: prop.landDetails.totalPrice,
//                 district: prop.address.district,
//                };
        
//       }
//       properties.push(property)
//     }
//     console.log(properties)
//  properties=   properties.sort((a, b) => 
//     b.price-a.price
//    )
// console.log( )
//    res.status(200).json(properties )
//   } catch (error) {console.log(error)
//     res.status(500).json("Internal Server Error")
//   }
// };

const getTopPropOnPrice = async (req, res) => {
  try {
    let fieldData = await fieldModel.find();
    let comData = await commercialModel.find();
    let layoutData = await layoutModel.find();
    let resData = await residentialModel.find();

    let totalProps = [...fieldData, ...comData, ...layoutData, ...resData];
    let properties = [];

    for (let prop of totalProps) {
      let price;
      let property;

      if (prop.propertyType === "Commercial") {
        price = prop.propertyDetails.landDetails.sell.totalAmount ||
                prop.propertyDetails.landDetails.rent.totalAmount ||
                prop.propertyDetails.landDetails.lease.totalAmount;
        
        property = {
          images: prop.propertyDetails.uploadPics,
          name: prop.propertyTitle,
          price: price, 
          size: prop.propertyDetails.landDetails.sell.plotSize || 
                prop.propertyDetails.landDetails.rent.plotSize || 
                prop.propertyDetails.landDetails.lease.plotSize,
          district: prop.propertyDetails.landDetails.address.district,
          propertyId:prop._id
        };
      } else if (prop.propertyType === "Layout") {
        property = {
          name: prop.layoutDetails.layoutTitle,
          images: prop.uploadPics,
          size: prop.layoutDetails.plotSize,
          price: prop.layoutDetails.totalAmount,
          district: prop.layoutDetails.address.district,
          propertyId:prop._id

        };
      } else if (prop.propertyType === "Residential" ) {
        price = prop.propertyDetails.totalCost;
        property = {
          images: prop.propPhotos,
          size: prop.propertyDetails.flatSize,
          price: price, // Corrected
          district: prop.address.district,
          name: prop.propertyDetails.apartmentName,
          propertyId:prop._id

        };
      } else { // Assuming it's "Field" or other types
        price = prop.landDetails.totalPrice;
        property = {
          images: prop.landDetails.images,
          size: prop.landDetails.size,
          price: price, // Corrected
          district: prop.address.district,
          name: prop.landDetails.title, // Added the name
          propertyId:prop._id

        };
      }
      properties.push(property);
    }

    // Sort properties by price in descending order
    properties = properties.sort((a, b) => b.price - a.price);

    res.status(200).json(properties.splice(0,5));
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};



const unAssignAgent = async (req, res) => {
  const { agentId } = req.body;
           
  try {
   
    const agentData=await userModel.findById(agentId,{password:0})
  
   const result = await userModel.updateOne(
  { _id: new ObjectId(agentId) },  
  { $set: { assignedCsr: "0" } } 
  );
let   messages=[]
    let message={
      "senderId":req.user.user.userId,
      "receiverId":agentData.assignedCsr, 
       "message":`${agentData.firstName} was Removed As Agent Under You !`,
       "notifyType":"Agent"

    }
messages.push(message)
let csrData=await  userModel.findById(agentData.assignedCsr,{password:0})
messages.push({
  "senderId":req.user.user.userId,
  "receiverId":agentId,
  "message":`You Are Removed As Agent Under ${csrData.firstName}`
})

await notifyModel.insertMany(messages)
  if(result)
  {
    res.status(200).json("Updated Successfully")
  }
  } catch (error) {
  console.error("Error unassigning agent:", error);
  res.status(500).json({ message: "An error occurred while unassigning the agent" });
  }  
  }
  


  const dealsModel = require("../models/propertyDealsModel");
// const { size } = require("pdfkit/js/page");

   
  const deleteDeal = async (req, res) => {
    try {
      const role = req.user.user.role;
      const dealId = req.body.dealId;
  
  
      // Ensure the user is an admin
      if (role !== 0) {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      // if (!mongoose.Types.ObjectId.isValid(dealId)) {
      //   return res.status(400).json({ message: "Invalid deal ID." });
      // }
      const deal = await dealsModel.findById(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found." });
      }
      deal.isActive = "-1"; // Ensure consistency in data type (string)
      await deal.save();
  
      // Send success response
      return res.status(200).json({ message: "Deal marked as deleted successfully." });
    } catch (error) {
      console.error("Error marking deal as deleted:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while marking the deal as deleted." });
    }
  };


    // if (propertyType and  (maxPrice and minPrice) and (size and unit) or only size)
    // if (propertyType ) and  (maxPrice and minPrice),)
    // if (propertyType) and (size and unit) 
    // if (size and unit) and (maxPrice and minPrice)
    // if (any one of the field) 
    // for all ignore if unit is not provided apply units contidion if provided

    const getPropsOnFilter = async (req, res) => {
      try {
        const { location, propertyType, propertySize, sizeUnit, propName, maxPrice, minPrice } = req.query;
        let filterCriteria = { status: 0 };
    
        // Location filter
        if (location) {
          filterCriteria.$or = [
            { 'propertyDetails.landDetails.address.district': location },
            { 'layoutDetails.address.district': location },
            { 'address.district': location }
          ];
        }
    
        // Property Type Filter
        if (propertyType) {
          filterCriteria.propertyType = propertyType;
        }
    
        // Size and Unit filter
        if (propertySize) {
          filterCriteria.$or = filterCriteria.$or || []; // Initialize $or if not already present
          filterCriteria.$or.push(
            { 'propertyDetails.landDetails.sell.plotSize': propertySize },
            { 'propertyDetails.landDetails.rent.plotSize': propertySize },
            { 'propertyDetails.landDetails.lease.plotSize': propertySize },
            { 'layoutDetails.plotSize': propertySize },
            { 'propertyDetails.flatSize': propertySize },
            { 'landDetails.size': propertySize },
          
          );
        }
    
        // Size Unit Filter (only if sizeUnit is provided)
        if (sizeUnit) {
          filterCriteria.$or = filterCriteria.$or || []; // Initialize $or if not already present
          filterCriteria.$or.push(
            { 'propertyDetails.landDetails.sell.sizeUnit': sizeUnit },
            { 'propertyDetails.landDetails.rent.sizeUnit': sizeUnit },
            { 'propertyDetails.landDetails.lease.sizeUnit': sizeUnit },
            { 'layoutDetails.sizeUnit': sizeUnit },
            { 'propertyDetails.sizeUnit': sizeUnit },
            { 'landDetails.sizeUnit': sizeUnit }
          );
        }
    
        // Property Name Filter
        if (propName) {
          filterCriteria.$or = filterCriteria.$or || []; // Initialize $or if not already present
          filterCriteria.$or.push(
            { 'propertyTitle': propName },
            { 'layoutDetails.layoutTitle': propName },
            { 'propertyDetails.apartmentName': propName },
            { 'landDetails.title': propName }
          );
        }
    
        // Price Range Filter (only if maxPrice and minPrice are provided)
        if (maxPrice && minPrice) {
          filterCriteria.$or = filterCriteria.$or || []; // Initialize $or if not already present
          filterCriteria.$or.push(
            { 'landDetails.totalPrice': { $gte: minPrice, $lte: maxPrice } },
            { 'layoutDetails.totalAmount': { $gte: minPrice, $lte: maxPrice } },
            { 'propertyDetails.landDetails.sell.totalAmount': { $gte: minPrice, $lte: maxPrice } },
            { 'propertyDetails.landDetails.rent.totalAmount': { $gte: minPrice, $lte: maxPrice } },
            { 'propertyDetails.landDetails.lease.totalAmount': { $gte: minPrice, $lte: maxPrice } },
            { 'propertyDetails.totalCost': { $gte: minPrice, $lte: maxPrice } }
          );
        }
    
        // Fetch data from all models
        const [fieldData, commercialData, residentialData, layoutData] = await Promise.all([
          fieldModel.find({ ...filterCriteria }),
          commercialModel.find({ ...filterCriteria }),
          residentialModel.find({ ...filterCriteria }),
          layoutModel.find({ ...filterCriteria })
        ]);
    
        // Combine results
        const properties = [
          ...fieldData,
          ...commercialData,
          ...residentialData,
          ...layoutData
        ];
    
        let property = [];
        for (let prop of properties) {
          let result = {};
          if (prop.propertyType === "Commercial" || prop.propertyType === "commercial") {
            result = {
              "propertyType": prop.propertyType,
              "propertyTitle": prop.propertyTitle,
              "size": prop.propertyDetails.landDetails.sell.plotSize || prop.propertyDetails.landDetails.rent.plotSize || prop.propertyDetails.landDetails.lease.plotSize,
              "address": prop.propertyDetails.landDetails.address.district,
              "propertyId": prop._id,
              "price": prop.propertyDetails.landDetails.sell.totalAmount || prop.propertyDetails.landDetails.rent.totalAmount || prop.propertyDetails.landDetails.lease.totalAmount,
              "images": prop.propertyDetails.uploadPics,
              "propId":prop.propertyId,
            };
          } else if (prop.propertyType === "Layout" || prop.propertyType === "layout") {
            result = {
              "propertyTitle": prop.layoutDetails.layoutTitle,
              "propertyType": prop.propertyType,
              "images": prop.uploadPics,
              "address": prop.layoutDetails.address.district,
              "propertyId": prop._id,
              "price": prop.layoutDetails.totalAmount,
              "size": prop.layoutDetails.plotSize,
              "propId":prop.propertyId,
            };
          } else if (prop.propertyType === "Residential" || prop.propertyType === "residential") {
            result = {
              "propertyTitle": prop.propertyDetails.apartmentName,
              "propertyType": prop.propertyType,
              "images": prop.propPhotos,
              "size": prop.propertyDetails.flatSize,
              "propertyId": prop._id,
              "address": prop.address.district,
              "price": prop.propertyDetails.totalCost,
              "propId":prop.propertyId,
            };
          } else {
            result = {
              "propertyTitle": prop.landDetails.title,
              "propertyType": prop.propertyType,
              "images": prop.landDetails.images,
              "size": prop.landDetails.size,
              "propertyId": prop._id,
              "address": prop.address.district,
              "price": prop.landDetails.totalPrice,
              "propId":prop.propertyId,
            };
          }
          property.push(result);
        }
    
        res.status(200).json(property);
      } catch (error) {
        console.log(error);
        res.status(500).json("Internal Server Error");
      }
    };
    

// const getPropsOnFilter=async(req,res)=>{
//   try
//   {
 
//    const { location, propertyType, propertySize,sizeUnit, propName ,maxPrice,minPrice} = req.query;
//      let filterCriteria = { status: 0 };  

//      if (location) {
//       filterCriteria.$or = [
//         { 'propertyDetails.landDetails.address.district': location },
//         { 'layoutDetails.address.district': location },
//         { 'address.district': location }
//       ];
//     }


//     if (propertyType) {
//       filterCriteria.propertyType = propertyType;
//     }

//     if (propertySize) {
 
//       filterCriteria.$or = [
//         { 'propertyDetails.landDetails.sell.plotSize': propertySize },
//         { 'propertyDetails.landDetails.rent.plotSize': propertySize },

//         { 'propertyDetails.landDetails.lease.plotSize': propertySize },

//         { 'layoutDetails.plotSize': propertySize },
//         { 'propertyDetails.flatSize': propertySize },
//         {
//           'landDetails.size':propertySize
//         }
//       ];
//     }



//     //  if (sizeUnit) {
 
//     //   filterCriteria.$or = [
//     //     { 'propertyDetails.landDetails.sell.sizeUnit': sizeUnit },
//     //     { 'propertyDetails.landDetails.rent.sizeUnit': sizeUnit },

//     //     { 'propertyDetails.landDetails.lease.sizeUnit': sizeUnit },

//     //     { 'layoutDetails.sizeUnit': sizeUnit },
//     //     { 'propertyDetails.sizeUnit': sizeUnit },
//     //     {
//     //       'landDetails.sizeUnit':sizeUnit
//     //     }
//     //   ];
//     // }

//     if (propName) {
//       filterCriteria.$or = [
//         { 'propertyTitle': propName },
//         { 'layoutDetails.layoutTitle': propName },
//         { 'propertyDetails.apartmentName': propName },
//         {
//           'landDetails.title':propName
//         }
//       ];
//      }

//     //  if(price)
//     //  {
//     //   filterCriteria.$or = [
//     //     { 'landDetails.totalPrice' :  price },
//     //     { 'layoutDetails.totalAmount': price },
//     //     { 'propertyDetails.landDetails.sell.totalAmount': price },
//     //     { 'propertyDetails.landDetails.rent.totalAmount': price },

//     //     { 'propertyDetails.landDetails.lease.totalAmount': price },

//     //     {
//     //       'propertyDetails.totalCost':price
//     //     }
//     //   ];
//     //  }

//     if(maxPrice&&minPrice) {
//       filterCriteria.$or = [
//         { 'landDetails.totalPrice': {$gte:minPrice, $lte: maxPrice } },
//         { 'layoutDetails.totalAmount': {$gte:minPrice, $lte: maxPrice } },
//         { 'propertyDetails.landDetails.sell.totalAmount': {$gte:minPrice ,$lte: maxPrice } },
//         { 'propertyDetails.landDetails.rent.totalAmount': { $gte:minPrice,$lte: maxPrice } },
//         { 'propertyDetails.landDetails.lease.totalAmount': { $gte:minPrice,$lte: maxPrice } },
//         { 'propertyDetails.totalCost': { $gte:minPrice,$lte: maxPrice } }
//       ];
//     }
    
//      const [fieldData, commercialData, residentialData, layoutData] = await Promise.all([
//       fieldModel.find({ ...filterCriteria  }),
//       commercialModel.find({ ...filterCriteria }),
//       residentialModel.find({ ...filterCriteria }),
//       layoutModel.find({ ...filterCriteria })
//     ]);

//      const properties = [
//       ...fieldData,
//       ...commercialData,
//       ...residentialData,
//       ...layoutData
//     ];
// let property=[]
// for(let prop of properties)
//   {
// let result={}
// if(prop.propertyType==="Commercial" || prop.propertyType==="commercial" )
// {
//   result={
//     "propertyType":prop.propertyType,
//     "propertyTitle":prop.propertyTitle,
//     "size":prop.propertyDetails.landDetails.sell.plotSize||prop.propertyDetails.landDetails.rent.plotSize||prop.propertyDetails.landDetails.lease.plotSize,
//     "address":prop.propertyDetails.landDetails.address.district,
//     "propertyId":prop._id,
//     "price":prop.propertyDetails.landDetails.sell.totalAmount||prop.propertyDetails.landDetails.rent.totalAmount||prop.propertyDetails.landDetails.lease.totalAmount,
//     "images":prop.propertyDetails.uploadPics
//   }
// }
// else if(prop.propertyType==="Layout" || prop.propertyType==="layout")
// {
//   result={
//     "propertyTitle":prop.layoutDetails.layoutTitle,
//     "propertyType":prop.propertyType,
//     "images":prop.uploadPics,
//     "address":prop.layoutDetails.address.district,
//     "propertyId":prop._id,
//     "price":prop.layoutDetails.totalAmount,
//     "size":prop.layoutDetails.plotSize
//   }
// }
// else if(prop.propertyType==="Residential" ||prop.propertyType==="residential" )
// {
//  result={
//   "propertyTitle":prop.propertyDetails.apartmentName,
//   "propertyType":prop.propertyType,
//   "images":prop.propPhotos,
//   "size":prop.propertyDetails.flatSize,
//   "propertyId":prop._id,
//   "address":prop.address.district,
//   "price":prop.propertyDetails.totalCost
//  }

// }

// else
// {
//   result={
//     "propertyTitle":prop.landDetails.title,
//     "propertyType":prop.propertyType,
//     "images":prop.landDetails.images,
//     "size":prop.landDetails.size,
//     "propertyId":prop._id,
//     "address":prop.address.district,
//     "price":prop.landDetails.totalPrice
//    }
// }


// property.push(result)
//   }


// res.status(200).json(property)
//   }catch(error)
//   {
//     console.log(error)
// res.status(500).json("Internal Server Error")
//   }
// }

const getAllCsrORMarketingAgent = async (req, res) => {
  try {
    const role = parseInt(req.params.role); 
    let agents = '';


    if (role === 5) {
      agents = await userModel.find({ role: 5 }, { password: 0 });
    } else if (role === 6) {
      agents = await userModel.find({ role: 6 }, { password: 0 });
    } else {
      return res.status(400).json({ message: "Invalid role parameter" });
    }

    res.status(200).json(agents); // Send agents list as response
  } catch (error) {
    console.error(error); // Log the error to the console
    res.status(500).json({ message: "Internal server error", error: error.message }); // Send error response with message
  }
};

const getPropertiesFilter = async (req, res) => {
  try {
    let text = req.params.text;

    let regex = new RegExp(text, 'i'); 
    let filterCriteria = { status: 0 }; // Default filter criteria

    let { page, limit } = req.query;

    if (text) {
      filterCriteria.$or = [
        { 'propertyDetails.landDetails.address.district': { $regex: regex } },
        { 'layoutDetails.address.district': { $regex: regex } },
        { 'address.district': { $regex: regex } },
        { 'propertyTitle': { $regex: regex } },
        { 'layoutDetails.layoutTitle': { $regex: regex } },
        { 'propertyDetails.apartmentName': { $regex: regex } },
        { 'propertyDetails.propertyId': { $regex: regex } },
        { 'landDetails.title': { $regex: regex } },
        {'propertyId':{$regex: regex }},
        // { 'propertyInterestedCount': { $regex: regex } },
      ];
    }

    let fieldData = [];
    let commercialData = [];
    let residentialData = [];
    let layoutData = [];

    // Fetch the data from the models with or without pagination
    if (page && limit) {
      let offset = (page - 1) * limit;

      [fieldData, commercialData, residentialData, layoutData] = await Promise.all([
        fieldModel.find({ ...filterCriteria }).skip(offset).limit(Number(limit)),
        commercialModel.find({ ...filterCriteria }).skip(offset).limit(Number(limit)),
        residentialModel.find({ ...filterCriteria }).skip(offset).limit(Number(limit)),
        layoutModel.find({ ...filterCriteria }).skip(offset).limit(Number(limit)),
      ]);
    } else {
      [fieldData, commercialData, residentialData, layoutData] = await Promise.all([
        fieldModel.find({ ...filterCriteria }),
        commercialModel.find({ ...filterCriteria }),
        residentialModel.find({ ...filterCriteria }),
        layoutModel.find({ ...filterCriteria }),
      ]);
    }

    // Combine all the results
    const properties = [
      ...fieldData,
      ...commercialData,
      ...residentialData,
      ...layoutData,
    ];

    // Prepare the response
    const property = properties.map((prop) => {
      if (prop.propertyType === 'Commercial' || prop.propertyType === 'commercial') {
        return {
          propertyType: prop.propertyType,
          propertyTitle: prop.propertyTitle,
          size:
            prop.propertyDetails.landDetails.sell?.plotSize ||
            prop.propertyDetails.landDetails.rent?.plotSize ||
            prop.propertyDetails.landDetails.lease?.plotSize,
          address: prop.propertyDetails.landDetails.address.district,
          propertyId: prop._id,
          price:
            prop.propertyDetails.landDetails.sell?.totalAmount ||
            prop.propertyDetails.landDetails.rent?.totalAmount ||
            prop.propertyDetails.landDetails.lease?.totalAmount,
          images: prop.propertyDetails.uploadPics,
          propertyInterestedCount: prop.propertyInterestedCount,
          propId:prop.propertyId,
        };
      } else if (prop.propertyType === 'Layout' || prop.propertyType === 'layout') {
        return {
          propertyType: prop.propertyType,
          propertyTitle: prop.layoutDetails.layoutTitle,
          size: prop.layoutDetails.plotSize,
          address: prop.layoutDetails.address.district,
          propertyId: prop._id,
          price: prop.layoutDetails.totalAmount,
          images: prop.uploadPics,
          propertyInterestedCount: prop.propertyInterestedCount,
          propId:prop.propertyId,
        };
      } else if (prop.propertyType === 'Residential' || prop.propertyType === 'residential') {
        return {
          propertyType: prop.propertyType,
          propertyTitle: prop.propertyDetails.apartmentName,
          size: prop.propertyDetails.flatSize,
          address: prop.address.district,
          propertyId: prop._id,
          price: prop.propertyDetails.totalCost,
          images: prop.propPhotos,
          propertyInterestedCount: prop.propertyInterestedCount,
          propId:prop.propertyId,
        };
      } else {
        return {
          propertyType: prop.propertyType,
          propertyTitle: prop.landDetails.title,
          size: prop.landDetails.size,
          address: prop.address.district,
          propertyId: prop._id,
          price: prop.landDetails.totalPrice,
          images: prop.landDetails.images,
          propertyInterestedCount: prop.propertyInterestedCount,
          propId:prop.propertyId,
        };
      }
    });

    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json('Internal Server Error');
  }
};

const getPropertiesFilterInuse = async (req, res) => {
  try {
    let text = req.params.text;

    let regex = new RegExp(text, 'i'); 

    let filterCriteria = { status: 0 };
      
    let page=req.query.page
    let limit=req.query.limit

    // 
    if (text) {
      filterCriteria.$or = [
        { 'propertyDetails.landDetails.address.district': { $regex: regex } },
        { 'layoutDetails.address.district': { $regex: regex } },
        { 'address.district': { $regex: regex } },
        { 'propertyTitle': { $regex: regex } },
        { 'layoutDetails.layoutTitle': { $regex: regex } },
        { 'propertyDetails.apartmentName': { $regex: regex } },
        {'propertyDetails.propertyId':{$regex:regex}},
        { 'landDetails.title': { $regex: regex } },
        {'propertyInterestedCount':{$regex:regex}},
      ];
    }
let fieldData=[]
let commercialData=[]
let residentialData=[]
let layoutData=[]
    // Fetch the data from the models
    if(page)
    {
      let offset=(page-1)*limit;

        [fieldData, commercialData, residentialData, layoutData] = await Promise.all([
        fieldModel.find({ ...filterCriteria }).skip(offset).limit(limit),
        commercialModel.find({ ...filterCriteria }).skip(offset).limit(limit),
        residentialModel.find({ ...filterCriteria }).skip(offset).limit(limit),
        layoutModel.find({ ...filterCriteria }).skip(offset).limit(limit)
      ]);
    }
    else
    {
        [fieldData, commercialData, residentialData, layoutData] = await Promise.all([
        fieldModel.find({ ...filterCriteria }),
        commercialModel.find({ ...filterCriteria }),
        residentialModel.find({ ...filterCriteria }),
        layoutModel.find({ ...filterCriteria })
      ]);
    }
 

    // Combine all the results
    const properties = [
      ...fieldData,
      ...commercialData,
      ...residentialData,
      ...layoutData
    ];

    // Prepare the response
    let property = [];
    for (let prop of properties) {
      let result = {};
      if (prop.propertyType === "Commercial" || prop.propertyType === "commercial") {
        result = {
          "propertyType": prop.propertyType,
          "propertyTitle": prop.propertyTitle,
          "size": prop.propertyDetails.landDetails.sell.plotSize || prop.propertyDetails.landDetails.rent.plotSize || prop.propertyDetails.landDetails.lease.plotSize,
          "address": prop.propertyDetails.landDetails.address.district,
          "propertyId": prop._id,
          "price": prop.propertyDetails.landDetails.sell.totalAmount || prop.propertyDetails.landDetails.rent.totalAmount || prop.propertyDetails.landDetails.lease.totalAmount,
          "images": prop.propertyDetails.uploadPics
        };
      } else if (prop.propertyType === "Layout" || prop.propertyType === "layout") {
        result = {
          "propertyTitle": prop.layoutDetails.layoutTitle,
          "propertyType": prop.propertyType,
          "images": prop.uploadPics,
          "address": prop.layoutDetails.address.district,
          "propertyId": prop._id,
          "price": prop.layoutDetails.totalAmount,
          "size": prop.layoutDetails.plotSize
        };
      } else if (prop.propertyType === "Residential" || prop.propertyType === "residential") {
        result = {
          "propertyTitle": prop.propertyDetails.apartmentName,
          "propertyType": prop.propertyType,
          "images": prop.propPhotos,
          "size": prop.propertyDetails.flatSize,
          "propertyId": prop._id,
          "address": prop.address.district,
          "price": prop.propertyDetails.totalCost
        };
      } else {
        result = {
          "propertyTitle": prop.landDetails.title,
          "propertyType": prop.propertyType,
          "images": prop.landDetails.images,
          "size": prop.landDetails.size,
          "propertyId": prop._id,
          "address": prop.address.district,
          "price": prop.landDetails.totalPrice
        };
      }

      property.push(result);
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};


// const getMaxPriceAndSize=async(req,res)=>{
//   try
//   {
//      const agData=await fieldModel.find();
//      const comData=await commercialModel.find();
//      const layoutData=await layoutModel.find();
//      const resiData=await residentialModel.find()
//      const propData=[...agData,...comData,...layoutData,...resiData]
//      let maxPrice=0;
//      let maxSize=0
//      let minPrice=0;
//      let minSize=0;
//      for(let prop of propData)
//      {
//       if (prop.propertyType === "Commercial"||prop.propertyType === "commercial") {
      
//                 price =
//                   prop.propertyDetails.landDetails.sell.totalAmount ||
//                   prop.propertyDetails.landDetails.rent.totalAmount ||
//                   prop.propertyDetails.landDetails.lease.totalAmount;
//                   maxPrice = price > maxPrice ? price : maxPrice
//                   minPrice= price<minPrice?price:minPrice  
//                   size=
//                   prop.propertyDetails.landDetails.sell.plotSize ||
//                   prop.propertyDetails.landDetails.rent.plotSize ||
//                   prop.propertyDetails.landDetails.lease.plotSize,
//                   minSize=size<minSize?size:minSize
//                  maxSize=size>maxSize?size:maxSize
                
//               } else if (prop.propertyType === "Layout"|| prop.propertyType === "layout") {
//                 size= prop.layoutDetails.plotSize,
//                 price= prop.layoutDetails.totalAmount,
//                 maxPrice =  price > maxPrice ? price : maxPrice        
//                 maxSize=size>maxSize?size:maxSize
//               } else if (prop.propertyType === "Residential" || prop.propertyType === "residential") {
//                   size= prop.propertyDetails.flatSize,
//                   price= prop.propertyDetails.totalCost,       
//                  maxPrice = price > maxPrice ?   price : maxPrice     
//                  maxSize=size>maxSize?size:maxSize   

//               } else {
//                 price = prop.landDetails.totalPrice;
//                 size=prop.landDetails.size;
//               maxPrice = price > maxPrice ?price  : maxPrice       
//               maxSize=size>maxSize?size:maxSize 
//        }
//       }
    
//     res.status(200).json({"maxPrice":maxPrice,"maxSize":maxSize})
//     }

//   catch(error)
//   {
//     console.log(error)
//     res.status(500).json("Internal Server Error")
//   }
// }
const getMaxPriceAndSize = async (req, res) => {
  try {
    const agData = await fieldModel.find();
    const comData = await commercialModel.find();
    const layoutData = await layoutModel.find();
    const resiData = await residentialModel.find();
    const propData = [...agData, ...comData, ...layoutData, ...resiData];

    let maxPrice = 0;
    let maxSize = 0;
    let minPrice = Infinity;
    let minSize = Infinity;

    for (let prop of propData) {
      let price = 0;
      let size = 0;

      if (prop.propertyType === "Commercial" || prop.propertyType === "commercial") {
        price = prop.propertyDetails.landDetails.sell.totalAmount ||
                prop.propertyDetails.landDetails.rent.totalAmount ||
                prop.propertyDetails.landDetails.lease.totalAmount;

        size = prop.propertyDetails.landDetails.sell.plotSize ||
               prop.propertyDetails.landDetails.rent.plotSize ||
               prop.propertyDetails.landDetails.lease.plotSize;

        maxPrice = price > maxPrice ? price : maxPrice;
        minPrice = price < minPrice ? price : minPrice;
        maxSize = size > maxSize ? size : maxSize;
        minSize = size < minSize ? size : minSize;

      } else if (prop.propertyType === "Layout" || prop.propertyType === "layout") {
        price = prop.layoutDetails.totalAmount;
        size = prop.layoutDetails.plotSize;

        maxPrice = price > maxPrice ? price : maxPrice;
        minPrice = price < minPrice ? price : minPrice;
        maxSize = size > maxSize ? size : maxSize;
        minSize = size < minSize ? size : minSize;

      } else if (prop.propertyType === "Residential" || prop.propertyType === "residential") {
        price = prop.propertyDetails.totalCost;
        size = prop.propertyDetails.flatSize;

        maxPrice = price > maxPrice ? price : maxPrice;
        minPrice = price < minPrice ? price : minPrice;
        maxSize = size > maxSize ? size : maxSize;
        minSize = size < minSize ? size : minSize;

      } else {
        // Handle other property types
        price = prop.landDetails.totalPrice;
        size = prop.landDetails.size;

        maxPrice = price > maxPrice ? price : maxPrice;
        minPrice = price < minPrice ? price : minPrice;
        maxSize = size > maxSize ? size : maxSize;
        minSize = size < minSize ? size : minSize;
      }
    }

    res.status(200).json({ maxPrice, maxSize, minPrice, minSize });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};


module.exports = {
  countOfPropsInMandal,
  countOfPropsInVillage,
  countOfPropsInDistrict,
  getAllAgents,
  getFeildStats,
  getCommercialStats,
  removeAgent,
  getResidentialStats,
  getLayoutStats,
  removeProperties,
  getTotalSales,
  getStateWiseStats,
  getTopPropOnPrice,
  unAssignAgent,
  deleteDeal,
  getPropsOnFilter,
  getPropertiesFilter,
  getMaxPriceAndSize,
  getAllCsrORMarketingAgent,
};
