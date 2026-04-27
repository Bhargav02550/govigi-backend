import mongoose from "mongoose";

const TempVendorSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Expires in 1 hour
  },
});

const TempVendor = mongoose.model("TempVendor", TempVendorSchema);
export default TempVendor;
