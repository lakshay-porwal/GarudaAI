# Garuda AI

> Full-stack AI chat application — fast, persistent, and modern.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- ⚡ Blazing-fast AI responses via Groq API
- 🧠 Context-aware multi-turn conversations
- 💬 Multiple chat sessions with persistent history
- 🔑 JWT authentication + bcrypt password hashing
- 📝 Markdown & syntax-highlighted code rendering
- 📱 Fully responsive with skeleton loaders & typing indicator

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MongoDB, Redis (caching) |
| AI | Groq API |
| Deploy | Vercel (frontend), Render (backend) |

---

## Getting Started

```bash
git clone https://github.com/lakshayporwal/garuda-ai.git
cd garuda-ai

# Backend
cd server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

**`server/.env`**
```env
PORT=5000
MONGO_URI=your_mongodb_uri
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Folder Structure

```
garuda-ai/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── context/
└── server/          # Express backend
    ├── Database/
    ├── models/
    ├── routes/
    └── services/
    
```

---

## Deployment

- **Frontend:** Import `frontend/` on [Vercel](https://vercel.com), set `VITE_API_BASE_URL` to your Render URL
- **Backend:** Deploy `backend/` on [Render](https://render.com), add all env vars in the dashboard

---

## License

MIT © [Lakshay Porwal](https://github.com/lakshayporwal)

---

## Contact

**Lakshay Porwal**
[![Email](https://img.shields.io/badge/Email-lakshayporwal5181@gmail.com-D14836?logo=gmail&logoColor=white)](mailto:lakshayporwal5181@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lakshay_Porwal-0A66C2?logo=linkedin)](https://www.linkedin.com/in/lakshay-porwal)

---

<div align="center">Built with ❤️ by Lakshay Porwal</div>
