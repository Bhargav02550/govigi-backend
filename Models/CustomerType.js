import mongoose from "mongoose";

const customerTypeSchema = new mongoose.Schema(
  {
    typeName: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

const CustomerType = mongoose.model("CustomerType", customerTypeSchema);

export default CustomerType;