import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

export const expenseSchema = new Schema({
    periodStartDate: {
        type: String,
    },
    gracePeriod: {
        type: Number
    },
    directToPayroll: {
        type: String
    },
    emailNotification: {
        type: String
    },
    claimsLimit: {
        type: Number
    },
    emailRemainder: {
        type: String,
    },
    row_stat_cd: {
        type: String
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    currencyConvertion: {
        type: String,
    }
});
