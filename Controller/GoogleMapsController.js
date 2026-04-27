import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const reverseGeocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ message: "Latitude and Longitude are required" });
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        console.error("Reverse Geocode Error:", error.message);
        res.status(500).json({ message: "Failed to fetch address" });
    }
};

export const geocodeAddress = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ message: "Address is required" });
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        console.error("Geocode Error:", error.message);
        res.status(500).json({ message: "Failed to fetch coordinates" });
    }
};

export const autocomplete = async (req, res) => {
    try {
        const { input } = req.query;
        if (!input) {
            return res.status(400).json({ message: "Input is required" });
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`
        );
        res.json(response.data);
    } catch (error) {
        console.error("Autocomplete Error:", error.message);
        res.status(500).json({ message: "Failed to fetch suggestions" });
    }
};

export const placeDetails = async (req, res) => {
    try {
        const { place_id } = req.query;
        if (!place_id) {
            return res.status(400).json({ message: "Place ID is required" });
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GOOGLE_MAPS_API_KEY}`
        );

        const result = response.data.result;

        if (!result) {
            return res.status(404).json({ message: "Place not found" });
        }

        // Normalize Data
        const components = {};
        (result.address_components || []).forEach((c) => {
            const types = c.types || [];
            if (types.includes("street_number")) components.houseNumber = c.long_name;
            if (types.includes("route")) components.street = c.long_name;
            if (types.includes("sublocality") || types.includes("sublocality_level_1")) components.area = c.long_name;
            if (types.includes("locality")) components.city = c.long_name;
            if (types.includes("administrative_area_level_1")) components.state = c.long_name;
            if (types.includes("postal_code")) components.postalCode = c.long_name;
            if (types.includes("country")) components.country = c.long_name;
        });

        const formatted = result.formatted_address || result.name || "";
        const lat = result.geometry?.location?.lat;
        const lng = result.geometry?.location?.lng;

        const normalizedData = {
            placeId: result.place_id,
            formattedAddress: formatted,
            rawAddress: formatted,
            components,
            location: {
                type: "Point",
                coordinates: [lng, lat],
            },
            label: "Business",
            isPrimary: true,
        };

        res.json({ result: normalizedData });
    } catch (error) {
        console.error("Place Details Error:", error.message);
        res.status(500).json({ message: "Failed to fetch place details" });
    }
};
