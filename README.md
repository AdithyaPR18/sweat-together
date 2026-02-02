# Sweat Together

This project consists of a Python FastAPI backend and a React + Vite frontend.

## Prerequisites
- Python 3.x
- Node.js & npm

## Quick Start

### 1. Run the Backend
Open a terminal and run the following:

```bash
cd backend
# Create a virtual environment (if you haven't already)
python3 -m venv .venv
# Activate the virtual environment
source .venv/bin/activate
# Install dependencies
pip install -r requirements.txt
# Start the server
uvicorn main:app --reload
```
The backend API will be available at `http://127.0.0.1:8000`.

### 2. Run the Frontend
Open a new terminal window and run the following:

```bash
cd sweat-frontend
# Install dependencies
npm install
# Start the development server
npm run dev
```
The frontend application will be running at `http://localhost:5173`.
