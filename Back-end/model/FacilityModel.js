const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,
  location: String,
  availability: Boolean,
  opening_hours: String,
  ratings: {
    oneStar: { type: Number, default: 0 },
    twoStars: { type: Number, default: 0 },
    threeStars: { type: Number, default: 0 },
    fourStars: { type: Number, default: 0 },
    fiveStars: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Facility", FacilitySchema);
