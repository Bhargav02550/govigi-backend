import express from "express";
import * as vendorController from "../Controller/VendorController.js";
import authMiddleware from "../MiddleWears/authMiddleWear.js";

const router = express.Router();

// Apply authMiddleware to protect all vendor routes
// Assuming only admin or authorized users should access these
router.post("/create", authMiddleware, vendorController.createVendor);
router.get("/dashboard", authMiddleware, vendorController.getVendorDashboard);
router.get("/orders", authMiddleware, vendorController.getVendorOrders);
router.get("/order/:id", authMiddleware, vendorController.getVendorOrderDetails);
router.patch("/order/status", authMiddleware, vendorController.updateOrderStatus);
router.patch("/status", authMiddleware, vendorController.toggleVendorStatus);
router.get("/getAll", authMiddleware, vendorController.getAllVendors);
router.get("/get/:id", authMiddleware, vendorController.getVendorById);
router.get("/refresh", authMiddleware, vendorController.refreshSession);
router.patch("/update/:id", authMiddleware, vendorController.updateVendor);
router.delete("/delete/:id", authMiddleware, vendorController.deleteVendor);

export default router;
