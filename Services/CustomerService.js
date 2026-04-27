import Customer from "../Models/Customer.js";
import BaseRepository from "../Repository/BaseRepository.js";

class CustomerService extends BaseRepository {
    constructor() {
        super(Customer);
    }

    async createCustomer(data) {
        // If address data is provided (from Admin Map Picker)
        if (data.address) {
            const mongoose = (await import("mongoose")).default;
            const Address = (await import("../Models/Address.js")).default;
            const TempCustomer = (await import("../Models/TempCustomer.js")).default;

            // 1. Create a Temporary Customer holder (Logic mirrored from auth.js logic)
            // Or better: Use the "Generate ID" approach which is cleaner but let's stick to the proven auth.js method 
            // of "Update after Create" OR simply generate ID upfront.

            // Strategy: Generate ID upfront (Cleanest)
            const customerId = new mongoose.Types.ObjectId();

            // 2. Create Address with the future Customer ID
            const newAddress = await Address.create({
                customerId: customerId,
                placeId: data.address.placeId,
                formattedAddress: data.address.formattedAddress,
                rawAddress: data.address.rawAddress,
                components: data.address.components,
                location: data.address.location,
                label: data.address.label || "Business",
                isPrimary: true
            });

            // 3. Create Customer with the pre-generated ID and Address Link
            // Remove 'address' from data to avoid pollution, add 'customerAddress' and '_id'
            const { address, ...customerFields } = data;

            const customerData = {
                ...customerFields,
                _id: customerId,
                customerAddress: newAddress._id
            };

            return await this.create(customerData);
        }

        return await this.create(data);
    }

    async updateCustomer(id, data) {
        return await Customer.findByIdAndUpdate(id, data, { new: true });
    }

    async getCustomerById(id) {
        return await Customer.findById(id).populate("customerType", "typeName").populate("customerAddress");
    }

    async getAllCustomers() {
        return await Customer.find()
            .populate("customerType", "typeName")
            .populate("customerAddress")
            .sort({ createdAt: -1 });
    }

    async getAllCustomersStats() {
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ customerStatus: "active" });
        const pendingApprovals = await Customer.countDocuments({ customerStatus: "pending" });

        let totalOrders = 0;
        if (typeof (await import("../Models/orders.js")).default === "function") {
            const Order = (await import("../Models/orders.js")).default;
            totalOrders = await Order.countDocuments();
        }

        return {
            totalCustomers,
            activeCustomers,
            pendingApprovals,
            totalOrders
        };
    }

    async updateDeviceToken(id, token) {
        return await Customer.findByIdAndUpdate(id, { fcmToken: token }, { new: true });
    }

}

export default new CustomerService();