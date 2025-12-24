import Order from "../Models/orders.js";
import User from "../Models/users.js";
import jwt from 'jsonwebtoken';
import { generateOrderNumber } from './utils/orderNumberGenerator.js';
import { creditVigiCoins } from "../Services/WalletService.js";
import Address from "../Models/Address.js";
import Product from "../Models/product.js";
import Customer from "../Models/Customer.js";

const JWT_SECRET = process.env.SCERET_KEY;

const placeCustomerOrder = async (req, res) => {
  try {
    const { token } = req.token;

    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenErr) {
      console.error("JWT verification failed:", tokenErr.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        error: tokenErr.message
      });
    }

    const customerId = decoded.customerId;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "User not found" })
    }

    if (customer.customerStatus === 'blocked') {
      return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    }

    if (customer.customerStatus !== 'active') {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    const { items, addressId, scheduledDate, name, scheduledTimeSlot } = req.body;

    // Scheduling Validation
    if (scheduledDate) {
      const scheduleDt = new Date(scheduledDate);
      const now = new Date();

      // Calculate tomorrow's date (start of day)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Calculate max date (7 days from tomorrow)
      const maxDate = new Date(tomorrow);
      maxDate.setDate(maxDate.getDate() + 7);

      // Check if scheduled date is at least tomorrow
      const scheduleDateOnly = new Date(scheduleDt);
      scheduleDateOnly.setHours(0, 0, 0, 0);

      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      if (scheduleDateOnly <= today) {
        return res.status(400).json({ message: "Orders can only be scheduled for tomorrow onwards." });
      }

      if (scheduleDateOnly > maxDate) {
        return res.status(400).json({ message: "Orders can only be scheduled up to 7 days in advance." });
      }

      if (!scheduledTimeSlot) {
        return res.status(400).json({ message: "Time slot is required for scheduled orders." });
      }
    }

    const address = await Address.findById(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" })
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const itemTotal = product.pricePerKg * item.quantityKg;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantityKg: item.quantityKg,
        price: product.pricePerKg,
        name: product.name,
        image: product.image?.url || ""
      });
    }

    const orderNumber = await generateOrderNumber(customer.customerPhone, name);

    const newOrder = await Order.create({
      customerId,
      orderNumber,
      addressId,
      items: orderItems,
      scheduledDate,
      scheduledTimeSlot,
      name,
      contact: customer.customerPhone,
      totalAmount
    });

    // await creditVigiCoins(customer._id, totalAmount, newOrder._id);

    res.status(201).json({ message: "Order placed successfully", order: newOrder });

  } catch (err) {
    console.error("Place Customer Order Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const getCustomerOrders = async (req, res) => {
  try {
    const { token } = req.token;
    console.log("req :", token);
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenErr) {
      console.error("JWT verification failed:", tokenErr.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        error: tokenErr.message
      });
    }

    console.log("Decoded CustomerId :", decoded);

    const customerId = decoded.customerId;

    const data = await Order.find({ customerId }).sort({ createdAt: -1 });

    console.log("Data :", data);

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Data :", data);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order status updated", order: updatedOrder });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'customerName customerPhone customerContactPerson customerAddress customerType')
      .populate('addressId')
      .lean() // Use lean for modifying the result
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Populate Categories for Sourcing UI
    // Fetch all products with just their category
    const products = await Product.find({}, 'category').lean();
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p.category;
    });

    // Attach category to each item
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const cat = productMap[item.productId];
          item.category = cat || "General";
        });
      }
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get All Orders Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { token } = req.token;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenErr) {
      console.error("JWT verification failed:", tokenErr.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        error: tokenErr.message
      });
    }

    const { id } = req.params;

    const order = await Order.findById(id).populate('customerId', 'customerName customerPhone customerContactPerson customerAddress customerType');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let orderAddress = null;
    if (order.addressId) {
      orderAddress = await Address.findById(order.addressId);
    }

    res.status(200).json({ order, orderAddress });
  } catch (err) {
    console.error("Get Order By ID Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCustomerOrderCount = async (req, res) => {
  try {
    const { token } = req.token;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify JWT token and extract contact
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenErr) {
      console.error("JWT verification failed:", tokenErr.message);
      return res.status(401).json({
        message: "Invalid or expired token",
        error: tokenErr.message
      });
    }

    const contact = decoded.contact;

    if (!contact) {
      return res.status(400).json({ message: "Contact information not found in token" });
    }

    // Count orders for this contact
    const orderCount = await Order.countDocuments({ contact });

    res.status(200).json({ contact, orderCount });
  } catch (err) {
    console.error("Get Customer Order Count Error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ message: "Payment status is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If status is changing to Paid, credit wallet
    if (paymentStatus === "Paid" && order.paymentStatus !== "Paid") {
      await creditVigiCoins(order.customerId, order.totalAmount, order._id);
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.status(200).json({ message: "Payment status updated", order });
  } catch (err) {
    console.error("Update Payment Status Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const cancelCustomerOrder = async (req, res) => {
  try {
    const { token } = req.token;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (tokenErr) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const customerId = decoded.customerId;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the order belongs to the requesting customer
    if (order.customerId.toString() !== customerId) {
      return res.status(403).json({ message: "Unauthorized to cancel this order" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });

  } catch (err) {
    console.error("Cancel Order Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { placeCustomerOrder, getCustomerOrders, updateOrderStatus, getAllOrders, getOrderById, getCustomerOrderCount, updatePaymentStatus, cancelCustomerOrder };