"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
const connect_1 = require("./db/connect");
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Load SSL cert and key
const privateKey = fs_1.default.readFileSync(path_1.default.join("/etc/ssl/selfsigned/selfsigned.key"), "utf8");
const certificate = fs_1.default.readFileSync(path_1.default.join("/etc/ssl/selfsigned/selfsigned.crt"), "utf8");
const credentials = { key: privateKey, cert: certificate };
// Middlewares
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "https://13.232.226.34", // Use your domain or IP
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routers
const mainRouter = express_1.default.Router();
mainRouter.use("/auth", auth_1.default);
mainRouter.use("/dashboard", dashboard_1.default);
app.use("/api", mainRouter);
// Start HTTPS server
const startServer = async () => {
    try {
        await (0, connect_1.connectDB)();
        const httpsServer = https_1.default.createServer(credentials, app);
        httpsServer.listen(PORT, () => {
            console.log(`✅ HTTPS Server running on https://13.232.226.34:${PORT}`);
        });
    }
    catch (err) {
        console.error("❌ Server failed to start:", err);
    }
};
startServer();
