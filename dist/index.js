"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(body_parser_1.default.json());
// Path to JSON database
const dbPath = path_1.default.resolve(__dirname, 'db.json');
// Ensure the JSON file exists
if (!fs_1.default.existsSync(dbPath)) {
    fs_1.default.writeFileSync(dbPath, JSON.stringify([]));
}
// Endpoint to check server status
app.get('/ping', (req, res) => {
    res.send('True');
});
// Endpoint to submit form data
app.post('/submit', (req, res) => {
    const { name, email, phone, github_link, stopwatch_time } = req.body;
    const newSubmission = { name, email, phone, github_link, stopwatch_time };
    const data = JSON.parse(fs_1.default.readFileSync(dbPath, 'utf-8'));
    data.push(newSubmission);
    fs_1.default.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    res.status(200).send('Submission successful');
});
// Endpoint to read form data by index
app.get('/read', (req, res) => {
    const index = parseInt(req.query.index, 10);
    const data = JSON.parse(fs_1.default.readFileSync(dbPath, 'utf-8'));
    if (index >= 0 && index < data.length) {
        res.json(data[index]);
    }
    else {
        res.status(404).send('Submission not found');
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
