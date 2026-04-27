import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String },
    category: { type: String },
    subCategory: { type: String },
    description: { type: String },
    unit: { type: String },
    pricePerKg: { type: Number, required: true },
    mrp: { type: Number },
    costPrice: { type: Number },
    stock: {
      type: String,
      enum: ['Available', 'Out of Stock'],
      required: true,
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    image: {
      url: { type: String },
      public_id: { type: String }
    },
    availableStock: { type: String},
    currentStock: {type: Number},
    minimumThreshold: {type: Number},
    maxOrderQuantity: { type: Number },
    trackStock: { type: Boolean, default: true },
    vendor: { type: String },
    productType: { type: String, enum: ['veggie', 'organic'] },
    seasonal: { type: String, enum: ['yes', 'no'] },
    countryOfOrigin: { type: String },
    shelfLife: { type: Number },
    storageInstructions: { type: String },
    tags: [{ type: String }]
  },{timestamps: true}
);

export default mongoose.model('product', productSchema);
