import Customer from "../Models/Customer.js";
import CustomerType from "../Models/CustomerType.js";

// --- Customer Approval ---
export const getPendingCustomers = async (req, res) => {
    try {
        const pending = await Customer.find({ customerStatus: "pending" }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'rejected'

        if (!["active", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const customer = await Customer.findByIdAndUpdate(id, { customerStatus: status }, { new: true });
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        res.json({ message: `Customer ${status}`, customer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Customer Segments ---
export const createCustomerType = async (req, res) => {
    try {
        const { typeName, description, discountPercentage } = req.body;
        const newType = new CustomerType({ typeName, description, discountPercentage });
        await newType.save();
        res.status(201).json(newType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCustomerType = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await CustomerType.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCustomerType = async (req, res) => {
    try {
        const { id } = req.params;
        await CustomerType.findByIdAndDelete(id);
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
