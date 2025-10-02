Smart Stock & Sales Management System

A web-based stock and sales management platform that allows businesses to manage inventory, track stock levels, process sales using barcodes, generate invoices, and view sales history. The system can be accessed from anywhere on any device, providing real-time updates and streamlined operations.

Features

Bulk stock management with barcode support

Real-time inventory tracking and automatic stock updates

Flexible pricing during sales

Professional invoice generation

Sales history tracking and reporting

Web-based access from any device (desktop, tablet, mobile)

Tech Stack

Frontend: React.js

Backend: Node.js + Express.js

Database: MongoDB (MongoDB Atlas or local)

Other: Axios for API calls, Mongoose for DB modeling, dotenv for environment variables

Project Structure
project-root/
├─ frontend/        # React app
│   ├─ src/
│   ├─ public/
│   └─ package.json
├─ backend/         # Node.js + Express API
│   ├─ controllers/
│   ├─ models/
│   ├─ routes/
│   ├─ config/
│   └─ package.json
└─ README.md

Setup Instructions
1. Clone Repository
git clone <your-repo-url>
cd project-root

2. Setup Backend
cd backend
npm install
# create a .env file with:
# MONGODB_URI=<your-mongo-uri>
# PORT=5000
npm start

3. Setup Frontend
cd ../frontend
npm install
npm start


Frontend runs on http://localhost:3000

Backend API runs on http://16.16.24.8:5000

Usage

Add new stock with barcode and details

Scan barcode to process sales and adjust stock

Generate invoices for each sale

View sales history and track past orders

Access system from any device with internet

Future Enhancements

User authentication and role-based access

Low-stock alerts and notifications

Multi-branch inventory management

Analytics dashboard for sales and stock

License

This project is for internal business use and academic purposes.
