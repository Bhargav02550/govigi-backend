import OrderService from "../Services/OrderService.js";

const getOrdersByDateRangeController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const orders = await OrderService.getOrderByDateRange(startDate, endDate);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getOrdersByDateRangeController };