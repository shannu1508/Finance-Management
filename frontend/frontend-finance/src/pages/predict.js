import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import styles from '../styles/predict.module.css';

const Predict = () => {
    const chartRef = useRef(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (chartRef.current) {
            const chart = echarts.init(chartRef.current);
            const option = {
                animation: false,
                title: { text: 'Prediction Distribution' },
                tooltip: { trigger: 'axis' },
                legend: { data: ['Actual', 'Predicted'] },
                xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                yAxis: { type: 'value' },
                series: [
                    { name: 'Actual', type: 'line', data: [820, 932, 901, 934, 1290, 1330, 1320] },
                    { name: 'Predicted', type: 'line', data: [820, 932, 901, 934, 1290, 1330, 1320] }
                ]
            };
            chart.setOption(option);
            window.addEventListener('resize', () => chart.resize());
        }
    }, []);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <img className={styles.logo} src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" alt="Logo" />
                    <h1 className={styles.title}>Predictive Analytics Dashboard</h1>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.uploadSection}>
                    <h2>Upload Your CSV File</h2>
                    <p>Drag and drop your file here, or click to browse</p>
                    <label className={styles.uploadBox}>
                        <input type="file" id="fileInput" accept=".csv" onChange={handleFileChange} hidden />
                        <i className="fas fa-cloud-upload-alt"></i>
                        <button className={styles.uploadButton}>Browse Files</button>
                        <p className={styles.fileInfo}>{file ? file.name : 'Supported format: CSV (max 10MB)'}</p>
                    </label>
                </div>

                <div className={styles.tableSection}>
                    <h3>File Preview</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Feature 1</th>
                                <th>Feature 2</th>
                                <th>Feature 3</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Value A</td>
                                <td>Value B</td>
                                <td>Value C</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Value D</td>
                                <td>Value E</td>
                                <td>Value F</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className={styles.chartSection}>
                    <h3>Prediction Results</h3>
                    <div ref={chartRef} className={styles.chart}></div>
                </div>
            </main>
        </div>
    );
};

export default Predict;
