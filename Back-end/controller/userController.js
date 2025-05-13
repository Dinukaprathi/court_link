const User = require("../model/userModel");

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // Create user with plain password
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        id: user._id,
        email: user.email,
        role: user.role
      });
    }
    
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Direct password comparison
    console.log('Comparing passwords...');
    if (password !== user.password) {
      console.log('Password mismatch');
      return res.status(400).json({ message: "Invalid email or password" });
    }
    console.log('Password match successful');

    // Update user's IP address and last login time
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    user.ipAddress = ipAddress;
    user.lastLogin = new Date();
    await user.save();
    console.log('User IP and last login updated');

    // Store user session with role
    req.session.user = { 
      id: user._id, 
      username: user.username, 
      email: user.email,
      role: user.role 
    };

    console.log('Session created:', req.session.user);

    res.json({ 
      message: "Login successful", 
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Logout User
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.json({ message: "Logout successful" });
  });
};

// Get Current User Session
const getSessionUser = (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "No active session" });
  
  // Check if the request is coming from /me endpoint
  if (req.path === '/me') {
    return res.json({ 
      user: req.session.user
    });
  }
  
  // For /check endpoint and others
  res.json({ 
    isAuthenticated: true,
    user: req.session.user,
    isAdmin: req.session.user.role === 'admin'
  });
};

// Check if user is admin
const isAdmin = (req, res) => {
  if (!req.session.user) return res.status(401).json({ isAdmin: false });
  res.json({ isAdmin: req.session.user.role === 'admin' });
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Get all users (excluding password)
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getSessionUser, isAdmin, getAllUsers };
