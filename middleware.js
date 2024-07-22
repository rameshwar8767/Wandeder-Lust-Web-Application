
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Redirect
        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
};

module.exports= isLoggedIn;

