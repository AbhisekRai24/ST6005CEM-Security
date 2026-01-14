const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createBanner, getAllBanners, deleteBanner } = require("../../controllers/admin/bannercontroller");

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // folder for uploaded images
    },
    filename: (req, file, cb) => {

        cb(null, Date.now() + "_" + file.originalname);
    },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), createBanner);
router.get("/", getAllBanners);
router.delete("/:id", deleteBanner);
module.exports = router;



