import mongoose from "mongoose";

const TempCustomerSchema = new mongoose.Schema({
    mobileNumber: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
})

const TempCustomer = mongoose.model("TempCustomer", TempCustomerSchema);
export default TempCustomer;