
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB || "mongodb://localhost:27017/govigi"; // MONGODB matches app.js

async function createIndex() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB...");

        const Vendor = mongoose.model("Vendor", new mongoose.Schema({
            address: { location: { coordinates: { type: [Number], index: "2dsphere" } } }
        }, { strict: false }));

        console.log("Creating 2dsphere index on Vendor collection...");
        await Vendor.collection.createIndex({ "address.location": "2dsphere" });

        console.log("Index created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error creating index:", error);
        process.exit(1);
    }
}

createIndex();
