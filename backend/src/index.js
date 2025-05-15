"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connect_1 = require("./db/connect");
const dotenv_1 = require("dotenv");
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const mainRouter = express_1.default.Router();
app.use("/api", mainRouter);
mainRouter.use("/auth", auth_1.default);
mainRouter.use("/dashboard", dashboard_1.default);
const startServer = async () => {
    try {
        await (0, connect_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
    }
};
startServer();
