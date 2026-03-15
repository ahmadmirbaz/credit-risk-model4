# Credit Risk AI

A credit risk prediction system that estimates the probability of loan default using a logistic regression model and provides AI-generated explanations of borrower risk.

The application allows users to input borrower financial attributes, run a machine learning model to evaluate credit risk, and receive both a **numerical risk score** and a **natural-language explanation** of the model’s decision.

## Features

• Logistic regression credit risk model  
• Financial feature engineering using borrower financial attributes  
• AI-generated explanations of model predictions  
• REST API backend for model inference  
• Dashboard displaying model metrics and feature importance  

## Tech Stack

Python  
Pandas  
NumPy  
scikit-learn  
PostgreSQL  
Express / Node.js  
React  
Vite  
OpenAI API  

## Run Locally

Clone the repository

git clone https://github.com/ahmadmirbaz/credit-risk-model4.git  
cd credit-risk-model4

Install dependencies

npm install -g pnpm  
pnpm install  

Create environment variables

cp .env.example .env

Example `.env` configuration

PORT=3000  
DATABASE_URL=postgres://postgres@localhost:5432/riskedge  
AI_INTEGRATIONS_OPENAI_BASE_URL=http://localhost:3001  
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_api_key  

Start PostgreSQL

brew services start postgresql  
createdb riskedge  

Start the API server

pnpm --filter @workspace/api-server run dev  

The application will run at

http://localhost:3000

## How It Works

1. Borrower financial attributes are submitted through the application.
2. The backend sends the data to the credit risk model.
3. A logistic regression model predicts the probability of loan default.
4. The result is passed to an AI explanation layer.
5. The system generates a natural-language explanation of the prediction.

## Author

Ahmad Mirbaz
