import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

export default mongoose.model("Wallet", walletSchema);