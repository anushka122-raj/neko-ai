# NekoAI demo: run it locally

## Frontend (ready now)

Open a terminal in `frontend` and run:

```powershell
npm.cmd run dev
```

Then open `http://localhost:5173`.

The demo works without the backend. Tasks, memories, and chat are stored in the browser, so the presentation is reliable even when no API key is configured.

## Optional FastAPI backend

Install a standard Python 3.11+ distribution with `pip`, then in `backend` run:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/docs` to view and test the API. The chat endpoint uses local helpful replies if `GEMINI_API_KEY` is not set.
