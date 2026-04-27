import Vendor from "../Models/Vendor.js";
import Order from "../Models/orders.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.SCERET_KEY;

// Create a new vendor
export const createVendor = async (req, res) => {
    try {
        const { businessName, contactPerson, email, phone, address, bankDetails, isActive, serviceHexagons, supportedCategories } = req.body;

        // Check if vendor already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor with this email already exists" });
        }

        const newVendor = new Vendor({
            businessName,
            contactPerson,
            email,
            phone,
            address, // Expecting rich address object from frontend
            bankDetails,
            isActive,
            serviceHexagons,
            supportedCategories
        });

        const savedVendor = await newVendor.save();
        res.status(201).json(savedVendor);
    } catch (error) {
        res.status(500).json({ message: "Error creating vendor", error: error.message });
    }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vendors", error: error.message });
    }
};

// Get single vendor by ID
export const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vendor details", error: error.message });
    }
};


// Refresh session checking if vendor exists for temp vendor's contact
export const refreshSession = async (req, res) => {
    try {
        if (!req.user || !req.user.contact) {
            return res.status(400).json({ message: "Invalid session or missing contact info." });
        }

        const vendor = await Vendor.findOne({ phone: req.user.contact });

        if (!vendor) {
            // Still no vendor found, registration is not complete
            return res.status(404).json({ message: "Vendor not found. Please complete registration.", needRegistration: true });
        }

        // Vendor found! the mobile app is now verified.
        const token = jwt.sign(
            {
                vendorId: vendor._id,
                contact: vendor.phone,
                role: "vendor",
                businessName: vendor.businessName
            },
            process.env.SCERET_KEY,
            { expiresIn: "14d" }
        );

        return res.status(200).json({
            message: "Session refreshed successfully",
            token,
            isNew: false,
            needRegistration: false,
            isVerified: vendor.isVerified,
            vendor: vendor
        });
    } catch (error) {
        res.status(500).json({ message: "Error refreshing session", error: error.message });
    }
};

// Update vendor
export const updateVendor = async (req, res) => {
    try {
        const updatedVendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedVendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json(updatedVendor);
    } catch (error) {
        res.status(500).json({ message: "Error updating vendor", error: error.message });
    }
};

// Delete vendor (Optional, usually just deactivate)
export const deleteVendor = async (req, res) => {
    try {
        const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!deletedVendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting vendor", error: error.message });
    }
};
// Vendor Dashboard
export const getVendorDashboard = async (req, res) => {
    try {
        // Middleware already verified token
        const vendorId = req.user.vendorId;
        if (!vendorId) return res.status(401).json({ message: "Invalid Vendor Token" });

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        // Fetch Orders assigned to this vendor
        const orders = await Order.find({ vendorId: vendorId })
            .sort({ createdAt: -1 })
            .populate('customerId', 'customerName');

        // Calculate Stats
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.sourcingStatus === 'Assigned' || o.sourcingStatus === 'Pending').length;
        const completedOrders = orders.filter(o => o.sourcingStatus === 'Delivered').length;
        const totalSales = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        const avgOrderValue = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : "0.00";
        const fulfillmentRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0.0";

        const stats = {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalSales: totalSales.toFixed(2),
            avgOrderValue,
            fulfillmentRate
        };

        // Calculate Material Summary (Shopping List)
        const materialSummary = {};
        orders.filter(o => o.sourcingStatus === 'Assigned' || o.sourcingStatus === 'Pending').forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const itemName = item.name || "Unknown Item"; // Safety check
                    if (materialSummary[itemName]) {
                        materialSummary[itemName].qty += (item.quantityKg || 0);
                    } else {
                        materialSummary[itemName] = {
                            qty: (item.quantityKg || 0),
                            image: item.image,
                            unit: "kg",
                            status: "Low", // All pending materials are effectively "Low Stock" logic for now
                            createdAt: order.createdAt
                        };
                    }
                });
            }
        });

        // Convert object to array for frontend
        const sourcingList = Object.keys(materialSummary).map(key => ({
            materialName: key,
            totalQuantity: materialSummary[key].qty,
            unit: materialSummary[key].unit,
            image: materialSummary[key].image,
            status: materialSummary[key].status,
            createdAt: materialSummary[key].createdAt
        }));

        stats.lowStockItems = sourcingList.length;

        // Ensure orderId exists for frontend
        const safeOrders = orders.map(o => {
            const doc = o.toObject ? o.toObject() : o;
            return {
                ...doc,
                orderId: doc.orderId || doc.orderNumber || doc._id.toString(),
                customerName: doc.customerId?.customerName || "Unknown Customer"
            };
        });

        res.status(200).json({
            profile: {
                businessName: vendor.businessName,
                contactPerson: vendor.contactPerson,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address?.formattedAddress || "No address provided",
                image: vendor.businessImage,
                isVerified: vendor.isVerified,
                rating: vendor.rating || 4.5, // Dummy default if not set
                joinedDate: vendor.joinedDate || vendor.createdAt || new Date(),
                categories: vendor.supportedCategories?.length ? vendor.supportedCategories.join(", ") : "General Store"
            },
            stats,
            sourcingList,
            recentOrders: safeOrders
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        // Basic status update for vendor (e.g., Packed, Out for Delivery)
        // Ensure sourcingStatus is updated
        const order = await Order.findByIdAndUpdate(orderId, { sourcingStatus: status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Failed to update status" });
    }
};

export const getVendorOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Fetching order details for ID:", id);

        let order;

        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id)
                .populate('customerId', 'customerName customerPhone customerAddress')
                .populate('addressId');
        } else {
            console.log("Invalid ObjectId, trying lookup by orderNumber/orderId:", id);
            order = await Order.findOne({ $or: [{ orderNumber: id }, { orderId: id }] })
                .populate('customerId', 'customerName customerPhone customerAddress')
                .populate('addressId');
        }

        if (!order) {
            console.log("Order not found in DB");
            return res.status(404).json({ message: `Order not found with ID: ${id}` });
        }
        res.json(order);
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({ message: "Error fetching order details", error: error.message });
    }
};

export const toggleVendorStatus = async (req, res) => {
    try {
        const vendorId = req.user.vendorId;
        if (!vendorId) return res.status(401).json({ message: "Invalid Vendor Token" });

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        vendor.isActive = !vendor.isActive;
        await vendor.save();

        res.json({ message: "Status updated", isActive: vendor.isActive });
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};

export const getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.user.vendorId;
        if (!vendorId) return res.status(401).json({ message: "Invalid Vendor Token" });

        const orders = await Order.find({ vendorId: vendorId })
            .sort({ createdAt: -1 })
            .populate('customerId', 'customerName')
            .populate('addressId');

        const safeOrders = orders.map(o => {
            const doc = o.toObject ? o.toObject() : o;
            return {
                ...doc,
                orderId: doc.orderId || doc.orderNumber || doc._id.toString()
            };
        });

        res.json({ orders: safeOrders });
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};
