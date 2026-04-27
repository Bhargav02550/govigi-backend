import express from "express";
import {
    getPendingCustomers,
    updateCustomerStatus,
    createCustomerType,
    updateCustomerType,
    deleteCustomerType
} from "../Controller/AdminCustomerController.js";
import { assignDriverToOrder, createDriver, getAllDrivers, updateOrderStatus, updatePaymentStatus } from "../Controller/AdminOrderController.js";
import { updateSetting, getSetting } from "../Controller/AdminSettingsController.js";
import { getWalletSettings, updateWalletSettings } from "../Controller/settings.js";

const router = express.Router();

// --- Drivers ---
router.post("/drivers", createDriver);
router.get("/drivers", getAllDrivers);
router.put("/orders/:orderId/assign-driver", assignDriverToOrder);
router.put("/orders/:orderId/status", updateOrderStatus);
router.put("/orders/:orderId/payment-status", updatePaymentStatus);

// --- Customer Management ---
router.get("/customers/pending", getPendingCustomers);
router.put("/customers/:id/status", updateCustomerStatus);

// --- Customer Segments ---
router.post("/customer-types", createCustomerType);
router.put("/customer-types/:id", updateCustomerType);
router.delete("/customer-types/:id", deleteCustomerType);

// --- Order Management ---
router.put("/orders/:orderId/assign-driver", assignDriverToOrder);

// --- Finance ---
import { getAllTransactions } from "../Controller/AdminFinanceController.js";
router.get("/finance/transactions", getAllTransactions);

// --- Global Settings (Delivery Zones, Wallet %) ---
router.get("/settings/wallet", getWalletSettings);
router.put("/settings/wallet", updateWalletSettings);
router.get("/settings/:key", getSetting);
router.put("/settings", updateSetting);

export default router;
