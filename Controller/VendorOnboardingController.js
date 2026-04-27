import Vendor from "../Models/Vendor.js";
import TempVendor from "../Models/TempVendor.js";
import jwt from "jsonwebtoken";

export const onboardVendor = async (req, res) => {
  try {
    const {
      token,
      businessName,
      contactPerson,
      email,
      address,
      bankDetails,
      supportedCategories
    } = req.body;

    if (!token || !businessName || !contactPerson || !email || !address) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // Verify the temp token
    const decoded = jwt.verify(token, process.env.SCERET_KEY);
    
    if (decoded.role !== "tempVendor") {
      return res.status(403).json({ message: "Invalid onboarding session." });
    }

    const tempVendor = await TempVendor.findById(decoded.tempVendorId);
    if (!tempVendor || !tempVendor.isVerified) {
      return res.status(404).json({ message: "Verified onboarding session not found." });
    }

    // Check if vendor already exists with this email
    let vendor = await Vendor.findOne({ email });
    
    if (vendor) {
      if (vendor.isVerified) {
        return res.status(400).json({ message: "A verified vendor with this email already exists and cannot be modified here." });
      }
      
      // Update the existing (unverified) vendor
      vendor.businessName = businessName;
      vendor.contactPerson = contactPerson;
      vendor.address = address;
      vendor.bankDetails = bankDetails;
      vendor.supportedCategories = supportedCategories;
      
      await vendor.save();
    } else {
      // Create the new vendor
      const newVendor = new Vendor({
        businessName,
        contactPerson,
        email,
        phone: tempVendor.mobileNumber,
        address,
        bankDetails,
        supportedCategories,
        isActive: true,
        isVerified: false,
      });
      vendor = await newVendor.save();
    }

    // Clean up TempVendor
    await TempVendor.findByIdAndDelete(tempVendor._id);

    // Generate a permanent vendor token
    const finalToken = jwt.sign(
      {
        vendorId: vendor._id,
        contact: vendor.phone,
        role: "vendor",
        businessName: vendor.businessName
      },
      process.env.SCERET_KEY,
      { expiresIn: "14d" }
    );

    res.status(201).json({
      message: vendor.isVerified ? "Vendor updated" : "Vendor onboarding completed successfully.",
      vendor: vendor,
      token: finalToken
    });

  } catch (error) {
    console.error("Onboarding Error:", error);
    res.status(500).json({ message: "Failed to complete onboarding", error: error.message });
  }
};
