import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    source: {
        type: String,
        enum: ['order', 'refund', 'adjustment', 'top-up'],
        required: true
    },
    referenceId: {
        type: String,
        required: true
    },
    timestamp: { type: Date, default: Date.now }
});

WalletTransactionSchema.index({ customerId: 1, walletId: 1, timestamp: -1 });
WalletTransactionSchema.index({ referenceId: 1 }, { unique: true });

export default mongoose.model("WalletTransactions", WalletTransactionSchema);