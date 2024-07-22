

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const isLoggedIn = require("../middleware.js");
const isOwner = require("../isowner.js");
const listingController = require("../controllers/listing.js");
const searchController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const { cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

router.get('/search', isLoggedIn, wrapAsync(async (req, res) => {
    const location = req.query.location;

    const filteredListings = await Listing.find({ location: location });
    res.render('listings/searchResults', { allListings: filteredListings, location });
}));
    


// Fetch listings from the database based on the category
router.get('/category/:category',isLoggedIn, wrapAsync(async (req, res) => {
    const category = req.params.category;
    const filteredListings = await Listing.find({ category });
    res.render('listings', { allListings: filteredListings });
}));


  
// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.get("/category/listings/new", isLoggedIn, listingController.renderNewForm);
router.get("/listings/new", isLoggedIn, listingController.renderNewForm);
router.get('/listings/search', isLoggedIn, searchController.searchListings);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.deleteListing)
    );

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;
