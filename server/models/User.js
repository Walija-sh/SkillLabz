import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
{
  // -------------------------
  // BASIC AUTH
  // -------------------------
  username: {
    type: String,
    required: [true, "A user must have username"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "A user must have email"],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: "Please provide a valid email address"
    }
  },

  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 8,
    select: false
  },

  // -------------------------
  // PROFILE DATA
  // -------------------------
  bio: {
    type: String,
    maxlength: 300,
    default: ""
  },

  phone: {
    type: String,
    unique: true,
    sparse: true // allows null but unique when exists
  },

  profileImage: {
  public_id: {
    type: String
  },
  url: {
    type: String
  }
},

  // -------------------------
  // GEOJSON ADDRESS
  // -------------------------
  location: {
  type: {
    type: String,
    enum: ['Point']
  },
  coordinates: {
    type: [Number]
  },
  addressText: String,
  city: String
},

// -------------------------
// AUTH VERIFICATION
// -------------------------
// -------------------------
// EMAIL VERIFICATION
// -------------------------
isEmailVerified: {
  type: Boolean,
  default: false
},
emailVerificationToken: String,
emailVerificationExpire: Date,

// -------------------------
// IDENTITY BADGE SYSTEM (OPTIONAL)
// -------------------------

identityVerificationStatus: {
  type: String,
  enum: ["not_submitted", "pending", "approved", "rejected"],
  default: "not_submitted"
},

isBadgeVerified: {
  type: Boolean,
  default: false
},
badgeType: {
  type: String,
  enum: ["trusted"], // expandable later
  default: null
},


  profileCompleted: {
    type: Boolean,
    default: false
  },

  // -------------------------
  // MEMBERSHIP & RENTAL LOGIC
  // -------------------------
  freeRentalCount: {
    type: Number,
    default: 0
  },

  membershipType: {
    type: String,
    enum: ["free", "premium"],
    default: "free"
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }

},
{ timestamps: true }
);

// 📍 2dsphere index for geo queries (VERY IMPORTANT)
UserSchema.index({ location: "2dsphere" });


// -------------------------
// PASSWORD HASHING
// -------------------------
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// -------------------------
// INSTANCE METHOD
// -------------------------
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;