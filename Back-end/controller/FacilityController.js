const Facility = require("../model/facilityModel");

// Function to calculate the average rating
const calculateAverageRating = (ratings) => {
  if (!ratings) return 0; // Default to 0 if ratings object is missing

  const { oneStar = 0, twoStars = 0, threeStars = 0, fourStars = 0, fiveStars = 0 } = ratings;
  const totalRatings = oneStar + twoStars + threeStars + fourStars + fiveStars;

  if (totalRatings === 0) return 0; // Avoid division by zero

  const weightedSum =
    (1 * oneStar) + (2 * twoStars) + (3 * threeStars) + (4 * fourStars) + (5 * fiveStars);
  
  return (weightedSum / totalRatings).toFixed(2); // Return floating-point rating with two decimal places
};

// Get a single facility by ID with average rating
exports.getFacilityById = async (req, res) => {
  const { id } = req.params;

  try {
    const facility = await Facility.findById(id);
    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    // Calculate the average rating and include it in the response
    const avgRating = calculateAverageRating(facility.ratings);
    res.json({ ...facility.toObject(), averageRating: avgRating });
  } catch (err) {
    res.status(500).json({ message: "Error fetching facility", error: err });
  }
};

// Get all facilities with calculated average ratings
exports.getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    
    // Add calculated average rating to each facility
    const facilitiesWithRatings = facilities.map((facility) => ({
      ...facility.toObject(),
      averageRating: calculateAverageRating(facility.ratings),
    }));

    res.json(facilitiesWithRatings);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update rating count for a facility and return updated rating
exports.rateFacility = async (req, res) => {
  const { id, rating } = req.body;

  if (![1, 2, 3, 4, 5].includes(rating)) {
    return res.status(400).json({ message: "Invalid rating. Use 1-5." });
  }

  try {
    const facility = await Facility.findById(id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    // Update the rating count for the specified rating
    facility.ratings[`${rating}Star`] += 1;
    
    // Save the updated facility
    await facility.save();

    // Calculate the new average rating
    const newAverageRating = calculateAverageRating(facility.ratings);

    res.json({
      message: "Rating updated successfully",
      averageRating: newAverageRating,
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};
