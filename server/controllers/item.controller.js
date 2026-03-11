import Item from "../models/Item.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import cloudinary from "../config/cloudinary.js";
import buildItemFilters from "../utils/buildItemFilters.js";
import Rental from "../models/Rental.js";

// -------------------------
// CREATE ITEM
// -------------------------

export const createItem = catchAsync(async (req, res, next) => {
  const { title, description, category, condition, pricePerDay, depositAmount } = req.body;

  // --- Validate basic user conditions ---
  if (!req.user.isEmailVerified)
    return next(new AppError("Please verify your email before listing items", 403));

  if (!req.user.profileCompleted)
    return next(new AppError("Complete your profile before listing items", 403));

  // --- Validate user location/address from profile ---
  if (
    !req.user.location ||
    !req.user.location.coordinates ||
    req.user.location.coordinates.length !== 2 ||
    !req.user.location.addressText
  ) {
    return next(new AppError("User location or address not set. Complete your profile first.", 400));
  }

  // --- Free user listing limit ---
  if (req.user.membershipType === "free") {
    const existingItemsCount = await Item.countDocuments({ owner: req.user._id });
    if (existingItemsCount >= 3) {
      return next(new AppError("Free users can only list 3 items. Upgrade to premium to list more.", 403));
    }
  }

  // --- Validate images ---
  if (!req.files || req.files.length === 0) {
    return next(new AppError("At least one image is required", 400));
  }

  const images = req.files.map(file => ({
    public_id: file.filename,
    url: file.path
  }));

  // --- Create the item using profile location/address ---
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
      coordinates: req.user.location.coordinates,
      city: req.user.location.city,
      addressText: req.user.location.addressText
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

  const { page = 1, limit = 10 } = req.query;

  const filters = buildItemFilters(req.query);

  const skip = (page - 1) * limit;

  const items = await Item.find(filters)
    .populate("owner", "username profileImage")
    .skip(skip)
    .limit(Number(limit))
    .sort("-createdAt");

  const total = await Item.countDocuments(filters);

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

  // 1. Check for images the user wants to KEEP (filtering out deleted ones)
  if (req.body.keptImages) {
    const keptIds = JSON.parse(req.body.keptImages);
    item.images = item.images.filter(img => keptIds.includes(img.public_id));
    delete req.body.keptImages; // Remove from body so Object.assign doesn't use it
  }

  // 2. If new images uploaded → ADD them to the existing ones instead of replacing
  if (req.files && req.files.length > 0) {
    const newUploads = req.files.map(file => ({
      public_id: file.filename,
      url: file.path
    }));
    item.images = [...item.images, ...newUploads];
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

  const filters = buildItemFilters(req.query);

  const radius = distance / 6378.1;

  filters.location = {
    $geoWithin: {
      $centerSphere: [[lng, lat], radius]
    }
  };

  const items = await Item.find(filters)
    .populate("owner", "username profileImage")
    .sort("-createdAt");

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