import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
{
  // -------------------------
  // BASIC INFO
  // -------------------------
  title: {
    type: String,
    required: [true, "Item must have a title"],
    trim: true,
    maxlength: 100
  },

  description: {
    type: String,
    required: [true, "Item must have description"],
    maxlength: 1000
  },

  category: {
    type: String,
    required: true,
    enum: [
      "camera",
      "laptop",
      "tools",
      "musical_instrument",
      "sports",
      "other"
    ]
  },

  condition: {
    type: String,
    enum: ["new", "like_new", "good", "fair"],
    required: true
  },

  // -------------------------
  // PRICING
  // -------------------------
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },

  depositAmount: {
    type: Number,
    default: 0
  },

  // -------------------------
  // IMAGES
  // -------------------------
  images: [
    {
      public_id: String,
      url: String
    }
  ],

  // -------------------------
  // OWNER
  // -------------------------
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // -------------------------
  // LOCATION (GeoJSON)
  // -------------------------
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    },
    addressText: String,
    city: String
  },

  // -------------------------
  // STATUS & AVAILABILITY
  // -------------------------
  isAvailable: {
    type: Boolean,
    default: true
  },

  isApproved: {
    type: Boolean,
    default: true // later you can make admin approval required
  }

},
{ timestamps: true }
);

// 📍 Required for geo search
ItemSchema.index({ location: "2dsphere" });

const Item = mongoose.model("Item", ItemSchema);

export default Item;