import mongoose from 'mongoose';

const productRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Fulfilled', 'Rejected'],
        default: 'Pending'
    },
    notes: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('ProductRequest', productRequestSchema);
