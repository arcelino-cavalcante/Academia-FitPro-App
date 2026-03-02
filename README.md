# FitPro SaaS - Premium Gym Management PWA 🚀

A high-performance, premium Progressive Web Application (PWA) designed for Personal Trainers and Gyms. Now optimized with ultra-light MP4 exercise videos and automated deployment.

## ✨ New in v2.0
- **Ultra-Light Static API**: 960+ exercise videos converted to high-compressed MP4 (~80% lighter than GIFs).
- **GitHub Integration**: Global exercise database hosted as a static API for zero-cost and maximum uptime.
- **Smart Caching**: Media and data are cached in the browser for a sub-second load experience even offline.
- **Automated Deployment**: GitHub Actions workflow for zero-config CI/CD on GitHub Pages.

## 🚀 Key Features
- **Premium UI**: Ultra-modern interface with glassmorphism, neon accents, and smooth animations.
- **Biomechanical Exercise Engine**: 930+ exercises categorized for accuracy.
- **Smart Workout Builder**: Advanced template system with "Coach-Level" precision.
- **Offline Mode**: Full PWA support using IndexedDB and Workbox.
- **Teacher/Student Portal**: Distinct dashboards for instructors and trainees.

## 🛠 Tech Stack
- **Frontend**: React.js, Vite, HashRouter (GH Pages compat).
- **Media Engine**: FFmpeg (Optimized MP4 videos).
- **Backend**: Firebase Firestore, Firebase Auth.
- **State Management**: Zustand.
- **CI/CD**: GitHub Actions + GitHub Pages.

## 📦 Deployment on GitHub Pages

1. **Configure Environment**: Add your Firebase variables in GitHub Secrets (`VITE_FIREBASE_API_KEY`, etc.).
2. **Push to Main**: The included `.github/workflows/deploy.yml` will automatically build and deploy the app.
3. **Authorized Domains**: Ensure `arcelino-cavalcante.github.io` is added to your Firebase Auth allowed domains.

## 📄 License
MIT License. Developed for advanced gym management systems.
