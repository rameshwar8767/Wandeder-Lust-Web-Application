const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const saveRedirectUrl = require("../save.js");
const userControllers = require("../controllers/users.js");


router.route("/signup")
.get(userControllers.renderSignupForm)
.post(wrapAsync(userControllers.signup));



//login
router.route("/login")
.get(userControllers.renderLoginForm)
.post(saveRedirectUrl,
    passport.authenticate("local", 
        {failureRedirect: "/login", 
        failureFlash:true,
    }), 
    
    userControllers.login
);




//logOut
router.get("/logout", userControllers.logout);

module.exports = router;
