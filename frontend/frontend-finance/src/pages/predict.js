import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../styles/predict.module.css';
import { uploadFile, fetchFromDatabase } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Link , useNavigate } from 'react-router-dom';
const Predict = () => {
    const COLORS = ['#FF8042', '#8884d8', '#00C49F', '#FFBB28', '#FF4560',
        '#7D3C98', '#D35400', '#1ABC9C', '#3498DB', '#2ECC71'];
    const [file, setFile] = useState(null);
    const [source, setSource] = useState('csv');
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    const chartData = predictions
        ? Object.entries(predictions).map(([name, value]) => ({ name, value }))
        : [];

    const handleFileChange = (event) => setFile(event.target.files[0]);
    const fetchWithAuth = async (url, options = {}) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (response.status === 401) {
            await logout();
            navigate('/login');
            throw new Error('Session expired');
        }

        return response;
    };

    const handlePrediction = async () => {
        if (source === 'csv' && !file) return alert('Please select a file');
    
        setLoading(true);
        setPredictions(null);
    
        try {
            let result;
            if (source === 'csv') {
                result = await uploadFile(file);
            } else {
                result = await fetchFromDatabase();
            }
    
            console.log("Raw API Response:", result); // Debugging
    
            if (result?.predictions?.predictions) {
                setPredictions(result.predictions.predictions); // Fixing the nested object
            } else {
                alert('Error retrieving predictions from database.');
                console.error('API response error:', result);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
            alert('Error fetching predictions.');
        } finally {
            setLoading(false);
        }
    };
    
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className={styles.container}>
            <nav>
                <div className="navbar">
                    <a href="/" className="logo">
                        Personal Finance Manager
                    </a>
                    <ul className="nav-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/track">Track</a></li>
                        <li><a href="/dashboard">Dashboard</a></li>
                        <li>
                            <a
                                role="button"
                                onClick={() => {
                                    logout();
                                    window.location.href = '/login';
                                }}
                                className="logout-btn"
                            >
                                Logout
                            </a>
                        </li>
                    </ul>
                    <div className="menu-toggle">
                        <i className="fas fa-bars"></i>
                    </div>
                </div>
            </nav>
            <h2 className={styles.heading}>Upload Your CSV File</h2>
            <div className={styles.uploadSection}>
                <div className={styles.optionSection}>
                    <label>
                        <input type="radio" value="csv" checked={source === 'csv'} onChange={() => setSource('csv')} /> Upload CSV
                    </label>
                    <label>
                        <input type="radio" value="database" checked={source === 'database'} onChange={() => setSource('database')} /> Fetch from Database
                    </label>
                </div>

                <input type="file" accept=".csv" onChange={handleFileChange} className={styles.fileInput} />
                <button onClick={handlePrediction} className={styles.uploadButton} disabled={loading}>
                    {loading ? 'Processing...' : 'Predict'}
                </button>
            </div>

            {predictions && (
                <div className={styles.resultsSection}>
                    <h3 className={styles.resultsTitle}>Prediction Results</h3>

                    <div className={styles.resultsContainer}>
                        <div className={styles.textResultsContainer}>
                            <div className={styles.textResults}>
                                <ul className={styles.resultsList}>
                                    {chartData.map(({ name, value }) => (
                                        <li key={name} className={styles.resultItem}>
                                            <strong>{name}:</strong> ₹{value.toLocaleString()}
                                        </li>
                                    ))}
                                    <li className={styles.total}><strong>Total:</strong> ₹{total.toLocaleString()}</li>
                                </ul>
                            </div>
                        </div>
                        <div className={styles.chartContainer} style={{width: '400px', height: '400px'}}>
    <PieChart width={400} height={400}>
    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} fill="#8884d8" paddingAngle={5} dataKey="value">
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                    <Legend />
    </PieChart>
</div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Predict;