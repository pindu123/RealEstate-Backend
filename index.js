const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); // Replaced ES6 import with CommonJS require
const cors = require("cors");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
require('./src/services/cronJob'); 
const { google } = require("googleapis");
// const analyticsData = google.analyticsdata("v1");

// Replace ES6 imports with CommonJS requires
const userRoutes = require("./src/routes/userRoute");
const wishlistRoutes = require("./src/routes/wishlistRoutes");
const fieldRoutes = require("./src/routes/fieldRoutes");
require("dotenv/config"); // Import environment variables from .env file
const noAuthRouter = require("./src/routes/noAuthRoutes");
const { verifyJwt } = require("./src/services/jwtAuthService"); // Destructure the verifyJwt function from jwtAuthService
const propertyRoutes = require("./src/routes/propertyRoutes");
const agentRoutes = require("./src/routes/agentRoutes");
const residentialRoutes = require("./src/routes/residentialRoutes");
const commercialRoutes = require("./src/routes/commercialRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const errorHandler = require("./src/services/errorHandler");
const locationRoutes = require("./src/routes/locationRoutes");
const layoutRoutes = require("./src/routes/layoutRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");
const emFieldRoutes = require("./src/routes/emFieldRoutes");
const fileUploadRoutes = require("./src/routes/fileUploadRoutes");
const emInterestRoutes = require("./src/routes/emInterestRoutes");
const emClientRoutes = require("./src/routes/emClientRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const app = express();
const socketIo = require("socket.io");
const http = require("http");

// caching
const apicache = require("apicache");
const emBuildingRoutes = require("./src/routes/emBuildingRoutes");
const emBookingRoutes = require("./src/routes/emBookingRoutes");
const estateRoutes = require("./src/routes/estateRoutes");
// const adminRoutes = require("./src/routes/adminRoutes");
const emAgentRoutes = require("./src/routes/emAgentRoutes");
const viewsRoutes = require("./src/routes/viewsRoutes");
const sellerRoutes = require("./src/routes/sellerRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const { chatSchema } = require("./src/helpers/chatValidation");
const chatModel = require("./src/models/chatModel");
const bookingModel = require("./src/models/bookingModel");
const buyerRoutes = require("./src/routes/buyerRoutes");
const complaintRoute = require("./src/routes/complaintRoutes");
const apiRouter = require("./src/routes/analyticsRoutes");
const csrRoutes = require("./src/routes/csrRoutes");
const taskRoutes = require("./src/routes/tasksRoutes");
const dealsRoutes = require("./src/routes/dealsRoutes");
const meetingRoutes = require("./src/routes/meetingRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const marketingAgent = require("./src/routes/marketingAgentRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const socialMedia = require("./src/routes/socialMediaPostRoutes");
const auctionRoutes = require("./src/routes/auctionRoutes");
const filterRoutes = require("./src/routes/filterRoutes");

let cache = apicache.middleware;

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// const corsOptions = {
//   origin: 'https://full-real-estate.web.app', // Adjust this to match your frontend's origin
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
// };

// // Use CORS middleware
// app.use(cors(corsOptions));

app.options("*", cors());

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`Received request for: ${req.originalUrl}`);
  next();
});

app.use("/", noAuthRouter);
app.use("/users", verifyJwt, userRoutes);
app.use("/wishlist", verifyJwt, wishlistRoutes);
app.use("/fields", verifyJwt, fieldRoutes);
app.use("/property", verifyJwt, propertyRoutes);
app.use("/agent", verifyJwt, agentRoutes);
app.use("/residential", verifyJwt, residentialRoutes);
app.use("/commercials", verifyJwt, commercialRoutes);
app.use("/booking", verifyJwt, bookingRoutes);
app.use("/location", locationRoutes);
app.use("/layout", verifyJwt, layoutRoutes);
app.use("/bot", chatbotRoutes);
app.use("/emFields", verifyJwt, emFieldRoutes);
app.use("/fileUpload", verifyJwt, fileUploadRoutes);
app.use("/emInterests", verifyJwt, emInterestRoutes);
app.use("/emClient", verifyJwt, emClientRoutes);
app.use("/emBuilding", verifyJwt, emBuildingRoutes);
app.use("/emBooking", verifyJwt, emBookingRoutes);
app.use("/estate", verifyJwt, estateRoutes);
app.use("/admin", verifyJwt, adminRoutes);
app.use("/emAgent", verifyJwt, emAgentRoutes);
app.use("/views", verifyJwt, viewsRoutes);
app.use("/marketingAgent",verifyJwt,marketingAgent)
app.use("/chat", verifyJwt, chatRoutes);
app.use("/buyer", verifyJwt, buyerRoutes);
app.use("/seller", verifyJwt, sellerRoutes);
app.use("/socialMedia",verifyJwt,socialMedia);
app.use("/customer", verifyJwt, customerRoutes);
app.use("/complaint", verifyJwt, complaintRoute);

app.use("/csr", verifyJwt, csrRoutes);
app.use("/task", verifyJwt, taskRoutes);

app.use("/deal", verifyJwt, dealsRoutes);
app.use("/activity",verifyJwt,activityRoutes)
 
app.use("/meeting",verifyJwt,meetingRoutes);
app.use(errorHandler);


app.use("/filterRoutes",verifyJwt,filterRoutes)

app.use("/auction",verifyJwt,auctionRoutes)

app.use("/api", apiRouter);
app.use(
  "/files",
  verifyJwt,
  express.static(path.join(__dirname, "Estate_Management_fileuploads"))
);

app.get("/", (req, res) => {
  console.log("API is working");
  res.send("Welcome to my API!");
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,

    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 300000,   
    socketTimeoutMS: 45000,   
    tlsAllowInvalidCertificates: true,
   })
  .then(() => {
    console.log("DB Connected");
    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  })
  .catch((e) => {
    console.log(e);
  });

const server = http.createServer(app);

// const io = socketIo(server, {
//   cors: {
//     origin: "*",  
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   },
// });



const io = socketIo(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  reconnectionAttempts: 5,  
  reconnectionDelay: 1000,  
  timeout: 5000,  
});


const userSockets = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register_user", (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on("send_message", async (messageData) => {
    console.log("Message received:", messageData);

    try {
      const result = await chatSchema.validateAsync(messageData);

      const newMessage = new chatModel(result);
      await newMessage.save();

      const { receiverId, senderRole } = messageData;
      let receiverSocketId = userSockets[receiverId];

      // If the sender is an agent (role 3), check if the receiver is a booking entity
      // if (senderRole === 3) {
      //   const booking = await bookingModel.findOne({ _id: receiverId });
      //   if (!booking) {
      //     console.log("Receiver booking not found");
      //     return socket.emit("error", { message: "Receiver not found." });
      //   }
      // }
      console.log("abc", userSockets, receiverId);
       if (userSockets[receiverId]) {
        io.to(userSockets[receiverId]).emit("receive_message", result);
        console.log(`Message sent to user ${receiverId}`);
      } else {
        console.log(`Receiver ${receiverId} is offline, message not delivered`);
         socket.emit("error", {
          message: "Receiver is offline. Message queued for delivery.",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

   socket.on("disconnect", () => {
    for (const [userId, socketId] of Object.entries(userSockets)) {
      if (socketId === socket.id) {
        delete userSockets[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
