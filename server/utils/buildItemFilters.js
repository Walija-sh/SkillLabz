export default function buildItemFilters(query) {
  const {
    category,
    city,
    minPrice,
    maxPrice,
    keyword
  } = query;

  const filter = {
    isAvailable: true,
    isApproved: true
  };

  if (category) filter.category = category;
  if (city) filter["location.city"] = city;

  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }

  if (keyword) {
    filter.title = { $regex: keyword, $options: "i" };
  }

  return filter;
}