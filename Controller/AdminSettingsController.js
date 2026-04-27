import GlobalSettings from "../Models/GlobalSettings.js";

export const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ message: "Key and Value are required" });
        }

        const setting = await GlobalSettings.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json(setting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await GlobalSettings.findOne({ key });
        // Return default if not found
        res.json(setting || { key, value: null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
