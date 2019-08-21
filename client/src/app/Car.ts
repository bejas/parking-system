// Car interface
// A car has a licence plate and a timestamp
export interface Car {
  plate: string[];
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
