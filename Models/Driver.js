import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'inactive', 'busy'], default: 'active' },
    vehicleNumber: { type: String }
}, { timestamps: true });

export default mongoose.model("Driver", driverSchema);
