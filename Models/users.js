import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  name: { type: String },
  contact: { type: String },
  email: { type: String },
  landmark: { type: String },
  city: { type: String },
  pincode: { type: String },
  state: { type: String }
});

const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  businessType: { type: String },
  addresses: [addressSchema],
  contact: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpires: { type: Date },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product'
    }
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orders'
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('user', userSchema);
