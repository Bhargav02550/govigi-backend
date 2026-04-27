import product from "../Models/product.js";
import BaseRepository from "../Repository/BaseRepository.js";

class ProductsService extends BaseRepository {
    constructor() {
        super(product);
    }
    async getProductsByCategory(category) {
        return await product.find({ category });
    }

    async getProductsById(id) {
        return await this.findById(id);
    }

    async getAllProducts() {
        return await product.find();
    }

    async createProduct(data) {
        return await this.create(data);
    }

    async updateProduct(id, data) {
        return await this.update(id, data);
    }

    async deleteProduct(id) {
        return await this.delete(id);
    }

    async getAllProductsStats() {
        try {
            const totalProducts = await product.countDocuments();
            const activeProducts = await product.countDocuments({ status: { $ne: 'inactive' } });
            const inactiveProducts = await product.countDocuments({ status: 'inactive' });
            const outOfStockProducts = await product.countDocuments({ stock: 'Out of Stock' });
            const lowStockProducts = await product.countDocuments({
                currentStock: { $gt: 0 },
                $expr: { $lte: ['$currentStock', { $ifNull: ['$minimumThreshold', 10] }] }
            });
            const inventoryValue = await product.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: {
                            $sum: {
                                $multiply: [
                                    { $ifNull: ['$currentStock', 0] },
                                    { $ifNull: ['$pricePerKg', 0] }
                                ]
                            }
                        }
                    }
                }
            ]);

            return {
                totalProducts,
                activeProducts,
                inactiveProducts,
                outOfStockProducts,
                lowStockProducts,
                totalValue: inventoryValue[0]?.totalValue || 0
            };
        } catch (err) {
            console.error("Error fetching product stats:", err);
            throw err;
        }
    }

}

export default new ProductsService();
