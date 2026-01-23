import Customer from "../Models/Customer.js";
import customerService from "../Services/CustomerService.js";
import CustomerTypesService from "../Services/CustomerTypesService.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const createCustomerController = async (req, res) => {
    try {
        const customerData = req.body;
        const newCustomer = await customerService.createCustomer(customerData);
        res.status(201).json(newCustomer);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const updateCustomerController = async (req, res) => {
    try {
        const { id } = req.params;
        const customerData = req.body;
        const updatedCustomer = await customerService.updateCustomer(id, customerData);
        if (!updatedCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCustomerByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await customerService.getCustomerById(id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCustomersController = async (req, res) => {
    try {
        const customers = await customerService.getAllCustomers();

        res.status(200).json(customers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCustomersCountController = async (req, res) => {
    try {
        const count = await customerService.getAllCustomersCount();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCustomerProfileController = async (req, res) => {
    try {
        if (!req.user || !req.user.customerId) return res.status(401).json({ message: "No token provided" });
        const customer = await customerService.getCustomerById(req.user.customerId);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCustomersStatsController = async (req, res) => {
    try {
        const stats = await customerService.getAllCustomersStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateDeviceTokenController = async (req, res) => {
    try {
        if (!req.user || !req.user.customerId) return res.status(401).json({ message: "No token provided" });
        const { fcmToken } = req.body;
        if (!fcmToken) return res.status(400).json({ message: "fcmToken is required" });

        const updatedCustomer = await customerService.updateDeviceToken(req.user.customerId, fcmToken);
        res.status(200).json({ message: "Device token updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { createCustomerController, updateCustomerController, getCustomerByIdController, getAllCustomersController, getAllCustomersCountController, getAllCustomersStatsController, getCustomerProfileController, updateDeviceTokenController };