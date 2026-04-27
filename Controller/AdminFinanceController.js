import WalletTransactions from "../Models/WalletTransactions.js";

export const getAllTransactions = async (req, res) => {
    try {
        const { type, startDate, endDate, customerId } = req.query;
        let query = {};

        if (type && type !== "all") {
            query.type = type;
        }

        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (customerId) {
            query.customerId = customerId;
        }

        const transactions = await WalletTransactions.find(query)
            .sort({ timestamp: -1 })
            .populate('customerId', 'customerName customerPhone') // Populate customer details
            .limit(100); // Limit for safety

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
