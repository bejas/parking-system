import mongoose = require("mongoose");
import crypto = require("crypto");

// User interface
export interface User extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId;
    username: string;
    mail: string;
    roles: string[];
    salt: string;
    digest: string;

    setPassword: (pwd: string) => void;
    validatePassword: (pwd: string) => boolean;

    hasAdminRole: () => boolean;
    setAdmin: () => void;
    hasModeratorRole: () => boolean;
    setModerator: () => void;
}

// Mongoose user Schema
var userSchema = new mongoose.Schema({
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    mail: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    roles: {
        type: [mongoose.SchemaTypes.String],
        required: true
    },
    salt: {
        type: mongoose.SchemaTypes.String,
        required: false
    },
    digest: {
        type: mongoose.SchemaTypes.String,
        required: false
    }
});

// Methods for the user Schema
userSchema.methods.setPassword = function(pwd: string) {
    // Random 16-bytes hex string for salt
    this.salt = crypto.randomBytes(16).toString("hex");

    // We use the hash function sha512 to hash both the password and salt to
    // obtain a password digest
    var hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    this.digest = hmac.digest("hex");
};

userSchema.methods.validatePassword = function(pwd: string): boolean {
    // To validate the password, we compute the digest with the
    // same HMAC to check if it matches with the digest we stored
    // in the database.
    var hmac = crypto.createHmac("sha512", this.salt);
    hmac.update(pwd);
    var digest = hmac.digest("hex");
    return this.digest === digest;
};

userSchema.methods.hasAdminRole = function(): boolean {
    for (var roleidx in this.roles) {
        if (this.roles[roleidx] === "ADMIN") return true;
    }
    return false;
};

userSchema.methods.setAdmin = function() {
    this.roles.push("ADMIN");
};

userSchema.methods.hasModeratorRole = function(): boolean {
    for (var roleidx in this.roles) {
        if (this.roles[roleidx] === "MODERATOR") return true;
    }
    return false;
};

userSchema.methods.setModerator = function() {
    this.roles.push("MODERATOR");
};

export function getSchema() {
    return userSchema;
}

// Mongoose Model
var userModel; // This is not exposed outside the model
export function getModel(): mongoose.Model<User> {
    // Return Model as singleton
    if (!userModel) {
        userModel = mongoose.model("User", getSchema());
    }
    return userModel;
}

export function newUser(data): User {
    var _usermodel = getModel();
    var user = new _usermodel(data);

    return user;
}
