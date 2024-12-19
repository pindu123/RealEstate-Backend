const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs").promises;
const knowledgeBase = require("../../knowledgeBase.json");
const fieldModel = require("../models/fieldModel");
const commercialModel = require("../models/commercialModel");
const residentialModel = require("../models/residentialModel");
const layoutModel = require("../models/layoutModel");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to find relevant answers from the knowledge base
const findRelevantAnswer = (userMessage, knowledgeBase) => {
  // Simple keyword match; you can use more advanced matching if needed
  const lowerMessage = userMessage.toLowerCase();
  for (const entry of knowledgeBase) {
    if (lowerMessage.includes(entry.question.toLowerCase())) {
      return entry.answer;
    }
  }
  return null; // No relevant answer found in the knowledge base
};

function getSecondLastWord(str) {
  // Split the string into an array of words using space as a delimiter
  const words = str.trim().split(/\s+/); // Trim to remove leading/trailing spaces, split by whitespace
  // Check if there are at least two words
  if (words.length < 2) {
    return null; // Return null if there aren't enough words
  }
  // Return the second-to-last word
  return words[words.length - 2];
}

//function to get latest property based on type
const getLatestProp = async (type) => {
  let collection;
  console.log(type);
  console.log("hdhfjh");
  if (type === "agriculture") {
    collection = fieldModel;
  } else if (type === "commercial") {
    collection = commercialModel;
  } else if (type === "residential") {
    collection = residentialModel;
  } else if (type === "layout") {
    collection = layoutModel;
  }
  console.log(collection);
  const lastRecord = await collection.find().sort({ _id: -1 }).limit(1);
  console.log(lastRecord[0]);
  return lastRecord[0]._id;
};

const chatBot = async (req, res) => {
  try {
    const { userMessage } = req.body;
    console.log(userMessage);

    //getting latest property
    let latestPropId;
    const latestPropArray = [
      "get latest agriculture property",
      "get latest commercial property",
      "get latest layout property",
      "get latest residential property",
    ];
    if (latestPropArray.includes(userMessage.toLowerCase())) {
      const type = getSecondLastWord(userMessage.toLowerCase());
      latestPropId = await getLatestProp(type);
      console.log(latestPropId);
      return res
        .status(200)
        .json({
          result: "🔍🏠 Click here to view the latest property! 🏡✨",
          id: latestPropId,
        });
    }

    const relevantAnswer = findRelevantAnswer(userMessage, knowledgeBase);
    console.log(relevantAnswer);
    // If a relevant answer exists in the knowledge base, use it
    if (relevantAnswer) {
      return res.status(200).json({ result: relevantAnswer });
    }

    const prompt = `You are a knowledgeable assistant for a website about Real Estate Lokam. Please thoroughly consult the knowledge base before answering any question related to our website. Here are some entries from the knowledge base: ${JSON.stringify(
      knowledgeBase
    )}. If the user question is similar to any information in the knowledge base, provide the most relevant answer. If you get any greetings, greet in return and ask a question.Try to add emojis if required for user satisfaction.If you find any question related to property search which is not present in the knowledge base, give a response to login and apply filters or click on the property listing to view its details. Here is the user's question: "${userMessage}".`;

    const result = await model.generateContent(prompt);
    console.log(result.response.text());

    return res.status(200).json({ result: result.response.text() });
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

module.exports = { chatBot };
