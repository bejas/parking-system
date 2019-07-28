import mongoose = require("mongoose");

// Car interface
// A car has a licence plate and a timestamp
export interface Car {
    plate: string[];
    timestamp: Date;
}

// JSON schema to check if the supplied parameter is compatible
export function isCar(arg: any): arg is Car {
    return (
        arg &&
        arg.plate &&
        typeof arg.plate == "string" &&
        arg.timestamp &&
        arg.timestamp instanceof Date
    );
}

// Mongoose Schema
var carSchema = new mongoose.Schema({
    plate: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    timestamp: {
        type: mongoose.SchemaTypes.Date,
        required: true
    }
});

export function getSchema() {
    return carSchema;
}

// Mongoose Model
var carModel;
export function getModel(): mongoose.Model<mongoose.Document> {
    if (!carModel) {
        carModel = mongoose.model("Car", getSchema());
    }
    return carModel;
}
