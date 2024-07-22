const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});
module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};


const wrapAsync = require('../utils/wrapAsync');

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


module.exports.searchListings = wrapAsync(async (req, res) => {
    const location = req.query.location;
    const filteredListings = await Listing.find({ location: location });
    res.render('listings/searchResults', { allListings: filteredListings, location });
});

module.exports.showListing = async (req,res) =>{
    let {id} = req.params;
   const listing = await Listing.findById(id)
   .populate({path:"reviews",
        populate:{
            path: "author"
        },
   })
   .populate("owner");
   if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
   }
   console.log(listing);
   res.render("listings/show.ejs", {listing});
};



module.exports.createListing = async (req, res) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();

        

    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    // newListing.category = req.body.category;
    newListing.geometry = response.body.features[0].geometry;
    
    let savedListing= await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created Successfully!");
    res.redirect("/listings");
};

module.exports.editListing = async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/w_250/");
    res.render("listings/edit.ejs", {listing,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(404, "send valid data for listing");
    }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if(typeof req.file != "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    
    req.flash("success", "Updated Successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req,res) =>{
    let {id} = req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
};