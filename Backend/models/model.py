import sys
import pandas as pd
import numpy as np
import json
import traceback
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

def predict_expenses(file_path):
    try:
        # Load transaction data
        transactions = pd.read_csv(file_path)

        # Convert 'Amount' column to numeric (remove ₹ and commas)
        transactions['Amount'] = transactions['Amount'].replace('[₹,]', '', regex=True).astype(float)

        # Convert 'Date' to datetime (fix inconsistent formats)
        transactions['Date'] = pd.to_datetime(transactions['Date'], errors='coerce')


        # Drop rows where Date parsing failed
        transactions = transactions.dropna(subset=['Date'])

        # Filter only 'expense' transactions
        transactions = transactions[transactions['Type'].str.lower() == 'expense']

        # Extract Year and Month
        transactions['Year'] = transactions['Date'].dt.year
        transactions['Month'] = transactions['Date'].dt.month

        # Aggregate expenses per month and category
        monthly_expenses = transactions.groupby(['Year', 'Month', 'Description'])['Amount'].sum().reset_index()

        # Pivot table for time-series format
        pivot_data = monthly_expenses.pivot_table(index=['Year', 'Month'], columns='Description', values='Amount', fill_value=0)
        pivot_data.reset_index(inplace=True)
        pivot_data['TimeIndex'] = range(len(pivot_data))

        # Store predictions
        predictions = {}

        for category in pivot_data.columns[2:-1]:  # Exclude Year, Month, and TimeIndex
            data = pivot_data[['TimeIndex', category]].dropna()
            X = data[['TimeIndex']]
            y = data[category]

            if len(X) > 1:
                # Train-test split
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

                # Train models
                lin_reg = LinearRegression().fit(X_train, y_train)
                rf_reg = RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train, y_train)

                # Predict next month
                next_time_index = pivot_data['TimeIndex'].max() + 1
                X_next = pd.DataFrame([[next_time_index]], columns=['TimeIndex'])
                lin_pred = lin_reg.predict(X_next)[0]
                rf_pred = rf_reg.predict(X_next)[0]

                # Average predictions and ensure non-negative values
                predictions[category] = max(0, (lin_pred + rf_pred) / 2)

        # Prepare JSON output
        result = json.dumps({"predictions": predictions}, indent=4)
        print(result)
        return result

    except Exception as e:
        error_message = json.dumps({"error": str(e), "traceback": traceback.format_exc()}, indent=4)
        print(error_message, file=sys.stderr)
        return error_message

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}), file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    predict_expenses(file_path)
