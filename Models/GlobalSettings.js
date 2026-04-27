import mongoose from "mongoose";

const globalSettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'wallet_percentage', 'delivery_zones'
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedBy: { type: String } // Optional: Admin ID
}, { timestamps: true });

export default mongoose.model("GlobalSettings", globalSettingsSchema);
