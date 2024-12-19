const estateModel = require("../models/estateModel");


const getAgentEstates = async(req,res)=>{
    try{
const agentId = req.user.user.userId;
const props = await estateModel.find({agentId:agentId,status:1});
res.status(200).json(props);
    }
    catch(error){
res.status(500).json("Internal server error");
    }
}

module.exports = {getAgentEstates}