import CategoryService from "../Services/CategoryService.js";
import { uploadImage } from "./utils/upload_product.js";

const createCategoryController = async (req, res) => {
    try {
        const categoryData = { ...req.body };

        if (req.file) {
            const image = await uploadImage(req.file);
            if (!image) {
                return res.status(500).json({ message: "Image upload failed" });
            }
            categoryData.categoryImage = {
                url: image.url,
                public_id: image.public_id
            };
        }

        const newCategory = await CategoryService.createCategory(categoryData);
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await CategoryService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCategoriesStatsController = async (req, res) => {
    try {
        const stats = await CategoryService.getAllCategoriesStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryData = { ...req.body };

        if (req.file) {
            const image = await uploadImage(req.file);
            if (!image) {
                return res.status(500).json({ message: "Image upload failed" });
            }
            categoryData.categoryImage = {
                url: image.url,
                public_id: image.public_id
            };
        }

        const updatedCategory = await CategoryService.updateCategory(id, categoryData);
        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await CategoryService.deleteCategory(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export { createCategoryController, getAllCategoriesController, getAllCategoriesStatsController, updateCategoryController, deleteCategoryController };