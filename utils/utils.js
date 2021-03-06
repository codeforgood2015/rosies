var utils = {};

/*
    Send a 200 OK with success:true in the request body to the
    response argument provided.
    The caller of this function should return after calling
*/
utils.sendSuccessResponse = function(res, content) {
    res.status(200).json({
        success: true,
        content: content
    }).end();
};

/*
    Send an error code with success:false and error message
    as provided in the arguments to the response argument provided.
    The caller of this function should return after calling
*/
utils.sendErrResponse = function(res, errcode, err) {
    res.status(errcode).json({
        success: false,
        err: err
    }).end();
};

/*
    Prevent Javascript object injection into input fields that should be strings
*/
utils.sanitizeInput = function(text) {
    if (text!= null && typeof text === "object") {
        text = JSON.stringify(text);
        //console.log("stringified something: " + text);
    }
    return text;
};

utils.midnightDate = function(dateObj) {
    var year = dateObj.getFullYear();
    var month = dateObj.getMonth() + 1;
    var date = dateObj.getDate();
    return new Date(year + '-' + month + '-' + date);
};

/*
    checkAdmin(req, res, next): Middleware function that validates that 
        an admin is logged in and has admin type.
*/
utils.checkAdmin = function(req, res, next) {
    if (req.session.name && req.session.type == 'admin') {
        next();
    } else {
        utils.sendErrResponse(res, 401, 'Admin not logged in.');
    }
};

/*
    checkVolunteer(req, res, next): Middleware function that validates that
        either a volunteer or admin is logged in.
*/
utils.checkVolunteer = function(req, res, next) {
    if (req.session.name) {
        next();
    } else {
        utils.sendErrResponse(res, 401, 'Volunteer or Admin not logged in.');
    }
}

module.exports = utils;