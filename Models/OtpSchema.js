import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: false
    },
    mobileNumber: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ["login", "signup", "reset"],
        default: "login"
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
});

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);