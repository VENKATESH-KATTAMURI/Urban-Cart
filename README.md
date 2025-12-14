# 🛒 UrbanCart - Modern Ecommerce Platform

**Smart Shopping for Urban Living**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

> ✅ **Production Ready** | 🆓 **Free to Deploy** | 🚀 **Deploy in 15 Minutes**

---

## 🎨 Color Theme
- **Primary**: Teal `#0FB9B1`
- **Secondary**: Amber `#F59E0B`
- **Background**: Light Grey `#F9FAFB`
- **Text**: Dark Slate `#111827`

---

## 🚀 Features
- ✅ Modern UI with clean, card-based design
- ✅ Product recommendation engine
- ✅ Category-based navigation
- ✅ Shopping cart & wishlist
- ✅ User authentication (JWT)
- ✅ Order management
- ✅ Payment integration (Razorpay)
- ✅ Product reviews & ratings
- ✅ Responsive design
- ✅ Security: Helmet, CORS, Rate Limiting

---

## 📦 Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (native driver)
- **JWT** Authentication
- **Razorpay** Payment Gateway
- **Helmet** for security
- **Express Validator** for input validation

### Frontend
- **React.js** 18.2
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management
- **Custom CSS** with card-based design

---

## 🆓 Deploy for FREE

**[→ See Free Deployment Guide](./DEPLOY_FREE.md)**

### Quick Deploy to Render.com (Recommended)

1. Fork/clone this repository
2. Sign up at [Render.com](https://render.com) (FREE)
3. Create new Web Service from your repo
4. Add environment variables (see below)
5. Deploy! 🎉

**[Full Instructions →](./FREE_DEPLOYMENT.md)**

---

## ⚙️ Environment Variables

Required variables for deployment:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_secret_key
CLIENT_URL=*
```

Optional (for payments):
```env
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## 🏗️ Project Structure
```
UrbanCart/
├── backend/
│   ├── config/            # Database configuration
│   ├── data/              # Data repositories
│   ├── middleware/        # Auth & other middleware
│   ├── routes/            # API routes
│   ├── public/            # Built frontend (production)
│   └── server.js          # Entry point
├── frontend/client/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context API
│   │   └── utils/         # Utilities
│   └── build/             # Production build
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── Procfile              # Heroku deployment
└── render.yaml           # Render deployment
```

---

## 💻 Local Development

### Quick Start

```bash
# Install all dependencies
npm install

# Build frontend
npm run build

# Start application
npm start
# Visit http://localhost:5000
```

### Development Mode (Separate Frontend/Backend)

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Seed Database
```bash
npm run seed
```

---

## 📚 Documentation

- **[Free Deployment Guide](./DEPLOY_FREE.md)** - Deploy in 15 minutes for FREE
- **[Setup Guide](./SETUP.md)** - Detailed local setup
- **[Deployment Options](./DEPLOYMENT.md)** - All deployment platforms
- **[Architecture](./ARCHITECTURE.md)** - System architecture

---

## 🎯 API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/products` - Get products (with filters)
- `GET /api/cart` - Get user cart
- `POST /api/orders` - Create order
- `GET /health` - Health check

---

## 🙏 Acknowledgments

- React.js for the frontend framework
- MongoDB Atlas for database hosting
- Render.com for free deployment
- Open-source community

---

**⭐ Star this repo if you found it helpful!**

**🚀 [Deploy for FREE in 15 Minutes →](./DEPLOY_FREE.md)**
