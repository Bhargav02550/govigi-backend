import Order from "../Models/orders.js";

class OrderService {

    async getOrderByDateRange(startDate, endDate) {
        console.log("Start Date:", startDate, "End Date:", endDate);

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return await Order.find({
            scheduledDate: { $gte: start, $lte: end }
        });
    }

}

export default new OrderService();