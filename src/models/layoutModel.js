const mongoose=require('mongoose')

const layoutSchema = new mongoose.Schema(
  {
    userId: { type: String },
    propertyId: { type: String },
    enteredBy: { type: String },
    role: { type: Number },
    csrId: { type: String },
    propertyType: { type: String, default: "Layout" },
    propertyTypeTe: { type: String },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    agentDetails: {
      userId: { type: String },
    },
    ownerDetails: {
      ownerName: { type: String, required: true },
      ownerNameTe: { type: String },
      ownerContact: { type: String, required: true },
      ownerEmail: { type: String },
    },
    layoutDetails: {
      brochure: { type: String },
      reraRegistered: { type: Boolean },
      dtcpApproved: { type: Boolean },
      tlpApproved: { type: Boolean },
      flpApproved: { type: Boolean },
      layoutTitle: { type: String },
      layoutTitleTe: { type: String },
      description: { type: String },
      descriptionTe: { type: String },
      plotCount: { type: Number, required: true },
      availablePlots: { type: Number, required: true },
      plotSize: { type: Number, required: true },
      sizeUnit: { type: String, required: true },
      sizeUnitTe: { type: String },
      plotPrice: { type: Number, required: true },
      priceUnit: { type: String },
      totalAmount: { type: Number, required: true },
      address: {
        pinCode: { type: String },
        country: { type: String, default: "India" },
        state: { type: String, default: "Andhra Pradesh" },
        district: { type: String, required: true },
        mandal: { type: String, required: true },
        village: { type: String, required: true },
        latitude: { type: String },
        longitude: { type: String },
        landMark: { type: String },
        currentLocation: { type: String },
        countryTe: { type: String },
        stateTe: { type: String },
        districtTe: { type: String },
        mandalTe: { type: String },
        villageTe: { type: String },
      },

      plots: [
        {
          plotId: { type: Number, required: false },
          plotSize: { type: Number, required: true },
          plotLength: { type: Number },
          plotWidth: { type: Number },
          sizeUnit: { type: String, required: true },
          sizeUnitTe: { type: String },
          plotAmount: { type: Number },
          priceUnit: { type: Number },
        },
      ],
    },
    amenities: {
      underGroundWater: { type: Boolean },
      drainageSystem: { type: Boolean },
      electricityFacility: { type: String },
      electricityFacilityTe: { type: String }, // Telugu translation
      swimmingPool: { type: Boolean },
      playZone: { type: Boolean },
      gym: { type: Boolean },
      conventionHall: { type: Boolean },
      medical: { type: Number },
      educational: { type: Number },
      roadType: { type: String },
      roadTypeTe: { type: String }, // Telugu translation
      distanceFromRoad: { type: String },
      extraAmenities: { type: [String] },
    },
    uploadPics: {
      type: [String],
      // default: ["https://res.cloudinary.com/default_image.png"],
    },
    videos: { type: [String] },
    propertyInterestedCount: { type: Number },
    propertyOnHold: {
      type: String,
      default: "no",
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Layouts", layoutSchema);
