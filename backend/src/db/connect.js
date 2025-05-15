"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.MONGODB_URI;
const connectDB = async () => {
    mongoose_1.default
        .connect(connectionString)
        .then(() => {
        console.log("CONNECTED TO THE DB.....");
    })
        .catch((err) => console.log("no connection to database", err));
};
exports.connectDB = connectDB;
