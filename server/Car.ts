import mongoose = require("mongoose");

// Car interface
// A car has a licence plate and a timestamp_in
export interface Car extends mongoose.Document {
    plate: string;
    timestamp_in: Date;
    timestamp_out: Date;
    timestamp_payment: Date;
    amountToPay: number;

    getAmountToPay: () => number;
    makePayment: () => boolean;
}

// JSON schema to check if the supplied parameter is compatible
export function isCar(arg: any): arg is Car {
    return (
        arg &&
        arg.plate &&
        typeof arg.plate == "string" &&
        arg.timestamp_in &&
        arg.timestamp_in instanceof Date
    );
}

// Mongoose Schema
var carSchema = new mongoose.Schema({
    plate: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    timestamp_in: {
        type: mongoose.SchemaTypes.Date,
        required: true
    },
    timestamp_out: {
        type: mongoose.SchemaTypes.Date,
        required: false
    },
    timestamp_payment: {
        type: mongoose.SchemaTypes.Date,
        required: false
    },
    amountToPay: {
        type: mongoose.SchemaTypes.Number,
        required: false
    }
});

// Methods for car
carSchema.methods.makePayment = function() {
    if (this.getAmountToPay() != 0) {
        this.timestamp_payment = new Date();
        return true;
    } else {
        return false;
    }
};

carSchema.methods.getAmountToPay = function() {
    // For simulation purposes we make time to exit 10 seconds and charge every 10 seconds
    const unitPrice = 0.5;
    const timeToExit = 10;

    if (this.timestamp_out) {
        return 0;
    }

    if (!this.timestamp_payment) {
        // payment has not made
        var difference = new Date().getTime() - this.timestamp_in.getTime();
        difference = Math.round(difference / 1000) - timeToExit;

        // first 10 seconds are free
        if (difference > 0) {
            return (Math.ceil(difference / 10) * unitPrice).toFixed(2);
        } else {
            return 0;
        }
    } else {
        // payment has made
        var difference =
            new Date().getTime() - this.timestamp_payment.getTime();
        difference = Math.round(difference / 1000) - timeToExit;

        if (difference > 0) {
            // time to exit elapsed
            return (Math.ceil(difference / 10) * unitPrice).toFixed(2);
        } else {
            // time to exit not elapsed
            return 0;
        }
    }
};

export function getSchema() {
    return carSchema;
}

// Mongoose Model
var carModel;
export function getModel(): mongoose.Model<Car> {
    if (!carModel) {
        carModel = mongoose.model("Car", getSchema());
    }
    return carModel;
}
