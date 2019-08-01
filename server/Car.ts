import mongoose = require("mongoose");

// Car interface
// A car has a licence plate and a timestamp
export interface Car extends mongoose.Document {
    plate: string[];
    timestamp_in: Date;
    timestamp_out: Date;
    timestamp_payment: Date;
    amountToPay: number;

    getAmountToPay: () => void;
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
        required: true,
        unique: true
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
    if (!this.timestamp_payment) {
        this.timestamp_payment = new Date();
        console.log(new Date());
        return true;
    } else {
        return false;
    }
};

carSchema.methods.getAmountToPay = function() {
    // Price for every minute.
    const unitPrice = 1;

    if (!this.timestamp_payment) {
        var difference = this.timestamp_in.getTime() - new Date().getTime();
        var differenceMinutes = Math.abs(Math.round(difference / 1000 / 60));
        this.amountToPay = differenceMinutes * unitPrice;
    } else {
        var difference =
            this.timestamp_payment.getTime() - new Date().getTime();
        var differenceMinutes = Math.abs(Math.round(difference / 1000 / 60));

        if (differenceMinutes > 10) {
            this.amountToPay = differenceMinutes * unitPrice;
        } else {
            this.amountToPay = 0;
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
