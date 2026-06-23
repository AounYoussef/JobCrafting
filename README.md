# 🧩 Job Crafting

> Imagine waking up tomorrow excited to go to work. Not because you have to — but because everything about it was made for you. Your role matches your skills. Your company matches your values. Your team matches your energy.
>
> **That world exists. We're building it. One perfect match at a time.**

Job Crafting is an AI-powered platform built on organizational psychology — helping employees proactively reshape their careers to align with their skills, values, and personal goals. Using AI and NLP, it delivers personalized job matching, real-time career coaching, and CV optimization so that talent stops being wasted and potential stops being ignored.

---

## Requirements

- Node.js v18+
- A [Google Gemini API Key](https://aistudio.google.com/)
- A Firebase project

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## Getting Started

```bash
git clone https://github.com/AounYoussef/JobCrafting.git
cd JobCrafting
npm install
npm run dev
```

App runs at `http://localhost:5173`
