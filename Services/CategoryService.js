import Category from '../Models/Categories.js';

class CategoryService {
    async createCategory(data) {
        const category = new Category(data);
        return await category.save();
    }

    async getCategoryById(id) {
        return await Category.findById(id);
    }

    async getAllCategories() {
        return await Category.find();
    }

    async updateCategory(id, data) {
        return await Category.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCategory(id) {
        return await Category.findByIdAndDelete(id);
    }

    async getAllCategoriesStats(){
        const totalCategories = await Category.countDocuments();
        const activeCategories = await Category.countDocuments({ categoryStatus: "active" });
        const inactiveCategories = await Category.countDocuments({ categoryStatus: "inactive" });

        return {
            totalCategories,
            activeCategories,
            inactiveCategories
        };

    }

}

export default new CategoryService();