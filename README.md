# CivicTrack – Public Issue Duplicate Finder

> A smart civic complaint reporting platform with intelligent duplicate complaint detection.

---

## 🌟 Features

- **🗺️ Interactive Map Reporting** — Click on a Leaflet/OpenStreetMap to pinpoint the exact location of an issue
- **🔍 Intelligent Duplicate Detection** — Multi-factor similarity scoring (category + geographic proximity + text similarity)
- **📊 Real-time Dashboard** — Charts showing complaint statistics by category and status
- **🔒 Admin Panel** — JWT-based authentication with role-based access control
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile
- **🏙️ Bengaluru-focused Seed Data** — 20+ realistic complaints with geographic duplicates for demo

---

## 🛠️ Technology Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Leaflet + react-leaflet | 1.9 / 4.x | Interactive maps |
| Recharts | 2.x | Charts & data visualization |
| Lucide React | 0.4+ | Icons |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.x | Web framework |
| MongoDB | 7+ | Database |
| Mongoose | 8.x | ODM |
| JWT | 9.x | Authentication |
| bcryptjs | 2.x | Password hashing |
| Multer | 1.x | File uploads |
| Helmet | 7.x | Security headers |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB (local installation or MongoDB Atlas free tier)
- npm or yarn

### 1. Clone and Navigate
```bash
git clone <repo-url>
cd public-issue-duplicate-finder
```

### 2. Backend Setup
```bash
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env with your settings:
# MONGODB_URI=mongodb://localhost:27017/civictrack  (or your Atlas URI)
# JWT_SECRET=your_long_random_secret_here

# Install dependencies
npm install

# Seed the database with 20+ sample Bengaluru complaints
npm run seed

# Start the development server (port 5001)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Copy environment variables  
cp .env.example .env
# VITE_API_URL=http://localhost:5001/api (default)

# Install dependencies
npm install

# Start the development server (port 5173)
npm run dev
```

### 4. Open in Browser
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

---

## 🔐 Authentication

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civictrack.in | Admin@123 |
| User | user@civictrack.in | User@1234 |

---

## 📡 API Reference

### Issues
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/issues | List issues with filtering/pagination | Public |
| GET | /api/issues/map | Get issues for map view | Public |
| GET | /api/issues/:id | Get single issue with related | Public |
| GET | /api/issues/check-duplicate | Check for duplicates before submit | Public |
| POST | /api/issues | Create new issue (with image) | Public |
| PATCH | /api/issues/:id/status | Update issue status | Admin |
| DELETE | /api/issues/:id | Delete issue | Admin |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login and get JWT cookie |
| POST | /api/auth/logout | Clear JWT cookie |
| GET | /api/auth/me | Get current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Total/pending/resolved counts |
| GET | /api/dashboard/categories | Category distribution |
| GET | /api/dashboard/status-distribution | Status breakdown |
| GET | /api/dashboard/recent | 10 most recent issues |

---

## 🧠 Duplicate Detection Algorithm

Before saving a complaint, the system checks MongoDB for similar existing complaints using three weighted factors:

```
Combined Score = Category(30%) + Geographic Proximity(40%) + Text Similarity(30%)
```

### Category Matching (30%)
- Uses MongoDB query to only compare same-category issues
- Score: 1.0 (100%) for same category, 0 for different

### Geographic Proximity (40%)
- Uses MongoDB 2dsphere geospatial query
- Default radius: **500 metres**
- Score: Linear decay from 1.0 (at 0m) to 0.0 (at radius limit)
- Formula: `1 - (distance / radius)`

### Text Similarity (30%)
- Combines issue title + description for comparison
- Removes stop words, normalizes text
- Uses **Jaccard similarity** on word token sets
- Formula: `|intersection(A, B)| / |union(A, B)|`

**Threshold**: Issues with a combined score ≥ **65%** trigger a duplicate warning.

Both the radius and threshold are configurable via environment variables:
```env
DUPLICATE_RADIUS_METERS=500
DUPLICATE_THRESHOLD=0.65
```

---

## 📁 Project Structure

```
public-issue-duplicate-finder/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── DuplicateWarningModal.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   ├── IssueCard.jsx
│   │   │   │   ├── LocationPicker.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   └── layout/
│   │   │       ├── Footer.jsx
│   │   │       └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── IssueDetailPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── ReportPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── issueService.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   └── issueController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Issue.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── issueRoutes.js
│   ├── services/
│   │   └── duplicateDetector.js
│   ├── uploads/
│   ├── .env
│   ├── .env.example
│   ├── seed.js
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 🌱 Seed Data

The seed script creates 20+ Bengaluru complaints across all categories with:
- **Geographic duplicates** in Indiranagar, Whitefield, Koramangala, HSR Layout etc.
- **Category variety**: Pothole, Garbage, Streetlight, Water Leakage, Drainage, Road Damage, Traffic Sign Damage
- **Status variety**: Reported, Under Review, In Progress, Resolved
- Pre-flagged duplicates to demonstrate the detection system

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (12 rounds)
- JWT stored in **HTTP-only cookies** (not localStorage)
- **CORS** configured for specific frontend URL
- **Helmet** for security headers
- Server-side input validation
- File upload type/size validation
- Admin-only routes protected by middleware

---

## 🧪 Testing the Duplicate Detection

1. Navigate to **Report Issue**
2. Select category **Pothole**
3. Click near **MG Road** on the map (latitude: 12.9757, longitude: 77.6035)
4. Enter description: "dangerous pothole near Brigade Road junction"
5. Submit → You should see a **⚠️ Possible Duplicate Found** warning
6. Click "Continue Anyway" to submit regardless

---

## 📦 Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/civictrack
JWT_SECRET=<long-random-string-min-32-chars>
FRONTEND_URL=https://your-domain.com
```

### Build Frontend
```bash
cd frontend
npm run build
# Serve dist/ folder with nginx or on Netlify/Vercel
```

---

## 📝 License

MIT License – Free to use, modify, and distribute.
