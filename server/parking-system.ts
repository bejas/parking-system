/**
 * HTTP REST server + MongoDB (Mongoose) + Express
 *
 * Endpoints        Attributes          Method          Description
 *
 *   /                -                 GET             Returns the version and a list of available endpoints
 *
 *   /cars          ?plate=             GET             Returns all the cars, optionally filtered by plate number
 *                  ?skip=n
 *                  ?limit=m
 *                  ?inside=true
 *   /cars            -                 POST            Inserts a new car in the parking garage
 *   /cars/:plate     -                 PATCH           Remove a car from the parking garage
 *   /cars/:id     -                    DELETE          Delete a car from all history by id
 *
 *   /payment/:plate  -                 GET             Get payment information about a specified car.
 *   /payment/:plate  -                 POST            Send payment for the specified car.
 *
 *   /users           -                 GET             List all users
 *   /users/:username -                 GET             Get user info by username
 *   /users           -                 POST            Add a new user
 *   /users/:username -                 DELETE          Delete a user
 *
 *   /login           -                 POST            Login an existing user, returning a JWT
 *
 *   /renew           -                 GET             Renew JWT
 *
 **/
//

// The dotenv module will load a file named ".env"
const result = require("dotenv").config();

// Dotenv error handler
if (result.error) {
    console.log(
        'Unable to load ".env" file. Please provide one to store the JWT secret key'
    );
    process.exit(-1);
}
if (!process.env.JWT_SECRET) {
    console.log(
        '".env" file loaded but JWT_SECRET=<secret> key-value pair was not found'
    );
    process.exit(-1);
}

import fs = require("fs");
import http = require("http"); // HTTP module
import https = require("https"); // HTTPS module
import colors = require("colors");
colors.enabled = true;

import mongoose = require("mongoose");
import { Car } from "./Car";
import * as car from "./Car";

import { User } from "./User";
import * as user from "./User";

import express = require("express");
import bodyparser = require("body-parser");
// body-parser middleware is used to parse the request body and
// directly provide a Javascript object if the "Content-type" is
// application/json

import passport = require("passport"); // authentication middleware for express
import passportHTTP = require("passport-http"); // implements Basic and Digest authentication for HTTP (used for /login endpoint)

import jsonwebtoken = require("jsonwebtoken"); // JWT generation
import jwt = require("express-jwt"); // JWT parsing middleware for express

import cors = require("cors");
import io = require("socket.io");

var ios = undefined;

var app = express();

// We create the JWT authentication middleware
// provided by the express-jwt library.
//
// How it works (from the official documentation):
// If the token is valid, req.user will be set with the JSON object
// decoded to be used by later middleware for authorization and access control.
var auth = jwt({ secret: process.env.JWT_SECRET });

app.use(cors());

// Install the top-level middleware "bodyparser"
app.use(bodyparser.json());

// Add API routes to express application
app.get("/", (req, res) => {
    // ios.emit("broadcast", "get root");
    res.status(200).json({
        api_version: "1.0",
        endpoints: ["/cars", "/users", "/login", "/payment"]
    });
});

app.route("/cars")
    .get(auth, (req, res, next) => {
        var filter = {};
        if (req.query.plate) {
            filter["plate"] = req.query.plate;
        }
        if (req.query.inside == "true") {
            filter["timestamp_out"] = "";
        }
        console.log("Using filter: " + JSON.stringify(filter));

        req.query.skip = parseInt(req.query.skip || "0") || 0;
        req.query.limit = parseInt(req.query.limit || "0") || 0;

        car.getModel()
            .find(filter)
            .sort({ timestamp_in: -1 })
            .skip(req.query.skip)
            .limit(req.query.limit)
            .then(documents => {
                documents.forEach(function(element) {
                    element.amountToPay = element.getAmountToPay();
                });
                return res.status(200).json(documents);
            })
            .catch(reason => {
                return next({
                    statusCode: 404,
                    error: true,
                    errorMessage: "DB error: " + reason
                });
            });
    })
    .post(auth, (req, res, next) => {
        console.log("Trying to insert: " + JSON.stringify(req.body));

        var insertedCar = req.body;
        insertedCar.timestamp_in = new Date();

        if (car.isCar(insertedCar)) {
            // Check if car is already inside the parking lot.
            car.getModel()
                .find({ plate: insertedCar.plate })
                .sort({ timestamp_in: -1 })
                .limit(1)
                .then(objFound => {
                    var firstCar = objFound.shift();
                    if (firstCar && !firstCar.timestamp_out) {
                        return next({
                            statusCode: 409,
                            error: true,
                            errorMessage: "Car already inside the parking lot."
                        });
                    } else {
                        car.getModel()
                            .create(insertedCar)
                            .then(data => {
                                console.log(
                                    "Inserted: " + JSON.stringify(req.body)
                                );
                                ios.emit("broadcast", {
                                    message:
                                        insertedCar.plate +
                                        " Entered the parking.",
                                    status: "notice"
                                });
                                return res.status(200).json({
                                    error: false,
                                    errorMessage: "",
                                    id: data._id
                                });
                            })
                            .catch(reason => {
                                return next({
                                    statusCode: 404,
                                    error: true,
                                    errorMessage: "DB error: " + reason
                                });
                            });
                    }
                })
                .catch(reason => {
                    return next({
                        statusCode: 404,
                        error: true,
                        errorMessage: "DB error: " + reason
                    });
                });
        } else {
            return next({
                statusCode: 400,
                error: true,
                errorMessage: "Data provided is not a valid Car."
            });
        }
    });

app.patch("/cars/:plate", auth, (req, res, next) => {
    // Check moderator role
    if (!user.newUser(req.user).hasModeratorRole()) {
        return next({
            statusCode: 401,
            error: true,
            errorMessage: "Unauthorized: User is not a Moderator."
        });
    }

    car.getModel()
        .find({ plate: req.params.plate })
        .sort({ timestamp_in: -1 })
        .limit(1)
        .then(objFound => {
            var firstCar = objFound.shift();

            if (firstCar.getAmountToPay() == 0) {
                firstCar.timestamp_out = new Date();
                firstCar.save();
                ios.emit("broadcast", {
                    message: firstCar.plate + " Is exiting now.",
                    status: "notice"
                });
                res.status(200).json({
                    error: false,
                    errorMessage: ""
                });
            } else {
                ios.emit("broadcast", {
                    message: firstCar.plate + " Tried to exit without paying.",
                    status: "error"
                });
                res.status(402).json({
                    error: true,
                    errorMessage: "Payment is required before exiting."
                });
            }
        })
        .catch(reason => {
            res.status(404).json({
                statusCode: 404,
                error: true,
                errorMessage: "DB error: " + reason
            });
        });
});

app.delete("/cars/:id", auth, (req, res, next) => {
    // Check moderator role
    if (!user.newUser(req.user).hasModeratorRole()) {
        return next({
            statusCode: 401,
            error: true,
            errorMessage: "Unauthorized: User is not a Moderator."
        });
    }

    car.getModel()
        .deleteOne({ _id: req.params.id })
        .then(() => {
            return res.status(200).json({ error: false, errorMessage: "" });
        })
        .catch(reason => {
            return next({
                statusCode: 404,
                error: true,
                errorMessage: "DB error: " + reason
            });
        });
});
//

app.get("/payment/:plate", (req, res, next) => {
    console.log(
        "GET Payment for plate number: " + JSON.stringify(req.params.plate)
    );
    car.getModel()
        .find({ plate: req.params.plate })
        .sort({ timestamp_in: -1 })
        .limit(1)
        .then(objFound => {
            var firstCar = objFound.shift();
            firstCar.amountToPay = firstCar.getAmountToPay();
            console.log("Found: " + JSON.stringify(firstCar));
            return res.status(200).json(firstCar);
        })
        .catch(reason => {
            return next({
                statusCode: 404,
                error: true,
                errorMessage: "DB error: " + reason
            });
        });
});

app.post("/payment/:plate", (req, res, next) => {
    console.log(
        "POST Payment for plate number: " + JSON.stringify(req.params.plate)
    );
    car.getModel()
        .find({ plate: req.params.plate })
        .sort({ timestamp_in: -1 })
        .limit(1)
        .then(objFound => {
            var firstCar = objFound.shift();
            var result = firstCar.makePayment();

            if (result) {
                firstCar.save();
                ios.emit("broadcast", {
                    message: firstCar.plate + " Completed payment.",
                    status: "normal"
                });
                return res.status(200).json({
                    error: false,
                    errorMessage: ""
                });
            } else {
                return next({
                    statusCode: 409,
                    error: true,
                    errorMessage: "Payment already done."
                });
            }
        })
        .catch(reason => {
            res.status(404).json({
                statusCode: 404,
                error: true,
                errorMessage: "DB error: " + reason
            });
        });
});

app.get("/users", auth, (req, res, next) => {
    user.getModel()
        .find({}, { digest: 0, salt: 0 })
        .then(users => {
            return res.status(200).json(users);
        })
        .catch(reason => {
            return next({
                statusCode: 404,
                error: true,
                errorMessage: "DB error: " + reason
            });
        });
});

app.get("/users/:username", auth, (req, res, next) => {
    user.getModel()
        .findOne({ username: req.params.username }, { digest: 0, salt: 0 })
        .then(user => {
            return res.status(200).json(user);
        })
        .catch(reason => {
            return next({
                statusCode: 404,
                error: true,
                errorMessage: "DB error: " + reason
            });
        });
});

app.post("/users", auth, (req, res, next) => {
    // Check admin role
    if (!user.newUser(req.user).hasAdminRole()) {
        return next({
            statusCode: 401,
            error: true,
            errorMessage: "Unauthorized: User is not an Admininstrator."
        });
    }

    var u = user.newUser(req.body);
    if (!req.body.password) {
        return next({
            statusCode: 400,
            error: true,
            errorMessage: "Password field is missing."
        });
    }
    u.setPassword(req.body.password);

    u.save()
        .then(data => {
            return res.status(200).json({
                error: false,
                errorMessage: "",
                id: data._id
            });
        })
        .catch(reason => {
            return next({
                statusCode: 404,
                error: true,
                errorMessage: "DB error: " + reason
            });
        });
});

app.delete("/users/:username", auth, (req, res, next) => {
    // Check admin role
    if (!user.newUser(req.user).hasAdminRole()) {
        return next({
            statusCode: 401,
            error: true,
            errorMessage: "Unauthorized: User is not an Admininstrator."
        });
    }

    // Prevent deleting admin user
    if (req.params.username == "admin") {
        return next({
            statusCode: 403,
            error: true,
            errorMessage: "Admin user cannot be deleted."
        });
    }

    user.getModel()
        .deleteOne({ username: req.params.username })
        .then(() => {
            return res.status(200).json({
                error: false,
                errorMessage: ""
            });
        })
        .catch(reason => {
            return next({
                statusCode: 404,
                error: true,
                errorMessage: "DB error " + reason
            });
        });
});

app.get("/renew", auth, (req, res, next) => {
    var tokendata = req.user;
    delete tokendata.iat;
    delete tokendata.exp;
    console.log("Renewing token for user " + JSON.stringify(tokendata));
    var token_signed = jsonwebtoken.sign(tokendata, process.env.JWT_SECRET, {
        expiresIn: "10m"
    });
    return res.status(200).json({
        error: false,
        errorMessage: "",
        token: token_signed
    });
});

// Configure HTTP basic authentication strategy
// trough passport middleware.

passport.use(
    new passportHTTP.BasicStrategy(function(username, password, done) {
        // Delegate function we provide to passport middleware
        // to verify user credentials

        console.log("New login attempt from ".green + username);
        user.getModel().findOne({ mail: username }, (err, user) => {
            if (err) {
                return done({
                    statusCode: 500,
                    error: true,
                    errorMessage: err
                });
            }
            if (!user) {
                return done({
                    statusCode: 500,
                    error: true,
                    errorMessage: "Invalid user"
                });
            }
            if (user.validatePassword(password)) {
                return done(null, user);
            }
            return done({
                statusCode: 500,
                error: true,
                errorMessage: "Invalid password"
            });
        });
    })
);

// Login endpoint uses passport middleware to check
// user credentials before generating a new JWT
app.get(
    "/login",
    passport.authenticate("basic", { session: false }),
    (req, res, next) => {
        // If we reach this point, the user is successfully authenticated and
        // has been injected into req.user

        // We now generate a JWT with the useful user data
        // and return it as response

        var tokendata = {
            username: req.user.username,
            roles: req.user.roles,
            mail: req.user.mail,
            id: req.user.id
        };

        console.log("Login granted. Generating token");
        var token_signed = jsonwebtoken.sign(
            tokendata,
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );

        return res.status(200).json({
            error: false,
            errorMessage: "",
            token: token_signed
        });
    }
);

// Error handling middleware
app.use(function(err, req, res, next) {
    console.log("Request error: ".red + JSON.stringify(err));
    res.status(err.statusCode || 500).json(err);
});

app.use((req, res, next) => {
    res.status(404).json({
        statusCode: 404,
        error: true,
        errorMessage: "Invalid endpoint"
    });
});

mongoose.connect("mongodb://localhost:27017/parking-system").then(
    function onconnected() {
        console.log("Connected to MongoDB");

        // Create admin user if not exists
        user.getModel()
            .count({})
            .then(count => {
                if (count == 0) {
                    var u = user.newUser({
                        username: "admin",
                        mail: "admin@parking-system.it"
                    });
                    u.setAdmin();
                    u.setModerator();
                    u.setPassword("admin");
                    u.save()
                        .then(() => {
                            console.log("Admin user created");
                        })
                        .catch(err => {
                            console.log("Unable to create admin user: " + err);
                        });
                }
            });

        // Add mock car
        car.getModel()
            .count({})
            .then(count => {
                if (count == 0) {
                    var c = { plate: "ABC1234", timestamp_in: new Date() };

                    car.getModel()
                        .create(c)
                        .then(data => {
                            console.log("Inserted Car: " + c);
                        });
                }
            });

        // https
        //     .createServer(
        //         {
        //             key: fs.readFileSync("keys/key.pem"),
        //             cert: fs.readFileSync("keys/cert.pem")
        //         },
        //         app
        //     )
        //     .listen(8443);

        let server = http.createServer(app);
        ios = io(server);
        ios.on("connection", function(client) {
            console.log("Socket.io client connected.".green);

            client.on("disconnect", function() {
                console.log("Socket.io client disconnected.".yellow);
            });
            // client.on("getCar", function(m) {
            //     console.log("SOCKET SERVER GETCAR");
            //     console.log(m);
            //     ios.emit("broadcast", "message from server");
            // });
        });

        server.listen(8080, () =>
            console.log("HTTP Server started on port 8080")
        );
    },
    function onrejected() {
        console.log("Unable to connect to MongoDB");
        process.exit(-2);
    }
);
