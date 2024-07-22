const Listing = require("./models/listing.js");

const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing =await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports = isOwner;
