
const Banner = require("../../models/Banner");
const fs = require("fs");
const path = require("path");
// Create a new banner
exports.createBanner = async (req, res) => {
    try {
        const { name } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        if (!name || !imageUrl) {
            return res.status(400).json({
                success: false,
                message: "Name and image are required",
            });
        }

        const banner = new Banner({
            name,
            imageUrl,
        });

        await banner.save();

        return res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner,
        });
    } catch (err) {
        console.error("createBanner Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Get all banners
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ _id: -1 });

        // Fix imageUrl backslashes to forward slashes for all banners
        const fixedBanners = banners.map(banner => {
            return {
                ...banner.toObject(),
                imageUrl: banner.imageUrl.replace(/\\/g, "/"),
            };
        });

        return res.status(200).json({
            success: true,
            message: "Banners fetched successfully",
            data: fixedBanners,
        });
    } catch (err) {
        console.error("getAllBanners Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }

}

// Delete a banner by ID
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found",
            });
        }

        // Optional: delete image file from disk
        if (banner.imageUrl) {
            const filePath = path.resolve(banner.imageUrl);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Failed to delete banner image file:", err);
                }
            });
        }

        await Banner.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
        });
    } catch (err) {
        console.error("deleteBanner Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
