"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RefreshTokenSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    token: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: "7d" },
});
exports.RefreshToken = mongoose_1.default.model("RefreshToken", RefreshTokenSchema);
