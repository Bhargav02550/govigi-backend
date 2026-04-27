import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    customerAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    customerContactPerson: {
        type: String,
        required: true
    },
    customerContactPersonNumber: {
        type: String,
        required: true
    },
    customerStatus: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'blocked'],
        default: 'pending'
    },
    customerType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerType',
        required: true
    },
    businessImages: [
        {
            url: { type: String },
            public_id: { type: String }
        }
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'orders'
        }
    ],
    fcmToken: {
        type: String,
        required: false
    }
}, { timestamps: true });

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;