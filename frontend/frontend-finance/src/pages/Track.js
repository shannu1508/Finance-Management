import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Track.css';
import boardImage from '../assets/board.jpg'; // Import the image

const Track = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goals, setGoals] = useState({
    Salary: 0,
    Utilities: 0,
    Groceries: 0,
    Transportation: 0,
    Housing: 0,
    'Food & Dinning': 0,
    Shopping: 0,
    Education: 0,
    Entertainment: 0,
    Health: 0,
    Others: 0
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const descriptionRef = useRef(null);
  const amountRef = useRef(null);
  const typeRef = useRef(null);
  const dateRef = useRef(null);

  // Updated formatCurrency function with null check
  const formatCurrency = (amount, currencyCode) => {
    if (amount === undefined || amount === null) {
      return `${currencySymbols[currencyCode] || ""}0.00`;
    }
    const currencySymbols = {
      USD: "$",
      EUR: "€",
      INR: "₹",
    };
    const symbol = currencySymbols[currencyCode] || "";
    return `${symbol}${Number(amount).toFixed(2)}`;
  };

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  // Updated calculateBalance function
  const calculateBalance = (transactions) => {
    if (!Array.isArray(transactions)) return 0;
    
    return transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount) || 0;
      return transaction.type === 'income' ? acc + amount : acc - amount;
    }, 0);
  };

  // Validate inputs
  const validateInputs = () => {
    const errors = {};
    
    if (!descriptionRef.current.value || descriptionRef.current.value === "Select type of expense") {
      errors.description = "Please select a type of expense";
    }

    if (!amountRef.current.value) {
      errors.amount = "Please enter an amount";
    } else if (isNaN(amountRef.current.value) || parseFloat(amountRef.current.value) <= 0) {
      errors.amount = "Please enter a valid positive amount";
    }

    if (!typeRef.current.value || typeRef.current.value === "Select income or expense") {
      errors.type = "Please select income or expense";
    }

    if (!dateRef.current.value) {
      errors.date = "Please select a transaction date";
    } else {
      const selectedDate = new Date(dateRef.current.value);
      const today = new Date();
      if (selectedDate > today) {
        errors.date = "Transaction date cannot be in the future";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update the fetchWithAuth function
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
      logout();
      navigate('/login');
      throw new Error('Session expired');
    }

    return response;
  };

  // Updated useEffect for initial data loading
  useEffect(() => {
    const fetchTransactionsAndBalance = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:5000/api/transactions');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setTransactions(data);
            // Calculate initial balance from transactions
            const calculatedBalance = calculateBalance(data);
            setBalance(calculatedBalance);
          } else {
            console.error('Unexpected response format:', data);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Error loading transactions. Please try again.');
      }
    };

    fetchTransactionsAndBalance();
  }, []);

  // Add this useEffect to fetch goals when component mounts
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetchWithAuth('http://localhost:5000/api/goals');
        if (response.ok) {
          const goalsData = await response.json();
          if (Array.isArray(goalsData) && goalsData.length > 0) {
            const formattedGoals = goalsData.reduce((acc, goal) => {
              acc[goal.description] = goal.amount;
              return acc;
            }, {});
            setGoals(prev => ({
              ...prev,
              ...formattedGoals
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchGoals();
  }, []);

  // Updated addTransaction function
  const addTransaction = async () => {
    if (!validateInputs()) {
      return;
    }

    const submitButton = document.querySelector('button');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Adding...';

    const description = descriptionRef.current.value;
    const amount = parseFloat(amountRef.current.value);
    const type = typeRef.current.value;
    const chosenDate = new Date(dateRef.current.value);

    if (isNaN(amount)) {
      setValidationErrors(prev => ({
        ...prev,
        amount: "Please enter a valid number"
      }));
      return;
    }

    const newTransaction = {
      primeId: chosenDate.getTime(),
      description,
      amount,
      type,
      currency,
      date: chosenDate
    };

    try {
      const response = await fetchWithAuth('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction)
      });

      if (response.ok) {
        const savedTransaction = await response.json();
        setTransactions(prev => [savedTransaction, ...prev]);
        setBalance(prev => prev + (type === 'income' ? amount : -amount));
        clearForm();
        setValidationErrors({});
        
        // Show success notification
        setNotification({
          show: true,
          message: 'Transaction added successfully!',
          type: 'success'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Failed to save transaction: ${errorData.message}`);
      }
    } catch (error) {
      // Show error notification
      setNotification({
        show: true,
        message: 'Error saving transaction. Please try again.',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  };

  // Update delete transaction
  const deleteTransaction = async (primeId) => {
    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/transactions/${primeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        const updatedTransactions = transactions.filter(t => t.primeId !== primeId);
        setTransactions(updatedTransactions);
        setBalance(data.currentBalance);
        localStorage.setItem('currentBalance', data.currentBalance);
      } else {
        alert('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error deleting transaction');
    }
  };

  // Edit transaction
  const editTransaction = (primeId) => {
    const transaction = transactions.find(t => t.primeId === primeId);
    if (transaction) {
      setEditedTransaction(transaction);
      descriptionRef.current.value = transaction.description;
      amountRef.current.value = transaction.amount;
      typeRef.current.value = transaction.type;
      dateRef.current.value = new Date(transaction.primeId).toISOString().split('T')[0];
      setValidationErrors({});
    }
  };

  // Update save transaction
  const saveTransaction = async () => {
    if (!editedTransaction) return;
    
    if (!validateInputs()) {
      return;
    }

    const updatedTransaction = {
      ...editedTransaction,
      description: descriptionRef.current.value,
      amount: parseFloat(amountRef.current.value),
      type: typeRef.current.value,
      primeId: new Date(dateRef.current.value).getTime(),
      currency: editedTransaction.currency
    };

    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/transactions/${editedTransaction.primeId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTransaction)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedTransactions = transactions.map(t => 
          t.primeId === editedTransaction.primeId ? data.transaction : t
        );
        setTransactions(updatedTransactions);
        setBalance(data.currentBalance);
        localStorage.setItem('currentBalance', data.currentBalance);
        setEditedTransaction(null);
        clearForm();
        setValidationErrors({});
      } else {
        alert('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction');
    }
  };

  // Clear form
  const clearForm = () => {
    descriptionRef.current.value = "";
    amountRef.current.value = "";
    dateRef.current.value = "";
    typeRef.current.value = "";
    setValidationErrors({});
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  // Export functions
  const handleDownload = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    // Filter transactions based on date range
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.primeId);
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    });

    if (filtered.length === 0) {
      alert('No transactions found for the selected date range');
      return;
    }

    setFilteredTransactions(filtered);
    setShowFiltered(true);

    const format = window.prompt("Select export format: PDF or CSV").toLowerCase();
    const fileName = window.prompt("Enter file name to download") || "transactions";

    if (format === "pdf") {
      try {
        const pdfMake = await import('pdfmake/build/pdfmake');
        const pdfFonts = await import('pdfmake/build/vfs_fonts');
        pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs;
        
        const docDefinition = {
          content: [{
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto'],
              body: [
                ['Date', 'Description', 'Amount', 'Type'],
                ...filtered.map(t => [
                  formatDate(t.primeId),
                  t.description,
                  formatCurrency(t.amount, t.currency || currency),
                  t.type
                ])
              ]
            }
          }]
        };
        pdfMake.default.createPdf(docDefinition).download(`${fileName}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      }
    } else if (format === "csv") {
      exportToCSV(filtered, fileName);
    } else {
      alert('Invalid export format. Please enter either "PDF" or "CSV".');
    }
  };

  const exportToCSV = (filtered, fileName) => {
    const csvContent = 
      "Date,Description,Amount,Type\n" +
      filtered.map(t => 
        `${formatDate(t.primeId)},${t.description},${formatCurrency(t.amount, t.currency || currency)},${t.type}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  // Update the saveGoals function to properly handle the request
  const saveGoals = async () => {
    try {
      // Filter out any goals with 0 or empty values
      const validGoals = Object.fromEntries(
        Object.entries(goals).filter(([_, value]) => value > 0)
      );

      const response = await fetchWithAuth('http://localhost:5000/api/goals', {
        method: 'POST',
        body: JSON.stringify({ goals: validGoals })
      });

      if (response.ok) {
        const savedGoals = await response.json();
        console.log('Saved goals:', savedGoals); // Debug log
        alert('Goals saved successfully!');
        setShowGoalModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save goals');
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      alert('Error saving goals: ' + error.message);
    }
  };

  // Update the handleGoalUpdate function to properly handle number conversion
  const handleGoalUpdate = (category, value) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setGoals(prev => ({
      ...prev,
      [category]: numValue
    }));
  };

  return (
    <>
      <nav>
        <div className="navbar">
          <a href="#" className="logo">
            Personal Finance Manager
          </a>
          <ul className="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a role="button" onClick={logout} className="logout-btn">Logout</a></li>
          </ul>
          <div className="menu-toggle">
            <i className="fas fa-bars"></i>
          </div>
        </div>
      </nav>
      {/* <nav>
        <div className="navbar">
          <Link to="/" className="logo">
            <i className="fas fa-chart-line"></i>Personal Finance Manager
          </Link>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/About">About</Link></li>
            <li><Link to="/support">Support</Link></li>
            <li><Link to="/dashboard"> Dashboard</Link></li>
          </ul>
          <div className="buttons">
            <button onClick={logout} className="btn-head">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav> */}

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <section className="main-content" id="tracker">
        <div className="head-text">
          <h1>Access Your Personal Finance Manager</h1>
          <div className="under-head-text"></div>
        </div>
        <br />

        <div className="tracker-container">
          <div className="image-container">
            <img src={boardImage} alt="Finance Illustration" />
            <button 
              className="set-goal-btn modern-button"
              onClick={() => setShowGoalModal(true)}
            >
              <i className="fas fa-bullseye"></i>
              Set Your Goals
            </button>
          </div>

          {/* Add the Modal */}
          {showGoalModal && (
            <div className="goal-modal">
              <div className="goal-modal-content">
                <h2>Set Your Financial Goals</h2>
                <div className="goal-grid">
                  {Object.keys(goals).map(category => (
                    <div key={category} className="goal-item">
                      <label>{category}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={goals[category] || ''}
                        onChange={(e) => handleGoalUpdate(category, e.target.value)}
                        placeholder={`Set ${category} goal`}
                      />
                    </div>
                  ))}
                </div>
                <div className="goal-modal-buttons">
                  <button onClick={saveGoals} className="save-goals-btn">
                    Save Goals
                  </button>
                  <button onClick={() => setShowGoalModal(false)} className="close-modal-btn">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="tracker-part">
            <div className="tracker-balance">
              Current Balance: <span className={`current-balance ${balance < 0 ? 'negative-balance' : 'positive-balance'}`}>
                {formatCurrency(balance, currency)}
              </span>
            </div>

            <div className="currency-filter">
              <div className="filter-left">
                <label htmlFor="currency">Select Currency:</label>
                <select id="currency" value={currency} onChange={handleCurrencyChange}>
                  <option value="INR">INR</option>
                </select>
              </div>
              <div className="filter-right date-range-container">
                <label>Export Date Range:</label>
                <div className="date-inputs">
                  <div className="date-input-group">
                    <span>From</span>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="modern-date-input"
                    />
                  </div>
                  <div className="date-input-group">
                    <span>To</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="modern-date-input"
                    />
                  </div>
                </div>
              </div>
              <div className="filter-right">
                <label htmlFor="date" className="date-box">Transaction Date:</label>
                <input type="date" id="date" ref={dateRef} className="modern-date-input" />
                {validationErrors.date && <span className="error" style={{color: '#ff3333', fontWeight: 'bold'}}>{validationErrors.date}</span>}
              </div>
            </div>

            <div className="transaction-form">
              <select ref={descriptionRef}>
                <option value="" disabled selected>Select type of expense</option>
                <option value="Salary">Salary</option>
                <option value="Utilities">Utilities</option>
                <option value="Groceries">Groceries</option>
                <option value="Transportation">Transportation</option>
                <option value="Housing">Housing</option>
                <option value="Food & Dinning">Food & Dinning</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health </option>
                <option value="Others">Others</option>
              </select>
              {validationErrors.description && <span className="error" style={{color: '#ff3333', fontWeight: 'bold'}}>{validationErrors.description}</span>}
              
              <input type="number" ref={amountRef} placeholder="Amount" />
              {validationErrors.amount && <span className="error" style={{color: '#ff3333', fontWeight: 'bold'}}>{validationErrors.amount}</span>}
              
              <select ref={typeRef}>
                <option value="" disabled selected>Select income or expense</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              {validationErrors.type && <span className="error" style={{color: '#ff3333', fontWeight: 'bold'}}>{validationErrors.type}</span>}
              
              {!editedTransaction ? (
                <button onClick={addTransaction}>Add Transaction</button>
              ) : (
                <button onClick={saveTransaction}>Save Changes</button>
              )}
              <button onClick={handleDownload}>Export</button>
              <button onClick={() => window.location.href = '/transcations'}>
                show Transactions
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Track;