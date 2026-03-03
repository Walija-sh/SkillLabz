import Item from "../models/Item.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";

// -------------------------
// CREATE ITEM
// -------------------------
export const createItem = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    category,
    condition,
    pricePerDay,
    depositAmount,
    city,
    addressText,
    lat,
    lng
  } = req.body;

  if (!req.user.isEmailVerified) {
  return next(new AppError("Please verify your email before listing items", 403));
}
if (!req.user.profileCompleted) {
  return next(new AppError("Complete your profile before listing items", 403));
}
const existingItemsCount = await Item.countDocuments({
  owner: req.user._id
});

if (
  req.user.membershipType === "free" &&
  existingItemsCount >= 3
) {
  return next(new AppError("Free users can only list 3 items", 403));
}

  if (!lat || !lng) {
    return next(new AppError("Location coordinates required", 400));
  }

  if (!req.files || req.files.length === 0) {
    return next(new AppError("At least one image is required", 400));
  }

  const images = req.files.map(file => ({
    public_id: file.filename,   // from CloudinaryStorage
    url: file.path              // secure_url
  }));

  const item = await Item.create({
    title,
    description,
    category,
    condition,
    pricePerDay,
    depositAmount,
    owner: req.user._id,
    images,
    location: {
      type: "Point",
      coordinates: [lng, lat],
      city,
      addressText
    }
  });

  res.status(201).json({
    status: "success",
    item
  });
});


// -------------------------
// GET ALL ITEMS (FILTER + PAGINATION)
// -------------------------
export const getAllItems = catchAsync(async (req, res, next) => {
  const {
    category,
    city,
    minPrice,
    maxPrice,
    keyword,
    page = 1,
    limit = 10
  } = req.query;

  const queryObj = {
    isAvailable: true,
    isApproved: true
  };

  if (category) queryObj.category = category;
  if (city) queryObj["location.city"] = city;

  if (minPrice || maxPrice) {
    queryObj.pricePerDay = {};
    if (minPrice) queryObj.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) queryObj.pricePerDay.$lte = Number(maxPrice);
  }

  if (keyword) {
    queryObj.title = { $regex: keyword, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const items = await Item.find(queryObj)
    .populate("owner", "username profileImage")
    .skip(skip)
    .limit(Number(limit))
    .sort("-createdAt");

  const total = await Item.countDocuments(queryObj);

  res.status(200).json({
    status: "success",
    results: items.length,
    total,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
    items
  });
});


// -------------------------
// GET SINGLE ITEM
// -------------------------
export const getSingleItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id)
    .populate("owner", "username profileImage averageRating");

  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  res.status(200).json({
    status: "success",
    item
  });
});


// -------------------------
// UPDATE ITEM
// -------------------------
export const updateItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  // If new images uploaded → replace old ones
  if (req.files && req.files.length > 0) {
    item.images = req.files.map(file => ({
      public_id: file.filename,
      url: file.path
    }));
  }

  Object.assign(item, req.body);

  await item.save();

  res.status(200).json({
    status: "success",
    item
  });
});

// -------------------------
// DELETE ITEM
// -------------------------
export const deleteItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to delete this item", 403));
  }

  const activeRental = await Rental.findOne({
  item: item._id,
  rentalStatus: { $in: ["approved", "active"] }
});

if (activeRental) {
  return next(new AppError("Cannot delete item with active rental", 400));
}

  await item.deleteOne();

  res.status(200).json({
    status: "success",
    message: "Item deleted successfully"
  });
});


// -------------------------
// GET MY ITEMS
// -------------------------
export const getMyItems = catchAsync(async (req, res, next) => {
  const items = await Item.find({ owner: req.user._id }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: items.length,
    items
  });
});


// -------------------------
// GET NEARBY ITEMS (GEO SEARCH)
// -------------------------
export const getNearbyItems = catchAsync(async (req, res, next) => {
  const { lat, lng, distance = 10 } = req.query;

  if (!lat || !lng) {
    return next(new AppError("Please provide latitude and longitude", 400));
  }

  const radius = distance / 6378.1; // Earth radius in km

  const items = await Item.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    },
    isAvailable: true
  }).populate("owner", "username profileImage");

  res.status(200).json({
    status: "success",
    results: items.length,
    items
  });
});


// -------------------------
// TOGGLE AVAILABILITY
// -------------------------
export const toggleAvailability = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  res.status(200).json({
    status: "success",
    message: `Item is now ${item.isAvailable ? "available" : "unavailable"}`,
    item
  });
});