import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./FacilityList.css";
import Navbar from './components/Navbar';

const FacilityList = () => {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    // Fetch facilities with pagination (page 1 and limit 10)
    axios
      .get("http://localhost:5000/api/facilities")
      .then((res) => setFacilities(res.data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  const renderStars = (rating) => {
    const safeRating = rating || 0; // Default to 0 if undefined or invalid
    const fullStars = Math.floor(safeRating);
    const halfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="stars">
        {"⭐".repeat(fullStars)}
        {halfStar && "⭐"}
        {"☆".repeat(emptyStars)}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="facility-list">
        <h1>Facilities</h1>
        <div className="facility-container">
          {facilities.map((facility) => {
            const averageRating = parseFloat(facility.averageRating) || 0; // Parse as number or default to 0
            return (
              <div key={facility._id} className="facility-item">
                <Link to={`/facility/${facility._id}`} className="facility-link">
                  <h2>{facility.name}</h2>
                  <p>{facility.description}</p>
                  {facility.image && (
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="facility-image"
                    />
                  )}
                  <div className="rating">
                    {renderStars(averageRating)}
                    <span> ({averageRating.toFixed(1)})</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FacilityList;
