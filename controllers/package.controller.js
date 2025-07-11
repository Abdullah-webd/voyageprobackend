import { Package } from "../models/package.model.js";

export const getAllPackages = async (req, res) => {
  try {
    const { search, location, sortBy } = req.query;

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (location) {
      query.location = location;
    }
    

    let sortOptions = {};

    if (sortBy === 'price') {
  sortOptions.price = 1;
} else if (sortBy === 'duration') {
  sortOptions.duration = 1;
} else if (sortBy === 'createdAt') {
  sortOptions.createdAt = -1;
} else {
  // fallback if nothing is specified
  sortOptions.createdAt = -1;
}


    const packages = await Package.find(query).sort(sortOptions);

    res.status(200).json(packages);

  } catch (error) {
    console.error("Error in getAllPackages:", error);
    res.status(500).json({ message: "Error fetching packages", error });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const packageId = req.params.id;

    if (!packageId) {
      return res.status(400).json({ message: "Package ID is required" });
    }

    const itemPackage = await Package.findById(packageId);

    if (!itemPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json(itemPackage);
  } catch (error) {
    console.error("Error in getPackageById:", error);
    res.status(500).json({ message: "Error fetching package", error });
  }
}

export const createPackage = async (req, res) => {

   

    // Basic field validation
   
  try {
    const {
      title,
      tagline,
      duration,
      pricePerAdult,
      location,
      rating,
      totalBookings,
      whatsIncluded,
      itinerary,
      accommodation
    } = req.body;

    if (
      !title || !tagline || !duration || !pricePerAdult || !location ||
      !location.country || !location.city ||
      !whatsIncluded || !Array.isArray(whatsIncluded) ||
      !itinerary || !Array.isArray(itinerary) ||
      !accommodation || !accommodation.roomType || !accommodation.resortType
    ) {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }
    const newPackage = new Package(req.body);
    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    console.error("Error in createPackage:", error);
    res.status(500).json({ message: "Error creating package", error });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;

    if (!packageId) {
      return res.status(400).json({ message: "Package ID is required" });
    }

    const updatedPackage = await Package.findByIdAndUpdate(packageId, req.body, { new: true });


    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json({ message: "Package updated successfully" });
    }
    catch (error) {
    console.error("Error in updatePackage:", error);
    res.status(500).json({ message: "Error updating package", error });
    }

}

export const deletePackage = async (req, res) => {
  try {
    const packageId = req.params.id;

    if (!packageId) {
      return res.status(400).json({ message: "Package ID is required" });
    }

    const deletedPackage = await Package.findByIdAndDelete(packageId);

    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error in deletePackage:", error);
    res.status(500).json({ message: "Error deleting package", error });
  }
};

// Example JSON response for the reqest
// [
//   {
//     "title": "Beach Paradise",
//     "description": "Sunny beaches and cool breeze",
//     "location": "Maldives",
//     "price": 2000,
//     "images": ["https://example.com/beach.jpg"],
//     "availability": true,
//     "duration": "6 days"
//   },
//   {
//     "title": "Mountain Hike",
//     "description": "Explore the mountains and fresh air",
//     "location": "Nepal",
//     "price": 1800,
//     "images": ["https://example.com/mountain.jpg"],
//     "availability": true,
//     "duration": "4 days"
//   },
//   {
//     "title": "City Lights",
//     "description": "Visit the most iconic cities",
//     "location": "New York",
//     "price": 2500,
//     "images": ["https://example.com/city.jpg"],
//     "availability": false,
//     "duration": "5 days"
//   }
// ]

