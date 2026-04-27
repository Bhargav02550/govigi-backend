import mongoose from 'mongoose';

// Create a simple counter schema to track order numbers
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('counter', counterSchema);

/**
 * Generate a meaningful order number with customer info and date
 * Format: GOVIGI-{MOBILE_LAST4}-{DATE}-{SEQUENCE}
 * Example: GOVIGI-3210-20251103-00042
 * 
 * @param {string} contact - Customer mobile number
 * @param {string} name - Customer name (optional, fallback to mobile)
 * @returns {Promise<string>} - Formatted order number
 */
export async function generateOrderNumber(contact, name) {
    try {
        // Extract last 4 digits of mobile number
        const mobileLast4 = contact ? contact.slice(-4) : '0000';
        
        // Get today's date in YYYYMMDD format
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        
        // Increment the counter for this date
        const counterKey = `orderNumber-${dateStr}`;
        const counter = await Counter.findByIdAndUpdate(
            counterKey,
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );
        
        const paddedSequence = String(counter.sequence_value).padStart(5, '0');
        
        // Format: GOVIGI-{MOBILE_LAST4}-{DATE}-{SEQUENCE}
        return `GOVIGI-${mobileLast4}-${dateStr}-${paddedSequence}`;
    } catch (error) {
        console.error('Error generating order number:', error);
        throw error;
    }
}
