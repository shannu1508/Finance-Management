import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import Expense from '../models/Expense.js';
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
        else res.status(500).json({ error: 'ML model error' });
    });
};
export const fetchFromDatabase = async () => {
    try {
        const response = await fetch('http://localhost:5000/predict/database', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.predictions) throw new Error('No expense data found in database');

        return data;
    } catch (error) {
        console.error('Error fetching data from database:', error);
        return { predictions: [] }; // Return an empty object to prevent crashes
    }
};
