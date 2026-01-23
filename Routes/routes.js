import express from "express";
const Router = express.Router();

import authMiddleware from "../MiddleWears/authMiddleWear.js";

import * as controller_auth from "../Controller/auth.js";
import * as controller_order from "../Controller/order.js";
import * as controller_product from "../Controller/product.js";
import * as controller_template from "../Controller/templateController.js";
import * as controller_customer from "../Controller/CustomerController.js";
import * as controller_country from "../Controller/Country-State-City-Controller.js";
import * as controller_customerType from "../Controller/CustomerTypesController.js";
import * as controller_category from "../Controller/CategoriesController.js";
import * as controller_invoice from "../Controller/invoice.controller.js";
import * as controlle_orders from "../Controller/OrdersController.js";
import * as controller_address from "../Controller/AddressController.js";
import * as controller_maps from "../Controller/GoogleMapsController.js";
import * as controller_sourcing from "../Controller/SourcingController.js";

import upload from "../Controller/utils/upload.js";
import * as controller_wallet from "../Controller/WalletController.js";
import * as controller_settings from "../Controller/settings.js";
import vendorRoutes from "./vendorRoutes.js"; // Import vendor routes


//Testing
Router.get("/test", (req, res) => {
  console.log('api called');
  res.send("API is working");
});

// Admin login
Router.post("/admin/login", controller_auth.adminLogin);

//Auth
Router.post("/sendOTP", controller_auth.send_otp);
Router.post("/verifyOTP", controller_auth.verify_otp);
Router.post("/completeProfile", controller_auth.completeProfile);
Router.post("/sendVendorOTP", controller_auth.send_vendor_otp);
Router.post("/verifyVendorOTP", controller_auth.verify_vendor_otp);

//Customer
Router.post("/createCustomer", controller_customer.createCustomerController);
Router.put("/updateCustomer/:id", controller_customer.updateCustomerController);
Router.get("/getCustomer/:id", controller_customer.getCustomerByIdController);
Router.get("/getAllCustomers", controller_customer.getAllCustomersController);
Router.get("/getAllCustomersCount", controller_customer.getAllCustomersCountController);
Router.get("/customer/profile", authMiddleware, controller_customer.getCustomerProfileController);
Router.patch("/customer/device-token", authMiddleware, controller_customer.updateDeviceTokenController);

Router.get("/getAllCustomersStats", controller_customer.getAllCustomersStatsController);

//Customer Types
Router.post("/createCustomerType", controller_customerType.createCustomerType);
Router.get("/getAllCustomerTypes", controller_customerType.getAllCustomerTypes);

//Address
Router.post("/addAddress", authMiddleware, controller_address.addAddress);
Router.get("/getAddress", authMiddleware, controller_address.getAddresses);
Router.patch("/editAddress/:id", authMiddleware, controller_address.updateAddress);
Router.delete("/deleteAddress/:id", authMiddleware, controller_address.deleteAddress);

//template
Router.post("/createTemplate", controller_template.createTemplate);

//order
Router.post("/customerOrders", authMiddleware, controller_order.getCustomerOrders);
Router.post("/getCustomerOrderCount", authMiddleware, controller_order.getCustomerOrderCount);
Router.patch("/cancelOrder/:id", authMiddleware, controller_order.cancelCustomerOrder);
Router.post("/placeCustomerOrder", authMiddleware, controller_order.placeCustomerOrder);
Router.patch("/updateStatus/:id", authMiddleware, controller_order.updateOrderStatus);
Router.patch("/updatePaymentStatus/:id", authMiddleware, controller_order.updatePaymentStatus);
Router.get("/getAllOrders", authMiddleware, controller_order.getAllOrders);
Router.get("/getOrder/:id", authMiddleware, controller_order.getOrderById);

//product
Router.post(
  "/createProduct",
  upload.single("image"),
  controller_product.createProduct
);
Router.get("/getAllProducts", controller_product.getAllProducts);
Router.get("/getCustomerProducts", controller_product.getCustomerProducts);
Router.get("/getProductsStats", controller_product.getProductsStats);
Router.patch(
  "/updateProduct/:id",
  upload.single("image"),
  controller_product.updateProduct
);
Router.patch("/bulkUpdateProducts", controller_product.bulkUpdateProducts);
Router.delete("/deleteProduct/:id", controller_product.deleteProduct);

//Categories
Router.post("/createCategory", upload.single("image"), controller_category.createCategoryController);
Router.put("/updateCategory/:id", upload.single("image"), controller_category.updateCategoryController);
Router.get("/getAllCategories", controller_category.getAllCategoriesController);
Router.get("/getAllCategoriesStats", controller_category.getAllCategoriesStatsController);

//Countries and States
Router.get(
  "/getCountries",
  controller_country.getCountries
);

Router.get(
  "/getStates/:countryCode", controller_country.getStatesByCountry
)

Router.get(
  "/getCities/:countryCode/:stateCode",
  controller_country.getCitiesByState
);

//Invoice
Router.get("/downloadInvoice/:orderId", controller_invoice.downloadInvoice);

//Wallet
Router.get("/wallet/balance", authMiddleware, controller_wallet.getWallet);
Router.get("/wallet/transactions", authMiddleware, controller_wallet.getTransactions);

//Admin
Router.get("/getOrdersByDateRange", controlle_orders.getOrdersByDateRangeController);

// Google Maps Proxy
Router.get("/maps/reverse-geocode", controller_maps.reverseGeocode);
Router.get("/maps/geocode", controller_maps.geocodeAddress);
Router.get("/maps/autocomplete", controller_maps.autocomplete);
Router.get("/maps/place-details", controller_maps.placeDetails);

// Settings
Router.get("/settings/scheduling", controller_settings.getSchedulingSettings);
Router.patch("/settings/scheduling", controller_settings.updateSchedulingSettings);
Router.get("/mobile/config", controller_settings.getMobileConfig);
Router.get("/settings/wallet", controller_settings.getWalletSettings);

// Sourcing
Router.get("/sourcing/vendors", controller_sourcing.getNearbyVendors);
Router.post("/sourcing/assign", controller_sourcing.assignOrdersToVendor);

// Vendor Routes
Router.use("/vendors", vendorRoutes);

// Product Requests
import * as controller_productRequest from "../Controller/ProductRequestController.js";
Router.post("/createProductRequest", authMiddleware, controller_productRequest.createProductRequest);
Router.get("/getAllProductRequests", authMiddleware, controller_productRequest.getProductRequests);

export default Router;