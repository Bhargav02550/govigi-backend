import Order from "../Models/orders.js";
import Driver from "../Models/Driver.js";

export const createDriver = async (req, res) => {
    try {
        const { name, phone, vehicleNumber } = req.body;
        const newDriver = new Driver({ name, phone, vehicleNumber });
        await newDriver.save();
        res.status(201).json(newDriver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ status: 'active' });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const assignDriverToOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { driverId } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { driverId, assignedAt: new Date(), status: 'Processing' }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // Pending, Processing, Shipped, Delivered, Cancelled
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus } = req.body; // Pending, Paid, Failed
        const order = await Order.findByIdAndUpdate(orderId, { paymentStatus }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
