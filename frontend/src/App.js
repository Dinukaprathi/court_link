import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FacilityList from "./FacilityList";
import FacilityDisplay from "./facility_display";
import UpdateReviewsAndRatings from "./update_reviews_&_ratings";
import LoginPage from "./LoginPage"; // Import the login page
import AdminDashboard from "./AdminDashboard"; // Import admin dashboard
import UserDashboard from "./UserDashboard"; // Import user dashboard
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FacilityList />} />
        <Route path="/facility/:id" element={<FacilityDisplay />} />
        <Route path="/update-review/:id" element={<UpdateReviewsAndRatings />} />
        <Route path="/login" element={<LoginPage />} /> {/* Login route */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Admin dashboard route */}
        <Route path="/user-dashboard" element={<UserDashboard />} /> {/* User dashboard route */}
      </Routes>
    </Router>
  );
};

export default App;
