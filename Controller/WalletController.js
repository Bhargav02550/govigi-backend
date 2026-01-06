import Wallet from "../Models/Wallet.js";
import WalletTransactions from "../Models/WalletTransactions.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SCERET_KEY;

export const getWallet = async (req, res) => {
    try {
        const customerId = req.user.customerId;

        console.log("Customer ID:", customerId);

        let wallet = await Wallet.findOne({ customerId: customerId });

        console.log("Wallet:", wallet);

        if (!wallet) {
            wallet = await Wallet.create({ customerId: customerId, balance: 0.00 });
        }

        res.status(200).json(wallet);
    } catch (error) {
        console.error("Get Wallet Error:", error);
        res.status(500).json({ message: "Failed to fetch wallet", error: error.message });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const customerId = req.user.customerId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const transactions = await WalletTransactions.find({ customerId: customerId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await WalletTransactions.countDocuments({ customerId: customerId });

        res.status(200).json({
            transactions,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTransactions: total
        });
    } catch (error) {
        console.error("Get Transactions Error:", error);
        res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
    }
};
