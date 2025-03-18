import { spawn } from 'child_process';
import fs from 'fs';

export const predict = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path.replace(/\\/g, '/');
    const pythonProcess = spawn('C:\\Users\\Mohan Rao\\AppData\\Local\\Programs\\Python\\Python313\\python.exe', ['models/model.py', filePath]);

    let output = '';            
    pythonProcess.stdout.on('data', (data) => { output += data.toString(); });

    pythonProcess.stderr.on('data', (data) => console.error(`Error: ${data}`));

    pythonProcess.on('close', (code) => {
        fs.unlinkSync(filePath);
        if (code === 0) res.json({ predictions: JSON.parse(output) });
        else res.status(500).json({ error: 'ML model error' });
    });
};
