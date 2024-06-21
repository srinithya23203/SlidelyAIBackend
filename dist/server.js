"use strict";
// import express from 'express';
// import bodyParser from 'body-parser';
// import jsonfile from 'jsonfile';
// import path from 'path';
// const app = express();
// const PORT = 3000;
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.use(bodyParser.json());
// import * as http from 'http';
// import * as fs from 'fs';
// const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
//     if (req.method === 'POST' && req.url === '/submit') {
//         let body: Buffer[] = [];
//         req.on('data', (chunk: Buffer) => {
//             body.push(chunk);
//         }).on('end', () => {
//             const data = Buffer.concat(body).toString();
//             console.log('Received data:', data);
//             // Parse the received data assuming it's JSON format
//             let parsedData;
//             try {
//                 parsedData = JSON.parse(data);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 res.writeHead(400, { 'Content-Type': 'text/plain' });
//                 res.end('Invalid JSON');
//                 return;
//             }
//             // Save data to a JSON file
//             saveToJsonFile(parsedData);
//             // Respond with a success message
//             res.writeHead(200, { 'Content-Type': 'text/plain' });
//             res.end('Received data successfully.');
//         });
//     } else if (req.method === 'GET' && req.url === '/read') {
//         readSubmittedData(req, res);}
//         else {
//         // Handling other routes or methods if needed
//         res.statusCode = 404;
//         res.end('Not Found');
//     }
// });
// server.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });
// function saveToJsonFile(data: any) {
//     // Read existing data from the file, or initialize with an empty array if file doesn't exist
//     let existingData: any[] = [];
//     try {
//         const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
//         existingData = JSON.parse(jsonData);
//     } catch (error) {
//         console.error('Error reading JSON file:', error);
//     }
//     // Add new data to the array
//     existingData.push(data);
//     // Write the updated data back to the file
//     fs.writeFile('submitted_data.json', JSON.stringify(existingData, null, 2), (err) => {
//         if (err) {
//             console.error('Error writing to JSON file:', err);
//         } else {
//             console.log('Data saved to JSON file successfully.');
//         }
//     });
// }
// function readSubmittedData(req: http.IncomingMessage, res: http.ServerResponse) {
//     // Read data from JSON file
//     try {
//         const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
//         const submissions = JSON.parse(jsonData);
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(submissions));
//     } catch (error) {
//         console.error('Error reading JSON file:', error);
//         res.writeHead(500, { 'Content-Type': 'text/plain' });
//         res.end('Internal Server Error');
//     }
// }
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const fs = __importStar(require("fs"));
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true); // Parse URL including query parameters
    const pathname = parsedUrl.pathname;
    if (req.method === 'POST' && pathname === '/submit') {
        handleFormSubmission(req, res);
    }
    else if (req.method === 'GET' && pathname === '/read') {
        const index = parsedUrl.query.index; // Extract index from query parameters
        readSubmittedData(req, res, index);
    }
    else if (req.method === 'GET' && pathname === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('True');
    }
    else if (req.method === 'DELETE' && pathname === '/delete') {
        const index = parsedUrl.query.index;
        deleteFormSubmission(req, res, index);
    }
    else if (req.method === 'PUT' && pathname === '/edit') {
        const index = parsedUrl.query.index;
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedData = JSON.parse(body);
            editFormSubmission(req, res, index, updatedData);
        });
    }
    else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
function handleFormSubmission(req, res) {
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        const data = Buffer.concat(body).toString();
        console.log('Received data:', data);
        // Parse the received data assuming it's JSON format
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
            return;
        }
        // Save data to a JSON file
        saveToJsonFile(parsedData);
        // Respond with a success message
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Received data successfully.');
    });
}
function saveToJsonFile(data) {
    // Read existing data from the file, or initialize with an empty array if file doesn't exist
    let existingData = [];
    try {
        const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
        existingData = JSON.parse(jsonData);
    }
    catch (error) {
        console.error('Error reading JSON file:', error);
    }
    // Add new data to the array
    existingData.push(data);
    // Write the updated data back to the file
    fs.writeFile('submitted_data.json', JSON.stringify(existingData, null, 2), (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        }
        else {
            console.log('Data saved to JSON file successfully.');
        }
    });
}
function readSubmittedData(req, res, index) {
    // Read data from JSON file
    try {
        const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
        const submissions = JSON.parse(jsonData);
        // Handle index conversion from string | string[] to string
        const indexString = Array.isArray(index) ? index[0] : index;
        // If index is provided, return the entry at that index
        if (indexString !== undefined && indexString !== null) {
            const parsedIndex = parseInt(indexString, 10);
            if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= submissions.length) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid index provided.');
            }
            else {
                const entry = submissions[parsedIndex];
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(entry));
            }
        }
        else {
            // If no index provided, return all submissions
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(submissions));
        }
    }
    catch (error) {
        console.error('Error reading JSON file:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}
function deleteFormSubmission(req, res, index) {
    try {
        const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
        const submissions = JSON.parse(jsonData);
        const indexString = Array.isArray(index) ? index[0] : index;
        if (indexString !== undefined && indexString !== null) {
            const parsedIndex = parseInt(indexString, 10);
            if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= submissions.length) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid index provided.');
            }
            else {
                submissions.splice(parsedIndex, 1);
                fs.writeFile('submitted_data.json', JSON.stringify(submissions, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing to JSON file:', err);
                    }
                    else {
                        console.log('Data saved to JSON file successfully.');
                    }
                });
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Deleted data successfully.');
            }
        }
        else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid index provided.');
        }
    }
    catch (error) {
        console.error('Error reading JSON file:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}
function editFormSubmission(req, res, index, updatedData) {
    try {
        const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
        const submissions = JSON.parse(jsonData);
        const indexString = Array.isArray(index) ? index[0] : index;
        if (indexString !== undefined && indexString !== null) {
            const parsedIndex = parseInt(indexString, 10);
            if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= submissions.length) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid index provided.');
            }
            else {
                submissions[parsedIndex] = updatedData;
                fs.writeFileSync('submitted_data.json', JSON.stringify(submissions, null, 2));
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Edited data successfully.');
            }
        }
        else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid index provided.');
        }
    }
    catch (error) {
        console.error('Error reading JSON file:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}
