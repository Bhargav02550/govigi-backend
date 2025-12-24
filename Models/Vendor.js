import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema({
  // Basic Business Info
  businessName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },

  // Rich Address Structure (Embedded)
  address: {
    formattedAddress: { type: String, required: true },
    components: {
      houseNumber: String,
      street: String,
      area: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' }
    },
    // GeoJSON for location-based search
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere"
      }
    }
  },

  // Banking Details
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },

  // Service Range (H3 Hexagons)
  serviceHexagons: {
    type: [String],
    default: []
  },

  // Smart Sourcing: Product Categories
  supportedCategories: {
    type: [String],
    default: []
  },

  // Status & Metadata
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },

  joinedDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Vendor = mongoose.model("Vendor", VendorSchema);
export default Vendor;
