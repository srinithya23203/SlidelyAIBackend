import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = url.parse(req.url!, true); // Parse URL including query parameters
    const pathname = parsedUrl.pathname;

    if (req.method === 'POST' && pathname === '/submit') {
        handleFormSubmission(req, res);
    } else if (req.method === 'GET' && pathname === '/read') {
        const index = parsedUrl.query.index; // Extract index from query parameters
        readSubmittedData(req, res, index);
    } else if(req.method === 'GET' && pathname === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('True');   
    }else if (req.method === 'DELETE' && pathname === '/delete') {
        const index= parsedUrl.query.index;
        deleteFormSubmission(req, res, index);
    } else if (req.method === 'PUT' && pathname === '/edit') {
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

function handleFormSubmission(req: http.IncomingMessage, res: http.ServerResponse) {
    let body: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
        body.push(chunk);
    }).on('end', () => {
        const data = Buffer.concat(body).toString();
        console.log('Received data:', data);

        // Parse the received data assuming it's JSON format
        let parsedData;
        try {
            parsedData = JSON.parse(data);
        } catch (error) {
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

function saveToJsonFile(data: any) {
    // Read existing data from the file, or initialize with an empty array if file doesn't exist
    let existingData: any[] = [];
    try {
        const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
        existingData = JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }

    // Add new data to the array
    existingData.push(data);

    // Write the updated data back to the file
    fs.writeFile('submitted_data.json', JSON.stringify(existingData, null, 2), (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log('Data saved to JSON file successfully.');
        }
    });
}

function readSubmittedData(req: http.IncomingMessage, res: http.ServerResponse, index: string | string[] | undefined) {
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
            } else {
                const entry = submissions[parsedIndex];
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(entry));
            }
        } else {
            // If no index provided, return all submissions
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(submissions));
        }
    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

function deleteFormSubmission(req: http.IncomingMessage, res:http.ServerResponse,index: string | string[] | undefined){
    try {
        const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
        const submissions = JSON.parse(jsonData);
        const indexString = Array.isArray(index) ? index[0] : index;
        if (indexString !== undefined && indexString !== null) {
            const parsedIndex = parseInt(indexString, 10);
            if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= submissions.length) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid index provided.');
            } else {
                submissions.splice(parsedIndex, 1);
                fs.writeFile('submitted_data.json', JSON.stringify(submissions, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing to JSON file:', err);
                    } else {
                        console.log('Data saved to JSON file successfully.');
                    }
                });
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Deleted data successfully.');
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid index provided.');
        }
    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}

function editFormSubmission(req: http.IncomingMessage , res: http.ServerResponse , index: string|string[]|undefined, updatedData: any) {
    try {
        const jsonData = fs.readFileSync('submitted_data.json', 'utf8');
        const submissions = JSON.parse(jsonData);
        const indexString = Array.isArray(index) ? index[0] : index;
        if (indexString !== undefined && indexString !== null) {
            const parsedIndex = parseInt(indexString, 10);
            if (isNaN(parsedIndex) || parsedIndex < 0 || parsedIndex >= submissions.length) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid index provided.');
            } else {
                submissions[parsedIndex] = updatedData;
                fs.writeFileSync('submitted_data.json', JSON.stringify(submissions, null, 2));
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Edited data successfully.');
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid index provided.');
        }
    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
}