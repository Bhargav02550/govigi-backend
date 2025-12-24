import Order from "../Models/orders.js";
import Vendor from "../Models/Vendor.js";
import Product from "../Models/product.js";

// Get vendors. If lat/lng provided, sort by distance. 
// Features Smart Sourcing: Recommend based on Product Category Match + H3 Service Range
const getNearbyVendors = async (req, res) => {
    try {
        const { lat, lng, orderIds } = req.query; // orderIds sent as comma separated string? or array

        // 1. Determine Required Categories
        // We prefer 'categories' passed from frontend, otherwise fallback to orderIds (which is harder)
        let requiredInfo = [];
        if (req.query.categories) {
            requiredInfo = decodeURIComponent(req.query.categories).split(',').filter(Boolean);
        }

        console.log("GetNearbyVendors Query Params:", { lat, lng, requiredInfo });

        let query = { isActive: true };
        let usedGeospatial = false;

        // 2. Geospatial Sort (Nearest Vendor)
        // If lat/lng provided, use $near to find closest vendors
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);

            // Only apply $near if coordinates appear valid
            if (latNum !== 0 && lngNum !== 0) {
                query["address.location"] = {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lngNum, latNum]
                        },
                        // Optional: $maxDistance in meters (e.g., 500km to be safe for testing?)
                        // Increased to 500km to ensure we find vendors during dev testing
                        $maxDistance: 500000
                    }
                };
                usedGeospatial = true;
            }
        }

        let vendors = await Vendor.find(query).lean();
        console.log(`Found ${vendors.length} vendors with initial query (Geospatial: ${usedGeospatial})`);

        // Fallback: If Geosearch found nothing, try fetching ALL active vendors to at least show something
        if (vendors.length === 0 && usedGeospatial) {
            console.log("Geospatial query returned 0. Falling back to simple fetch.");
            vendors = await Vendor.find({ isActive: true }).lean();
        }

        // 3. Post-Process: Calculate Distance & Category Match
        const origin = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

        vendors = vendors.map(v => {
            let distance = null;
            if (origin && v.address?.location?.coordinates) {
                const [vLng, vLat] = v.address.location.coordinates;
                distance = calculateHaversineDistance(origin.lat, origin.lng, vLat, vLng);
            }

            // Smart Match Logic
            const supported = v.supportedCategories || [];
            let matchTags = [];

            if (requiredInfo.length > 0) {
                const matches = requiredInfo.filter(reqCat =>
                    supported.some(sup => sup.toLowerCase() === reqCat.toLowerCase())
                );

                if (matches.length === requiredInfo.length) {
                    matchTags.push("Full Match");
                } else if (matches.length > 0) {
                    matchTags.push(`Partial: ${matches.length}/${requiredInfo.length}`);
                } else {
                    matchTags.push("Mismatch");
                }
            } else {
                // If no specific categories required, just list what they support
                // matchTags = supported; // Or leave empty? Let's leave empty to avoid clutter if no requirement.
            }

            return {
                ...v,
                distance: distance ? parseFloat(distance.toFixed(1)) : null,
                matchScore: (distance ? -distance : 0),
                recommendationTags: matchTags.length > 0 ? matchTags : supported // Fallback to showing everything if no match logic run
            };
        });

        // 4. Final Sort (if not using $near, or to refine)
        // If we want to strictly enforce "Nearest", they are already roughly sorted by $near.
        // But let's re-sort by our precise Haversine distance to be safe.
        if (origin) {
            vendors.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }

        res.status(200).json(vendors);
    } catch (error) {
        console.error("Get Nearby Vendors Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Helper: Haversine Formula for Distance (km)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const assignOrdersToVendor = async (req, res) => {
    try {
        const { vendorId, orderIds } = req.body;

        if (!vendorId || !orderIds || !Array.isArray(orderIds)) {
            return res.status(400).json({ message: "Vendor ID and Order IDs array are required." });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found." });
        }

        // Update Orders
        const result = await Order.updateMany(
            { _id: { $in: orderIds } },
            {
                $set: {
                    vendorId: vendorId,
                    sourcingStatus: "Assigned"
                }
            }
        );

        res.status(200).json({
            message: "Orders assigned successfully",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Assign Orders Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export { getNearbyVendors, assignOrdersToVendor };
