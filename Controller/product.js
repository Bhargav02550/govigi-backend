import Product from '../Models/product.js';
import { uploadImage } from '../Controller/utils/upload_product.js';
import cloudinary from 'cloudinary';
const { v2: cloudinaryV2 } = cloudinary;
import productsService from '../Services/ProductsService.js';

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const perPage = parseInt(req.query.perPage) || parseInt(req.query.limit);
    const offset = parseInt(req.query.offset);

    let products, total, totalPages, currentPage;

    const category = req.query.category;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    total = await Product.countDocuments(query);

    let skipValue = 0;
    if (offset !== undefined && !isNaN(offset)) {
      skipValue = offset;
      currentPage = Math.floor(offset / perPage) + 1;
    } else if (page) {
      skipValue = (page - 1) * perPage;
      currentPage = page;
    }

    products = await Product.find(query)
      .sort({ updatedAt: -1 })
      .skip(skipValue)
      .limit(perPage);

    totalPages = Math.ceil(total / perPage);

    const formatted = products.map(product => ({
      ...product.toObject(),
      image: product.image || null,
      price: product.pricePerKg,
    }));

    res.status(200).json({
      products: formatted,
      page: page || 1,
      perPage: perPage || total,
      total,
      totalPages
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err });
  }
};

const createProduct = async (req, res) => {
  let image = null;
  try {
    const { name, category, pricePerKg, stock, currentStock, minimumThreshold } = req.body;
    if (req.file) {
      image = await uploadImage(req.file);
      if (!image) {
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    const product = new Product({
      name,
      category,
      pricePerKg,
      stock,
      image,
      currentStock,
      minimumThreshold
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create product', error: err });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const updates = {
      name: req.body?.name,
      category: req.body?.category,
      pricePerKg: req.body?.pricePerKg,
      stock: req.body?.stock,
      currentStock: req.body?.currentStock,
      minimumThreshold: req.body?.minimumThreshold
    };

    if (req.file) {
      if (product.image?.public_id) {
        await cloudinaryV2.uploader.destroy(product.image.public_id);
      }
      updates.image = await uploadImage(req.file);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product', error: err });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    await cloudinary.uploader.destroy(product.image.public_id);
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Deleted Successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message, error: err });
  }
}

const getProductsStats = async (req, res) => {
  try {
    const stats = await productsService.getAllProductsStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error("Error fetching product stats:", err);
    res.status(500).json({ message: 'Failed to fetch product stats', error: err });
  }
}

const getCustomerProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const search = req.query.search;

    // Relaxed filter: Show everything that is NOT strictly 'inactive'
    // This handles legacy data where status might be missing
    const query = { status: { $ne: 'inactive' } };

    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' }; // Flexible matching
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort({ updatedAt: -1 }) // or sortBy popularity/name
      .skip(skip)
      .limit(limit)
      .lean(); // Faster

    const formatted = products.map(product => ({
      _id: product._id,
      name: product.name,
      category: product.category,
      price: product.pricePerKg, // Normalized field name for frontend
      pricePerKg: product.pricePerKg,
      image: { url: product.image?.url || null }, // Match frontend expected structure
      stock: product.stock,
      availableStock: product.availableStock,
      // Exclude internal fields like costPrice, vendorId etc if any
    }));

    res.status(200).json({
      products: formatted,
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages
    });

  } catch (err) {
    console.error("Get Customer Products Error:", err);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Product IDs array is required." });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Updates object is required." });
    }

    // Allowed fields to update
    const allowedUpdates = {};
    if (updates.status) allowedUpdates.status = updates.status;
    if (updates.stock !== undefined) allowedUpdates.stock = updates.stock; // Could be number or string depending on schema usage, primarily string enum 'Available'/'Out of Stock' or number for quantity? 
    // Schema says stock is String/Enum. currentStock is Number. 
    // Let's support both if needed, but primarily what the UI sends.
    if (updates.category) allowedUpdates.category = updates.category;
    if (updates.pricePerKg) allowedUpdates.pricePerKg = updates.pricePerKg;

    // Safety check
    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: allowedUpdates }
    );

    res.status(200).json({
      message: "Products updated successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Bulk Update Error:", err);
    res.status(500).json({ message: "Failed to bulk update products", error: err.message });
  }
};

export {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsStats,
  bulkUpdateProducts,
  getCustomerProducts
};
