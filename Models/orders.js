import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    orderNumber: { type: String, unique: true, sparse: true },
    driverId: { type: String }, // ID of the assigned driver/user
    assignedAt: { type: Date },
    items: [
      {
        productId: { type: String, required: true },
        quantityKg: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        // Split Sourcing Fields
        category: { type: String }, // Persist category 
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
        sourcingStatus: { type: String, default: "Pending" } // Pending, Assigned
      },
    ],
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true
    },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    name: { type: String },
    contact: { type: String },
    paymentMethod: { type: String },
    paymentStatus: { type: String, default: "Pending" },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    sourcingStatus: { type: String, default: "Pending" }, // Pending, Assigned, Shipped, Delivered, etc.
    scheduledDate: { type: Date },
    scheduledTimeSlot: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("orders", orderSchema);
