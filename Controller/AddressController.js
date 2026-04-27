import Address from "../Models/Address.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SCERET_KEY;

const addAddress = async (req, res) => {
    try {
        const customerId = req.user.customerId;
        console.log("Decoded UserId :", customerId);
        console.log("Request Body :", req.body);

        const address = await Address.create({

            customerId: customerId,
            placeId: req.body.placeId,
            formattedAddress: req.body.formattedAddress,
            rawAddress: req.body.rawAddress,
            components: req.body.components,
            location: req.body.location,
            label: req.body.label,
            isPrimary: req.body.isPrimary || false
        });

        // If marked as primary, make sure others are not primary
        if (address.isPrimary) {
            await Address.updateMany(
                { customerId: customerId, _id: { $ne: address._id } },
                { $set: { isPrimary: false } }
            );
        }

        return res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: address
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const getAddresses = async (req, res) => {
    try {
        const customerId = req.user.customerId;

        let addresses;

        try {
            addresses = await Address.find({ customerId: customerId });
            console.log("Addresses found:", addresses.length);
        }
        catch (findErr) {
            console.log("Error finding addresses:", findErr);
            return res.status(500).json({
                success: false,
                message: "Error retrieving addresses",
                error: findErr.message
            });
        }

        return res.status(200).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const address = await Address.findByIdAndUpdate(id, updates, { new: true });

        // If marked as primary, make sure others are not primary
        if (updates.isPrimary) {
            await Address.updateMany(
                { userId: address.userId, _id: { $ne: address._id } },
                { $set: { isPrimary: false } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await Address.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Address deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export { addAddress, getAddresses, updateAddress, deleteAddress };