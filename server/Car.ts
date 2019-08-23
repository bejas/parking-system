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
    // Price for every minute.
    const unitPrice = 1.17;
    const minutesToExit = 1;

    if (this.timestamp_out) {
        return 0;
    }

    if (!this.timestamp_payment) {
        // payment has not made
        var difference = this.timestamp_in.getTime() - new Date().getTime();
        var differenceMinutes = Math.abs(Math.round(difference / 1000 / 60));
        return differenceMinutes * unitPrice;
    } else {
        // payment has made
        var difference =
            this.timestamp_payment.getTime() - new Date().getTime();
        var differenceMinutes = Math.abs(Math.round(difference / 1000 / 60));

        if (differenceMinutes > minutesToExit) {
            // 10 minutes elapsed
            return (differenceMinutes - minutesToExit) * unitPrice;
        } else {
            // 10 minutes not elapsed
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