import Vendor from "../Models/Vendor.js";
import Order from "../Models/orders.js";
import jwt from "jsonwebtoken";

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
        const { token } = req.token;
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, JWT_SECRET);
        const vendorId = decoded.vendorId;

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        // Fetch Orders assigned to this vendor
        const orders = await Order.find({ vendorId: vendorId }).sort({ createdAt: -1 });

        // Calculate Stats
        const stats = {
            totalOrders: orders.length,
            pending: orders.filter(o => o.sourcingStatus === 'Assigned' || o.sourcingStatus === 'Pending').length,
            completed: orders.filter(o => o.sourcingStatus === 'Delivered').length,
            revenue: orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) // Approximation
        };

        // Calculate Material Summary (Shopping List)
        const materialSummary = {};
        orders.filter(o => o.sourcingStatus === 'Assigned' || o.sourcingStatus === 'Pending').forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (materialSummary[item.name]) {
                        materialSummary[item.name].qty += (item.quantityKg || 0);
                    } else {
                        materialSummary[item.name] = {
                            qty: (item.quantityKg || 0),
                            image: item.image
                        };
                    }
                });
            }
        });

        // Convert object to array for frontend
        const sourcingList = Object.keys(materialSummary).map(key => ({
            name: key,
            totalQuantity: materialSummary[key].qty,
            image: materialSummary[key].image
        }));

        res.json({
            profile: {
                businessName: vendor.businessName,
                contactPerson: vendor.contactPerson,
                image: vendor.businessImage
            },
            stats,
            sourcingList,
            orders
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
        const order = await Order.findById(id)
            .populate('customerId', 'customerName customerPhone customerAddress')
            .populate('addressId');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order details" });
    }
};

export const toggleVendorStatus = async (req, res) => {
    try {
        const { token } = req.token;
        const decoded = jwt.verify(token, JWT_SECRET);

        const vendor = await Vendor.findById(decoded.vendorId);
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });

        vendor.isActive = !vendor.isActive;
        await vendor.save();

        res.json({ message: "Status updated", isActive: vendor.isActive });
    } catch (error) {
        res.status(500).json({ message: "Error updating status" });
    }
};
