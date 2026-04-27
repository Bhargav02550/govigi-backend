import ProductRequest from '../Models/productRequest.js';
import Customer from '../Models/Customer.js';

const createProductRequest = async (req, res) => {
    try {
        const { productName, customerId } = req.body;

        if (!productName) {
            return res.status(400).json({ message: "Product name is required" });
        }

        // Token payload contains: { customerId, contact, role, ... }
        const userId = req.user ? req.user.customerId : customerId;

        if (!userId) {
            console.error("No user ID found in request or token");
            return res.status(401).json({ message: "User not authenticated" });
        }

        const newRequest = new ProductRequest({
            productName,
            customerId: userId
        });

        await newRequest.save();

        res.status(201).json({ message: "Request submitted successfully", data: newRequest });
    } catch (error) {
        console.error("Error creating product request:", error);
        res.status(500).json({ message: "Failed to submit request", error: error.message });
    }
};

const getProductRequests = async (req, res) => {
    try {
        const requests = await ProductRequest.find().sort({ createdAt: -1 }).populate('customerId', 'customerName customerPhone');
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch requests", error: error.message });
    }
};

export { createProductRequest, getProductRequests };
