import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true
    },

    placeId: {
      type: String,
      required: true,
      index: true
    },

    formattedAddress: {
      type: String,
      required: true
    },

    rawAddress: {
      type: String
    },

    components: {
      houseNumber: { type: String },
      street: { type: String },
      area: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String }
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },

    label: {
      type: String,
      default: "Other"
    },

    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", AddressSchema);

export default Address;