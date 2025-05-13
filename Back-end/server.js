// backend/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');
const facilityRoutes = require('./routes/FacilityRoutes');
const reviewRoutes = require('./routes/reviewRoute'); 
const userRoutes = require('./routes/userRoutes'); // Import user routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = 5000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax', // Add sameSite attribute
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api', facilityRoutes);
app.use('/api/reviews', reviewRoutes);  
app.use('/api/auth', userRoutes); // Use user routes with /api/auth prefix
app.use('/api', adminRoutes); // Use admin routes
app.use('/api/reports', reportRoutes);

// Add a test route to verify the server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server only after database connection is established
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();