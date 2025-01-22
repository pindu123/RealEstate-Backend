const userModel = require("../models/userModel");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");

const path = require("path");
const { customerSchema } = require("../helpers/customerValidation");
const customerModel = require("../models/customerModel");
const { json } = require("express");
const districtModel = require("../models/districtModel");
const fieldModel = require("../models/fieldModel");
const residentialModel = require("../models/residentialModel");
const commercialModel = require("../models/commercialModel");
const layoutModel = require("../models/layoutModel");
const notifyModel = require("../models/notificationModel");
const customerAssignmentModel = require("../models/customerAssignmentModel");
const propertyAssignmentModel = require("../models/propertyAssignmentModel");

const getUnAssignedAgents = async (req, res) => {
  try {
    let csrId = req.params.csrId;

    let page = req.query.page;
    let limit = req.query.limit;

    console.log(csrId);
    let csrData = await userModel.findOne(
      {
        _id: new ObjectId(csrId),
      },
      { password: 0 }
    );
    console.log(csrData, csrData.assignedDistrict);
    let data = [];
    if (page) {
      let offset = (page - 1) * limit;

      data = await userModel.find(
        {
          role: 1,
          assignedCsr: "0",
          district: csrData.assignedDistrict,
        },
        { password: 0 }
      ).skip(offset).limit(limit);
    } else {
      data = await userModel.find(
        {
          role: 1,
          assignedCsr: "0",
          district: csrData.assignedDistrict,
        },
        { password: 0 }
      );
    }

    console.log(data);
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json("No Agent Found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getAssignedAgents = async (req, res) => {
  try {
    const csrId = req.params.csrId;

    if (!csrId) {
      return res.status(400).json({ message: "CSR ID is required" });
    }

    const data = await userModel.find(
      { assignedCsr: csrId, role: "1" }, // Query conditions
      { password: 0 } // Exclude password from the response
    );

    if (data.length > 0) {
      return res.status(200).json(data); // Return the found agents
    } else {
      return res.status(404).json({ message: "No Assigned Agents" }); // No agents found
    }
  } catch (error) {
    console.error("Error fetching assigned agents:", error); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" }); // Handle server errors
  }
};

const getAgentByPhone = async (req, res) => {
  try {
    const data = await userModel.find(
      {
        role: 1,
        phoneNumber: req.params.contact,
      },
      { password: 0 }
    );
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json("No Agent Found");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

const assignAgentToCSR = async (req, res) => {
  try {
    const { agents, csrId } = req.body;
    if (!csrId || !agents || !Array.isArray(agents) || agents.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const results = [];
    let receivers = [];
    for (const agent of agents) {
      try {
        const agentId = new ObjectId(agent);

        // Check if the agent exists
        const existingAgent = await userModel.findOne({ _id: agentId });
        if (!existingAgent) {
          results.push({ agentId: agent, status: "not found" });
          continue; // Skip to the next agent
        }
        // Update the agent
        const updateResult = await userModel.updateOne(
          { _id: agentId },
          { $set: { assignedCsr: csrId } }
        );

        // Check if the update was successful
        if (updateResult.matchedCount > 0 && updateResult.modifiedCount > 0) {
          results.push({ agentId: agent, status: "success" });
          receivers.push(agentId);
        } else if (updateResult.matchedCount > 0) {
          results.push({
            agentId: agent,
            status: "no change (already assigned)",
          });
        } else {
          results.push({ agentId: agent, status: "update failed" });
        }
      } catch (err) {
        results.push({
          agentId: agent,
          status: "error",
          error: err.message,
        });
      }
    }

    let senderId = req.user.user.userId;
    let csrData = await userModel.findById(csrId, { password: 0 });

    let notifications = [];
    for (let r of receivers) {
      let notify = {
        senderId: senderId,
        receiverId: r,
        message: `You Are Assigned Under ${csrData.firstName} ${csrData.lastName} !`,
        notifyType: "Agent",
      };
      notifications.push(notify);
    }
    notifications.push({
      senderId: senderId,
      receiverId: csrId,
      message: `${agents.length}  New Agent Assigned Under You !`,
      notifyType: "Agent",
    });

    await notifyModel.insertMany(notifications);

    return res.status(201).json({
      message: "Agent assignment processed",
      results,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

function excelToJson(filePath) {
  const workbook = XLSX.readFile(filePath); // Read the Excel file

  if (workbook.SheetNames.length > 1) {
  } else {
    const sheetName = workbook.SheetNames[0]; // Get the first sheet's name
    const sheet = workbook.Sheets[sheetName]; // Get the first sheet
    return XLSX.utils.sheet_to_json(sheet); // Convert the sheet to JSON
  }
}

const getDataFromExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log(req.file.path);
  try {
    const jsonData = excelToJson(req.file.path);
    let mandals = [
      { mandal: "Adapaka", pincode: "532403" },
      { mandal: "Adavaram", pincode: "532440" },
      { mandal: "Aguru", pincode: "532127" },
      { mandal: "Agurukancharam", pincode: "532127" },
      { mandal: "Ajjaram", pincode: "532403" },
      { mandal: "Akkulapeta", pincode: "532185" },
      { mandal: "Akkupalli", pincode: "532219" },
      { mandal: "Akulatampara", pincode: "532459" },
      { mandal: "Alamajipeta", pincode: "532190" },
      { mandal: "Alikam", pincode: "532185" },
      { mandal: "Allada", pincode: "532425" },
      { mandal: "Allena", pincode: "532445" },
      { mandal: "Allinagaram", pincode: "532403" },
      { mandal: "Aludu", pincode: "532426" },
      { mandal: "Amadalavalasa", pincode: "532185" },
      { mandal: "Amadalavalasa Gate", pincode: "532185" },
      { mandal: "Amalapadu", pincode: "532218" },
      { mandal: "Amapalam", pincode: "532429" },
      { mandal: "Ambada", pincode: "532122" },
      { mandal: "Ambakhandi", pincode: "532123" },
      { mandal: "Ampolu", pincode: "532404" },
      { mandal: "Anandapuram", pincode: "532168" },
      { mandal: "Andhavaram", pincode: "532425" },
      { mandal: "Annupuram", pincode: "532426" },
      { mandal: "Anthakapalli", pincode: "532127" },
      { mandal: "Anthrakudda", pincode: "532222" },
      { mandal: "Aradali", pincode: "532440" },
      { mandal: "Arasada", pincode: "532122" },
      { mandal: "Arasavilli", pincode: "532401" },
      { mandal: "Arjunavalasa", pincode: "532409" },
      { mandal: "Avalangi", pincode: "532462" },
      { mandal: "B.S.puram", pincode: "532185" },
      { mandal: "Badupuram", pincode: "532264" },
      { mandal: "Balada", pincode: "532457" },
      { mandal: "Baleru", pincode: "532455" },
      { mandal: "Bandaruvanipeta", pincode: "532406" },
      { mandal: "Baruva", pincode: "532263" },
      { mandal: "Baruva R s", pincode: "532264" },
      { mandal: "Bathupuram", pincode: "532219" },
      { mandal: "Battili", pincode: "532456" },
      { mandal: "Batuva", pincode: "535125" },
      { mandal: "Beejiputti", pincode: "532322" },
      { mandal: "Bejjipuram", pincode: "532403" },
      { mandal: "Belagam", pincode: "532290" },
      { mandal: "Belamam", pincode: "532484" },
      { mandal: "Belamara", pincode: "532430" },
      { mandal: "Bendi", pincode: "532220" },
      { mandal: "Bhadri", pincode: "532427" },
      { mandal: "Bhagempeta", pincode: "532122" },
      { mandal: "Bhagiradhipuram", pincode: "532459" },
      { mandal: "Bhairi", pincode: "532405" },
      { mandal: "Bhamini", pincode: "532456" },
      { mandal: "Bhasuru", pincode: "532440" },
      { mandal: "Bhirlangi", pincode: "532312" },
      { mandal: "Bhogapuram", pincode: "532264" },
      { mandal: "Bitiwada", pincode: "532462" },
      { mandal: "Boddam", pincode: "532148" },
      { mandal: "Boddapadu", pincode: "532222" },
      { mandal: "Bodduru", pincode: "532127" },
      { mandal: "Bomminaiduvalasa", pincode: "532127" },
      { mandal: "Bontalakoduru", pincode: "532408" },
      { mandal: "Borivanka", pincode: "532292" },
      { mandal: "Borubhadra", pincode: "532195" },
      { mandal: "Brahmanatarla", pincode: "532220" },
      { mandal: "Brc Puram", pincode: "532284" },
      { mandal: "Budatavalasa", pincode: "532403" },
      { mandal: "Budithi", pincode: "532427" },
      { mandal: "Budumuru", pincode: "532403" },
      { mandal: "Bukkuru", pincode: "532440" },
      { mandal: "Buragam", pincode: "532212" },
      { mandal: "Buravilli", pincode: "532405" },
      { mandal: "Buridikancharam", pincode: "532168" },
      { mandal: "Burja", pincode: "532445" },
      { mandal: "Burjapadu", pincode: "532312" },
      { mandal: "Burujuvada", pincode: "532426" },
      { mandal: "Calingapatnam", pincode: "532406" },
      { mandal: "Chakipalli", pincode: "532201" },
      { mandal: "Challavanipeta", pincode: "532432" },
      { mandal: "Challayyavalasa", pincode: "532429" },
      { mandal: "Chandraiahpeta", pincode: "532148" },
      { mandal: "Chapara", pincode: "532216" },
      { mandal: "Cheemalavalasa", pincode: "532185" },
      { mandal: "Cheepi", pincode: "532242" },
      { mandal: "Chettupodilam", pincode: "532148" },
      { mandal: "Chidimi", pincode: "532460" },
      { mandal: "Chiguruvalasa", pincode: "532190" },
      { mandal: "Chinabadam", pincode: "532222" },
      { mandal: "Chinakittalapadu", pincode: "532214" },
      { mandal: "Chinavatsavalasa", pincode: "532404" },
      { mandal: "Chinnabagga", pincode: "532455" },
      { mandal: "Chintada", pincode: "532185" },
      { mandal: "Chintalabadavanja", pincode: "532458" },
      { mandal: "Chittapudivalasa", pincode: "532460" },
      { mandal: "Chittarupuram", pincode: "532168" },
      { mandal: "Chittivalasa", pincode: "532185" },
      { mandal: "Chodavaram", pincode: "532425" },
      { mandal: "Chowkipeta", pincode: "532264" },
      { mandal: "Dabbapadu", pincode: "532458" },
      { mandal: "Dalemrajuvalasa", pincode: "535128" },
      { mandal: "Dallavalasa", pincode: "532402" },
      { mandal: "Dandugopalapuram", pincode: "532212" },
      { mandal: "Dandulaxmipuram", pincode: "532430" },
      { mandal: "Danta", pincode: "532195" },
      { mandal: "Dasariraminaiduvalasa", pincode: "532127" },
      { mandal: "Deerghasi", pincode: "532429" },
      { mandal: "Deppilugonapaputtuga", pincode: "532312" },
      { mandal: "Derasam", pincode: "532409" },
      { mandal: "Devadi", pincode: "532421" },
      { mandal: "Devanaltada", pincode: "532211" },
      { mandal: "Devaravalasa", pincode: "532168" },
      { mandal: "Devudala", pincode: "532440" },
      { mandal: "Devunipalavalasa", pincode: "532409" },
      { mandal: "Dhanupuram", pincode: "532214" },
      { mandal: "Dharmalaxmipuram", pincode: "532214" },
      { mandal: "Dharmapuram", pincode: "532402" },
      { mandal: "Dharmavaram", pincode: "532408" },
      { mandal: "Dimidijola", pincode: "532201" },
      { mandal: "Dimilada", pincode: "532212" },
      { mandal: "Dimili", pincode: "532457" },
      { mandal: "Dokulapadu", pincode: "532222" },
      { mandal: "Dola", pincode: "532429" },
      { mandal: "Dolagovindapuram", pincode: "532291" },
      { mandal: "Donubai", pincode: "532460" },
      { mandal: "Dusi Rs", pincode: "532484" },
      { mandal: "Edupuram", pincode: "532312" },
      { mandal: "Elamanchili", pincode: "532195" },
      { mandal: "Etcherla", pincode: "532402" },
      { mandal: "Fareedpeta", pincode: "532005" },
      { mandal: "G.M.r.nagar", pincode: "532127" },
      { mandal: "Gadagamma", pincode: "532460" },
      { mandal: "Gadimudidam", pincode: "532127" },
      { mandal: "Galavilli", pincode: "532122" },
      { mandal: "Gangaram", pincode: "532195" },
      { mandal: "Ganguvada", pincode: "532243" },
      { mandal: "Gara", pincode: "532405" },
      { mandal: "Garraju Chipurupalle", pincode: "535128" },
      { mandal: "Garudabhadra", pincode: "532222" },
      { mandal: "Garudakhandi", pincode: "532222" },
      { mandal: "Gedda Kancharam", pincode: "535125" },
      { mandal: "Ghanasara", pincode: "532455" },
      { mandal: "Gobburu", pincode: "532148" },
      { mandal: "Gokarnapalli", pincode: "532168" },
      { mandal: "Gollagandi", pincode: "532263" },
      { mandal: "Gollalapalem", pincode: "532407" },
      { mandal: "Gollalavalasa", pincode: "532429" },
      { mandal: "Gonapaputtuga", pincode: "532292" },
      { mandal: "Gondi", pincode: "532443" },
      { mandal: "Gonepadu", pincode: "532458" },
      { mandal: "Goppili", pincode: "532221" },
      { mandal: "Gorlapadu", pincode: "532290" },
      { mandal: "Gotivada", pincode: "532432" },
      { mandal: "Gottamangalapuram", pincode: "532440" },
      { mandal: "Govindapuram", pincode: "532123" },
      { mandal: "Gudarurajamanipuram", pincode: "532242" },
      { mandal: "Gudem", pincode: "532201" },
      { mandal: "Gujarathipeta", pincode: "532005" },
      { mandal: "Gulumuru", pincode: "532459" },
      { mandal: "Gumada", pincode: "532460" },
      { mandal: "Gumadam", pincode: "532407" },
      { mandal: "Gunabhadra", pincode: "532455" },
      { mandal: "Gurandi", pincode: "532459" },
      { mandal: "Guravam", pincode: "532127" },
      { mandal: "Guttavilli", pincode: "532445" },
      { mandal: "Haddubangi", pincode: "532455" },
      { mandal: "Haridasupuram", pincode: "532218" },
      { mandal: "Haripuram", pincode: "532243" },
      { mandal: "Harischandrapuram", pincode: "532430" },
      { mandal: "Hill Colony", pincode: "532459" },
      { mandal: "Hiramandalam", pincode: "532459" },
      { mandal: "Honjaram", pincode: "532168" },
      { mandal: "Hussainpuram", pincode: "532460" },
      { mandal: "Ichchapuram", pincode: "532312" },
      { mandal: "Ichchapuram Bus stand", pincode: "532312" },
      {
        mandal: "Idulavalasa",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ippili",
        pincode: "532401",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Irapadu",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Isakalapalem",
        pincode: "532292",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "J.R.puram",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jada",
        pincode: "532148",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jaduru",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jagannadhapuram",
        pincode: "532430",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jagathi",
        pincode: "532322",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jalantrakota",
        pincode: "532284",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jalumuru",
        pincode: "532432",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jamachakram",
        pincode: "532426",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jamparakota",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jandapeta",
        pincode: "532212",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jarjangi",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Javam",
        pincode: "532445",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jeerupalem",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jhadupalli",
        pincode: "532216",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jhadupudi",
        pincode: "532290",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Jinkibhadra",
        pincode: "532284",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kadagandi",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kadakella",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kadumu",
        pincode: "532457",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kallata",
        pincode: "532214",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kambakaya",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kambalarayudupeta",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kambara",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kameswaripeta",
        pincode: "532425",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kanchili",
        pincode: "532290",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kandisa",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kanimetta",
        pincode: "532402",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kanitivooru",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kanugulavalasa",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kapaskudda",
        pincode: "532322",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Karajada",
        pincode: "532221",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Karakavalasa",
        pincode: "532428",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Karapadu",
        pincode: "532312",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Karavanja",
        pincode: "532432",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kasibugga",
        pincode: "532222",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kasimivalasa",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kathulakaviti",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kavitaagraharam",
        pincode: "532220",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kaviti",
        pincode: "532322",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kedaripuram",
        pincode: "532221",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kesaripada",
        pincode: "532291",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kesavarayunipalem",
        pincode: "532403",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kesupuram",
        pincode: "532312",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Khajuru",
        pincode: "532290",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Khandyam",
        pincode: "532445",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Killada",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Killoyicolony",
        pincode: "532242",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kinthali",
        pincode: "532402",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kistupuram",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kittalapadu",
        pincode: "532428",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kodisa",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Koduru",
        pincode: "532430",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Koligam",
        pincode: "532312",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Komaraltada",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Komarti",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Komiri",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kommanapalli",
        pincode: "532427",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kommusariapalli",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kommuvalasa",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kondalogam",
        pincode: "532243",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kondapuram",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kondavalasa",
        pincode: "532190",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kondavooru",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Korallavalasa",
        pincode: "532127",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Korama",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Korasavada",
        pincode: "532214",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Korlakota",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },

      {
        mandal: "Korlam",
        pincode: "532405",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kotabomma R.s.",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kotabommali",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kotapalem",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kothagraharam",
        pincode: "532220",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kothalingudu",
        pincode: "532211",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kothapalli",
        pincode: "532242",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kothapeta",
        pincode: "532005",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kottisa",
        pincode: "532461",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kotturu",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kovvadamachilesam",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Koyyam",
        pincode: "532408",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kuddapalli",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kuppili",
        pincode: "532403",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kurmanadhapuram",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kurudu",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kusimi",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Kusumapuram",
        pincode: "532292",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "L.N.peta",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Labara",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Labba",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Labham",
        pincode: "532445",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Laidam",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Lakkivalasa",
        pincode: "532211",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Lakkupuram",
        pincode: "532445",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Laveru",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Laxmidevipeta",
        pincode: "532222",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Lingalavalasa",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Loddaputti",
        pincode: "532312",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Loharijola",
        pincode: "532456",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Lolugu",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Lukulam",
        pincode: "532425",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mabagam",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Madapam",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Madduvalasa",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Makarampuram",
        pincode: "532290",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Makivalasa",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mamidipalli",
        pincode: "532264",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mamidivalasa",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Manda",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mandapalli",
        pincode: "532312",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mandarada",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mandasa",
        pincode: "532242",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mandavakuriti",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Manikyapuram",
        pincode: "532292",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Manthina",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Maredubaka",
        pincode: "532127",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Marripadu",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Meghavaram",
        pincode: "532211",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Meliaputti",
        pincode: "532215",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Metturu",
        pincode: "532219",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mirtivalasa",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Modallavalasa",
        pincode: "532484",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mofusbandar",
        pincode: "532401",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mokhasarajapuram",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ms Palli",
        pincode: "532291",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Muchindra",
        pincode: "532323",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Muddada",
        pincode: "532005",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mukhalingam",
        pincode: "532428",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Mundala",
        pincode: "532291",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Murapaka",
        pincode: "532403",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nadagam",
        pincode: "532425",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nadumuru",
        pincode: "532263",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nagarampalli",
        pincode: "532222",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nagarikatakam",
        pincode: "532428",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nagulavalasa",
        pincode: "532127",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Naira",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nandabalaga",
        pincode: "532148",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nandigam",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Narannaiduvalasa",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Narasannapeta",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Narasannapeta Market",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Narasingupalli",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Narsipuram",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Naupada",
        pincode: "532211",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Naupada Rs",
        pincode: "532212",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Navagam",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Neelampeta",
        pincode: "532445",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Neelanagaram",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Neelavathi",
        pincode: "532243",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Neelayyavalasa",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Neradi",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Niddam",
        pincode: "532148",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nimmada",
        pincode: "532430",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nivagam",
        pincode: "532457",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Nowgam",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Opivada Venkampeta",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "P.S.puram",
        pincode: "532190",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Padali",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Palakhandyam",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Palakonda",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Palasa",
        pincode: "532221",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Palasapuram",
        pincode: "532284",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Palavalasa",
        pincode: "532264",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pallisaradhi",
        pincode: "532222",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Parampeta",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Parapuram",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Paraselli",
        pincode: "532425",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Parasurampuram",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Parlam",
        pincode: "532425",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pathakumkam",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pathapatnam",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Patharlapalli",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pathatekkali",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pathivadapalem",
        pincode: "532409",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Patrunivalasa",
        pincode: "532401",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pattupuram",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Patuvardhanam",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedakotipalli",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedalamba",
        pincode: "532214",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedalavunipalli",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedalaxmipuram",
        pincode: "532216",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedamuraharipuram",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedanarayanapuram",
        pincode: "532220",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedapadmapuram",
        pincode: "532215",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedapolla",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedarama",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedasankili",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedasavalapuram",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedasirlam",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedasrirampuram",
        pincode: "532290",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddabammidi",
        pincode: "532474",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddadimili",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddakojjiria",
        pincode: "532290",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddakota",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddalogidi",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddamallipuram",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddapadu",
        pincode: "532401",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Peddaseedhi",
        pincode: "532214",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pedduru",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Penubaka",
        pincode: "532127",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Piruvada",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pogiri",
        pincode: "532148",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Polaki",
        pincode: "532429",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Polavaram",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Poleru",
        pincode: "532291",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ponduru",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ponnada",
        pincode: "532408",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ponnam",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Potli",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Potrakonda",
        pincode: "532264",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Priyagraharam",
        pincode: "532430",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pubbada",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Puliputti",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pundi R s",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Purli",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Purushottapur",
        pincode: "532323",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pusam",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Pydibheemavaram",
        pincode: "532409",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "R.L.puram",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },

      {
        mandal: "Ragolu",
        pincode: "532484",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rajam",
        pincode: "532409",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rajapuram",
        pincode: "532322",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rajulagumada",
        pincode: "532461",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ramachandrapuram Agraharam",
        pincode: "532148",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rana",
        pincode: "532474",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ranasthalam",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rangoi",
        pincode: "532243",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rapaka",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rattakanna",
        pincode: "532312",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Ravivalasa",
        pincode: "532212",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Regidi",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Regulapadu",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rentikota",
        pincode: "532221",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Reyyipadu",
        pincode: "532218",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Romadala",
        pincode: "532214",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rottavalasa",
        pincode: "532190",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Routhupeta",
        pincode: "535128",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Runku Hanumanthapuram",
        pincode: "532430",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rushikudda",
        pincode: "532292",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Rushingi",
        pincode: "532461",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "S.M.puram",
        pincode: "532402",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "S.R.puram",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sahalalaputtuga",
        pincode: "532290",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Salihundam",
        pincode: "532405",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Samarelli",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sambham",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sancham",
        pincode: "532409",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sangam",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sanivada",
        pincode: "532401",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sankili",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Santhabommali",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Santhakaviti",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Santhavuriti",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sarali",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sarasanapalli",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Saravakota",
        pincode: "532426",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sarubujjili",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sasanam",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sathivada",
        pincode: "532405",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Satyavaram",
        pincode: "532421",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },

      {
        mandal: "Savaraddapanasa",
        pincode: "532426",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Seetarampalli",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Seethampeta",
        pincode: "532443",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Seethapuram",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Seetharampuram Inam",
        pincode: "532461",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sekharapuram",
        pincode: "532216",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Shalantri",
        pincode: "532190",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Siddhantham",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sigadam",
        pincode: "532148",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Silagam",
        pincode: "532322",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Singidi",
        pincode: "532456",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Singupuram",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Siriakhandi",
        pincode: "532215",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Siripuram",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sirusuvada",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sivvam",
        pincode: "532461",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Somagandi",
        pincode: "532455",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sompeta",
        pincode: "532284",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Sondipudi",
        pincode: "532242",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam China bazar",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam Collectorate",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam District court",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam Market",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam New colony",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam Official colony",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam Town",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikakulam Zilla parishad",
        pincode: "532001",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Srikurmam",
        pincode: "532404",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Suravam",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Suvarnapuram",
        pincode: "532243",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "T.Lingalapadu",
        pincode: "532195",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tadivalasa",
        pincode: "532484",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Talada",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Talagam",
        pincode: "532461",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Talasamudram",
        pincode: "532429",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Talatampara",
        pincode: "532292",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Talavaram",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tallabhadra",
        pincode: "532243",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tallavalasa",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tamavada",
        pincode: "532403",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tampatapalli",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tandemvalasa",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tankaladuggivalasa",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tarlakota",
        pincode: "532221",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tekkali",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tekkalipatnam",
        pincode: "532220",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Telikipenta",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Temburu",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Teppalavalasa",
        pincode: "532407",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tettangi",
        pincode: "532462",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Thandyam",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Thogaram",
        pincode: "532484",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tholapi",
        pincode: "532402",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Thotada",
        pincode: "532484",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Thotapalem",
        pincode: "532005",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Thotavada",
        pincode: "532445",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tiddimi",
        pincode: "532213",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tilaru",
        pincode: "532474",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tilaru Rs",
        pincode: "532474",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Timadam",
        pincode: "532427",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Titukupai",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Togiri",
        pincode: "532427",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tonangi",
        pincode: "532406",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tudi",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tulagam",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tulugu",
        pincode: "532405",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tungatampara",
        pincode: "532459",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Tunivada",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Turakapeta",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Turakasasanam",
        pincode: "532264",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Uddavolu",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Umilada",
        pincode: "532430",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Uppalam",
        pincode: "532263",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Uppinivalasa",
        pincode: "532185",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Urjam",
        pincode: "532429",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Urlam",
        pincode: "532425",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vadada",
        pincode: "532401",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vajrapukotturu",
        pincode: "532222",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vanduva",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vangara",
        pincode: "532461",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vanjangi",
        pincode: "532484",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Varisam",
        pincode: "532409",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vasudevapatnam",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vasundhara",
        pincode: "532215",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vatapagu",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vatsavalasa",
        pincode: "532404",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vavilavalasa",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Veeraghattam",
        pincode: "532460",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Venkampeta",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Venkatapuram",
        pincode: "532220",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Venugopalapuram",
        pincode: "532201",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vommaravilli",
        pincode: "532406",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vommi",
        pincode: "532127",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vondrajola",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Voni",
        pincode: "532440",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vonkuluru",
        pincode: "532219",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vungarada",
        pincode: "532123",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Vunukuru",
        pincode: "532122",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Walteru",
        pincode: "532168",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Yalamanchili",
        pincode: "532427",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Yeragam",
        pincode: "532458",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
      {
        mandal: "Yerramukkam",
        pincode: "532263",
        state: "Andhra Pradesh",
        district: "Srikakulam",
      },
    ];

    jsonData.forEach((item) => {
      // Rename "Village Name (In English)" to "Village Name"
      if (item.hasOwnProperty("Village Name (In English)")) {
        item["villageName"] = item["Village Name (In English)"];
        delete item["Village Name (In English)"];
      }
    });
    let locData;
    for (let data of jsonData) {
      // Check if 'Hierarchy' exists and is a string before trying to split
      if (data.Hierarchy && typeof data.Hierarchy === "string") {
        const parts = data.Hierarchy.split("/");
        const subDistrictPart = parts[0].split("(");
        const mandalData = subDistrictPart[0];
        mandals.map((resp) => {
          if (resp.mandal === mandalData) {
            locData = {
              district: "Srikakulam",
              mandal: mandalData,
              villages: [
                {
                  villageName: data.villageName,
                  pincode: resp.pincode,
                },
              ],
            };
          }
        });
        const districts = await districtModel(locData);
        await districts.save();

        if (subDistrictPart) {
          console.log(locData);
        } else {
          console.log("Sub-District part is empty in Hierarchy:", data);
        }
      } else {
        // Handle cases where 'Hierarchy' is missing or not a string
        console.log("Invalid or missing 'Hierarchy' field for data:", data);
      }
    }

    res.json(jsonData);

    // if (jsonData.length > 0) {
    //   for (let customer of jsonData) {
    //     const result = await customerSchema.validateAsync(customer);
    //     const customerData = new customerModel(result);
    //     await customerData.save();
    //   }
    // } else {
    //   const result = await customerSchema.validateAsync(jsonData);
    //   const customer = new customerModel(result);
    //   await customer.save();
    // }
    // res.status(200).json("Customers Inserted Successfully");
  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    } else {
      res.status(500).send("Error processing the Excel file.");
    }
  }
};

const getCsrDataFromExcel = async (req, res) => {
  try {
    const jsonData = excelToJson(req.file.path);

    if (jsonData.length > 0) {
      for (let customer of jsonData) {
        const result = await customerSchema.validateAsync(customer);
        const customerData = new customerModel(result);
        await customerData.save();
      }
    } else {
      const result = await customerSchema.validateAsync(jsonData);
      const customer = new customerModel(result);
      await customer.save();
    }
    res.status(200).json("Customers Inserted Successfully");
    fs.unlink(req.file.path, (err) => {
      if (err) {
        return res.status(500).send("Error deleting the file");
      }
      res.send("File deleted successfully");
    });
  } catch (error) {
    console.log(error);
    if (error.isJoi === true) {
      return res.status(422).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "),
      });
    } else {
      res.status(500).send("Error processing the Excel file.");
    }
  }
};

const getPropsByCsr = async (req, res) => {
  try {

     
    let page=req.query.page
    let limit=req.query.limit

    let fieldData=[]
    let comData=[]
    let layoutData=[]
    let resData=[]
if(page)
{

  let offset=(page-1)*limit
      fieldData = await fieldModel
      .find({ csrId: req.params.csrId }).skip(offset).limit(limit)
      .sort({ createdAt: -1 });
      comData = await commercialModel
      .find({ csrId: req.params.csrId }).skip(offset).limit(limit)
      .sort({ createdAt: -1 });
      layoutData = await layoutModel
      .find({ csrId: req.params.csrId }).skip(offset).limit(limit)
      .sort({ createdAt: -1 });
      resData = await residentialModel
      .find({ csrId: req.params.csrId }).skip(offset).limit(limit)
      .sort({ createdAt: -1 });
}
else
{
    fieldData = await fieldModel
  .find({ csrId: req.params.csrId })
  .sort({ createdAt: -1 });
  comData = await commercialModel
  .find({ csrId: req.params.csrId })
  .sort({ createdAt: -1 });
  layoutData = await layoutModel
  .find({ csrId: req.params.csrId })
  .sort({ createdAt: -1 });
  resData = await residentialModel
  .find({ csrId: req.params.csrId })
  .sort({ createdAt: -1 });
}
    let totalProps = [...fieldData, ...comData, ...layoutData, ...resData];
    let property = {};
    let propDetails = [];

    for (let props of totalProps) {
      const agentData = await userModel.find({ _id: props.userId });
      const agentName =
        agentData.length > 0 ? agentData[0].firstName || "NA" : "NA";

      if (props.propertyType === "Commercial") {
        property = {
          propertyId: props.propertyId,
          _id: props._id,
          type: props.propertyType,
          propertyType: props.propertyType,
          propertyName: props.propertyTitle,
          images: props.propertyDetails?.uploadPics || [], // Default to empty array if undefined
          size:
            props.propertyDetails?.landDetails?.sell?.plotSize ||
            props.propertyDetails?.landDetails?.rent?.plotSize ||
            props.propertyDetails?.landDetails?.lease?.plotSize ||
            "NA", // Provide default
          sizeUnit:
            props.propertyDetails.landDetails.sell.sizeUnit ||
            props.propertyDetails.landDetails.rent.sizeUnit ||
            props.propertyDetails.landDetails.lease.sizeUnit,

          price:
            props.propertyDetails?.landDetails?.sell?.totalAmount ||
            props.propertyDetails?.landDetails?.rent?.totalAmount ||
            props.propertyDetails?.landDetails?.lease?.totalAmount ||
            "NA", // Provide default
          district:
            props.propertyDetails?.landDetails?.address?.district || "NA", // Provide default
            
          mandal:
            props.propertyDetails?.landDetails?.address?.mandal || "NA", // Provide default
            
          agentName: agentName,
        };
      } else if (props.propertyType === "Layout") {
        property = {
          type: props.propertyType,
          propertyId: props.propertyId,
          _id: props._id,
          propertyType: props.propertyType,
          propertyName: props.layoutDetails?.layoutTitle || "NA", // Default to "NA" if undefined
          images: props.uploadPics || [], // Default to empty array if undefined
          size: props.layoutDetails?.plotSize || "NA", // Provide default
          sizeUnit:
            props.layoutDetails.sizeUnit ||
            props.layoutDetails.sizeUnit ||
            props.layoutDetails.sizeUnit,

          price: props.layoutDetails?.totalAmount || "NA", // Provide default
          district: props.layoutDetails?.address?.district || "NA", // Provide default
          mandal:props.layoutDetails?.address?.mandal||"NA",
          agentName: agentName,
        };
      } else if (props.propertyType === "Residential") {
        property = {
          propertyId: props.propertyId,
          _id: props._id,
          propertyType: props.propertyType,
          propertyName: props.propertyDetails?.apartmentName || "NA", // Default to "NA" if undefined
          images: props.propPhotos || [], // Default to empty array if undefined
          size: props.propertyDetails?.flatSize || "NA", // Provide default
          sizeUnit:
            props.propertyDetails.sizeUnit ||
            props.propertyDetails.sizeUnit ||
            props.propertyDetails.sizeUnit,

          type: props.propertyType,
          price: props.propertyDetails?.totalCost || "NA", // Provide default
          district: props.address?.district || "NA", // Provide default
          mandal:props.address?.mandal||"NA",
          agentName: agentName,
        };
      } else {
        property = {
          images: props.landDetails?.images || [], // Default to empty array if undefined
          size: props.landDetails?.size || "NA", // Provide default

          sizeUnit:
            props.landDetails.sizeUnit ||
            props.landDetails.sizeUnit ||
            props.landDetails.sizeUnit,

          type: props.propertyType,
          propertyId: props.propertyId,
          _id: props._id,
          propertyType: props.propertyType,
          propertyName: props.landDetails?.title || "NA", // Default to "NA" if undefined
          price: props.landDetails?.totalPrice || "NA", // Provide default
          district: props.address?.district || "NA", // Provide default
          mandal:props.address?.mandal||"NA",
          agentName: agentName,
        };
      }
      propDetails.push(property);
    }

    console.log(propDetails);
    res.status(200).json(propDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getAssignedCsr = async (req, res) => {
  try {
    let agentId = req.params.agentId;

    const agentData = await userModel.findById(agentId);
    console.log(agentData);
    const csrData = await userModel.findById(agentData.assignedCsr, {
      password: 0,
    });
    console.log(csrData);
    if (csrData) {
      res.status(200).json(csrData);
    } else {
      res.status(404).json("No CSR");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

// api to assign customer to agnet

const assignCustomerToAgent = async (req, res) => {
  try {
    const { assignedTo, customers, assignedBy, assignedDate } = req.body;

    // Validate the required fields
    if (
      !assignedTo ||
      !Array.isArray(customers) ||
      customers.length === 0 ||
      !assignedBy ||
      !assignedDate
    ) {
      return res.status(400).json({
        message:
          "Required fields: assignedTo, assignedBy, assignedDate, customers (array with customerId, status, and description)",
      });
    }

    // Check if the same assignment already exists on the same assignedDate
    const existingAssignment = await customerAssignmentModel.findOne({
      assignedTo,
      assignedDate,
    });

    if (existingAssignment) {
      // Check if existingAssignment.customers is defined and an array
      if (
        existingAssignment.customers &&
        Array.isArray(existingAssignment.customers)
      ) {
        // Check for duplicate customer assignments
        const duplicateCustomers = customers.filter((customer) =>
          existingAssignment.customers.some(
            (existingCustomer) =>
              existingCustomer.customerId === customer.customerId
          )
        );

        if (duplicateCustomers.length > 0) {
          return res.status(400).json({
            message:
              "Some customers are already assigned to this agent on the same date.",
            duplicates: duplicateCustomers,
          });
        }
      } else {
        // If existingAssignment.customers is undefined or not an array, initialize it as an empty array
        existingAssignment.customers = [];
      }

      // Add the new customers to the existing assignment
      existingAssignment.customers.push(...customers);
      await existingAssignment.save();

      return res.status(200).json({
        message: "Customers successfully added to the existing assignment",
        data: existingAssignment,
      });
    }

    // Create a new assignment
    const newAssignment = new customerAssignmentModel({
      assignedBy,
      assignedTo,
      assignedDate,
      customers,
    });

    await newAssignment.save();

    res.status(201).json({
      message: "Customers successfully assigned to the agent",
      data: newAssignment,
    });
  } catch (error) {
    console.error("Error assigning customers to agent:", error);
    res.status(500).json({
      message: "An error occurred while assigning customers to the agent",
      error: error.message,
    });
  }
};

const assignPropertyToAgent = async (req, res) => {
  try {
    const { assignedTo, propertyIds, assignedBy, assignedDate } = req.body;
    if (
      !assignedTo ||
      !Array.isArray(propertyIds) ||
      propertyIds.length === 0 ||
      !assignedBy
    ) {
      return res.status(400).json({
        message:
          "Required fields: assignedTo, assignedBy, propertyIds (array of IDs)",
      });
    }
    const newAssignment = new propertyAssignmentModel({
      propertyIds,
      assignedBy,
      assignedTo,
      assignedDate,
    });

    await newAssignment.save();

    res.status(201).json({
      message: "Properties successfully assigned to the agent",
      data: newAssignment,
    });
  } catch (error) {
    console.error("Error assigning Properties to agent:", error);
    res.status(500).json({
      message: "An error occurred while assigning Properties to the agent",
      error: error.message,
    });
  }
};

module.exports = {
  getUnAssignedAgents,
  getAssignedAgents,
  getAgentByPhone,
  assignAgentToCSR,
  getDataFromExcel,
  getCsrDataFromExcel,
  getPropsByCsr,
  getAssignedCsr,
  assignCustomerToAgent,
  assignPropertyToAgent,
};
