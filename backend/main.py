from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# ✅ exact origins (dev + prod)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sweat-together.vercel.app",  # your live frontend
]

# ✅ also allow Vercel preview URLs if you use them
# (e.g., https://feature-123-abc.vercel.app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://[a-z0-9-]+\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- demo routes (yours may differ) ----
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
    u = users.get(body.email)
    if not u or u["password"] != body.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"token": "demo-token", "user": {"id": 1, "name": u["name"], "email": body.email}}

@app.get("/api/workouts/my")
def workouts():
    return {"workouts": []}

# Optional: simple health at "/"
@app.get("/")
def root():
    return {"ok": True}
