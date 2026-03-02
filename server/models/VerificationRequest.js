import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // CNIC FRONT
  cnicFront: {
    public_id: String,
    url: String
  },

  // CNIC BACK
  cnicBack: {
    public_id: String,
    url: String
  },

  // SELFIE
  selfie: {
    public_id: String,
    url: String
  },

  // Personal details entered by user
  fullName: String,
  cnicNumber: String,
  dateOfBirth: Date,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  adminNotes: String,

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  reviewedAt: Date

}, { timestamps: true });

export default mongoose.model(
  "VerificationRequest",
  verificationRequestSchema
);