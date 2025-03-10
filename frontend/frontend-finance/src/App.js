import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Track from './pages/Track';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './styles/style.css';
import About from './pages/About';
import PriceDrop from './pages/Price-drop';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
// import 'antd/dist/antd.css';
import 'antd/dist/reset.css';
import Transactions from './pages/Transactions';
import Predict from './pages/predict';

// Add these to your index.html or install via npm
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'feather-icons/dist/feather.min.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState('$');

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/track" 
            element={
              <ProtectedRoute>
                <Track 
                  transactions={transactions} 
                  setTransactions={setTransactions}
                  currency={currency}
                  setCurrency={setCurrency}
                />
              </ProtectedRoute>
            } 
          />
          <Route path="/dashboard" element={<Dashboard 
            transactions={transactions} 
            currency={currency} 
          />} />
          <Route path="/about" element={<About />} />
          <Route path='/transcations' element={<Transactions />} />
          <Route path='/predict' element={<Predict />} />
          {/* Add more routes as needed */}
          {/* <Route path="/signup" element={<Signup />} /> */}
          {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
          {/* <Route path="/privacy" element={<Privacy />} /> */}
          {/* <Route path="/terms" element={<Terms />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
