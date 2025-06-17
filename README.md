# 🖼️ IMAGO Media Search Application

A full-stack application that allows users to search and view media content stored in an Elasticsearch index provided by IMAGO.

---

## 🔗 Live Demo: gitpods are disabled after 30 minutes. 

* **Frontend (React):** [Open UI](https://5173-syedmuhamm-imagomediase-2dhunufqken.ws-eu120.gitpod.io)
* **Backend (Django + Elasticsearch):** [API Endpoint](https://8000-syedmuhamm-imagomediase-2dhunufqken.ws-eu120.gitpod.io/api/media/search/?q=pal&page=1&page_size=5)

---

## 📁 Project Structure

```
/
🔼── backend/           # Django project
│   🔼── media_search/  # Django app for media search logic
│   🔼── manage.py
│   🔼── backend.env    # Contains Django environment variables
│
🔼── frontend/          # React frontend
│   🔼── src/
│   🔼── .env           # Contains frontend environment variables
│   🔼── vite.config.js
🔼── README.md
```

---

## ⚙️ Backend Setup (Django + Elasticsearch)

### 1. Navigate to the backend directory

```bash
cd backend/
```

### 2. Create a virtual environment and install dependencies

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure `.env` file

Change .env.backend in /backend to .env : "since .env file is ignored while committing". 
Change .env.frontend in /frontend to .env

Update the `backend.env` now `.env` file with the desired backend port (default is `8000`):

You can launch the backend on a different port by running:

```bash
python manage.py runserver 0.0.0.0:8010
```

> 🔁 **Note:** If you use a custom port (e.g., 8010), update both the `backend.env` (for testing) and the frontend `.env` (for API access) to match.

### 4. Run migrations and start the server

```bash
python manage.py migrate
python manage.py runserver
```

---

## 🌐 Frontend Setup (React + Vite)

### 1. Navigate to the frontend directory

```bash
cd frontend/
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure `.env` file

Update the `.env` file in the root of the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/media
```

> 💡 If your backend is running on a different port (e.g., `8010`), update this accordingly:

```env
VITE_API_BASE_URL=http://localhost:8010/api/media
```

### 4. Start the development server

```bash
npm run dev
```

Then open the app in your browser: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Running Tests

### Backend

```bash
cd backend/media_api
pytest tests
```

### Frontend

Basic UI tests can be added using tools like Vitest or Jest.

---

## 🧠 Notes

* Make sure Elasticsearch server is reachable from your backend. It uses basic auth and ignores SSL verification.
* Default Elasticsearch connection is defined in Django settings.
* Thumbnail media URLs are constructed and padded based on DB and Media ID.

---

## 📬 Contact

If you have any questions or feedback, feel free to reach out!

---
