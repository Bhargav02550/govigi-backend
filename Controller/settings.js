import GlobalSettings from "../Models/GlobalSettings.js";

const DEFAULT_SETTINGS = {
    morningSlots: [
        { start: "08:00", end: "09:00" },
        { start: "09:00", end: "10:00" },
        { start: "10:00", end: "11:00" }
    ],
    eveningSlots: [
        { start: "16:00", end: "17:00" },
        { start: "17:00", end: "18:00" },
        { start: "18:00", end: "19:00" }
    ],
    maxDays: 7,
    allowToday: false
};

const getSchedulingSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne({ key: "scheduling_settings" });

        if (!settings) {
            // Initialize if not exists
            settings = await GlobalSettings.create({
                key: "scheduling_settings",
                value: DEFAULT_SETTINGS
            });
        }

        res.status(200).json(settings.value);
    } catch (err) {
        console.error("Get Scheduling Settings Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateSchedulingSettings = async (req, res) => {
    try {
        const { morningSlots, eveningSlots, maxDays, allowToday } = req.body;

        const settings = await GlobalSettings.findOneAndUpdate(
            { key: "scheduling_settings" },
            {
                value: {
                    morningSlots,
                    eveningSlots,
                    maxDays: maxDays || 7,
                    allowToday: allowToday || false
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: "Settings updated successfully", settings: settings.value });
    } catch (err) {
        console.error("Update Scheduling Settings Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getMobileConfig = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOne({ key: "mobile_config" });
        // Return default structure if null to prevent app crash, 
        // though seed script should have handled this.
        res.status(200).json(settings ? settings.value : {});
    } catch (err) {
        console.error("Get Mobile Config Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getWalletSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne({ key: "wallet_percentage" });
        if (!settings) {
            settings = await GlobalSettings.create({
                key: "wallet_percentage",
                value: 10 // Default 10%
            });
        }
        res.status(200).json({ percentage: settings.value });
    } catch (err) {
        console.error("Get Wallet Settings Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateWalletSettings = async (req, res) => {
    try {
        const { percentage } = req.body;
        if (percentage < 0 || percentage > 100) {
            return res.status(400).json({ message: "Percentage must be between 0 and 100" });
        }

        const settings = await GlobalSettings.findOneAndUpdate(
            { key: "wallet_percentage" },
            { value: percentage },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: "Wallet settings updated", percentage: settings.value });
    } catch (err) {
        console.error("Update Wallet Settings Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { getSchedulingSettings, updateSchedulingSettings, getMobileConfig, getWalletSettings, updateWalletSettings };
