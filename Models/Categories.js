import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true, unique: true },
    categoryDescription: { type: String },
    categoryImage: {
        url: { type: String },
        public_id: { type: String }
    },
    categoryStatus: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;