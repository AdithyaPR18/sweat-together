# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# ✅ CORS: allow your Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sweat-together.vercel.app/",  # <-- replace after you know it
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- demo in-memory API below (replace with real DB later) ---
users = {}

class RegisterBody(BaseModel):
    name: str
    email: str
    password: str

@app.post("/api/register")
def register(body: RegisterBody):
    if body.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    users[body.email] = {"name": body.name, "password": body.password}
    return {"token": "demo-token", "user": {"id": len(users), "name": body.name, "email": body.email}}

class LoginBody(BaseModel):
    email: str
    password: str

@app.post("/api/login")
def login(body: LoginBody):
    user = users.get(body.email)
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"token": "demo-token", "user": {"id": 1, "name": user["name"], "email": body.email}}

@app.get("/api/workouts/my")
def workouts():
    return {"workouts": []}
