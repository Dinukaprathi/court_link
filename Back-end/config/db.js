const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = 'mongodb+srv://Dinuka:Dinukamash%401@cluster0.hr1n3.mongodb.net/court_link?retryWrites=true&w=majority';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // How long to wait for operations to complete
      connectTimeoutMS: 30000, // How long to wait for initial connection
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5, // Minimum number of connections in the pool
      retryWrites: true,
      retryReads: true
    };

    await mongoose.connect(uri, options);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Connected to MongoDB (court_link)');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    // Don't exit the process, let the application handle the error
    throw err;
  }
};

module.exports = connectDB;
