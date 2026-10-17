import { rawMobiles, mockBrands, mockServices, getMockAccessories } from './mockData.js';

// Normalize mobiles list once
const normalizedMobiles = rawMobiles.map((m, idx) => ({
  ...m,
  _id: m._id || `mob-${idx + 1}-${m.slug}`,
  brandName: m.brandName || m.brand,
  price: {
    mrp: m.mrp || m.price?.mrp || 49999,
    current: m.current || m.price?.current || 39999,
    discountPercentage:
      m.price?.discountPercentage ||
      Math.round((((m.mrp || 49999) - (m.current || 39999)) / (m.mrp || 49999)) * 100),
  },
  rating: m.rating || { avg: 4.6, count: 120 + (idx % 80) },
  status: m.status || 'available',
  variants: (m.variants || []).map((v, vIdx) => ({
    ...v,
    sku: v.sku || `${m.slug}-var-${vIdx + 1}`,
  })),
}));

const allAccessories = getMockAccessories(normalizedMobiles);

export const getMockFeatured = () => {
  const deals = normalizedMobiles
    .filter((m) => m.price.discountPercentage >= 15 || m.isFeatured)
    .slice(0, 8);
  const trending = normalizedMobiles
    .filter((m) => m.isTrending || m.rating.avg >= 4.6)
    .slice(0, 8);
  const newLaunches = normalizedMobiles
    .slice()
    .sort((a, b) => new Date(b.launchDate || '2024-01-01') - new Date(a.launchDate || '2024-01-01'))
    .slice(0, 8);

  return {
    success: true,
    data: {
      deals: deals.length > 0 ? deals : normalizedMobiles.slice(0, 8),
      trending: trending.length > 0 ? trending : normalizedMobiles.slice(8, 16),
      newLaunches: newLaunches.length > 0 ? newLaunches : normalizedMobiles.slice(16, 24),
    },
    message: 'Featured mobiles loaded (Demo Mode)',
  };
};

export const getMockMobiles = (params = {}) => {
  let list = [...normalizedMobiles];

  if (params.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.brandName.toLowerCase().includes(q) ||
        (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  if (params.brand) {
    const brands = params.brand.toLowerCase().split(',');
    list = list.filter((m) => brands.includes(m.brandName.toLowerCase()));
  }

  if (params.minPrice) {
    list = list.filter((m) => m.price.current >= Number(params.minPrice));
  }
  if (params.maxPrice) {
    list = list.filter((m) => m.price.current <= Number(params.maxPrice));
  }

  if (params.ram) {
    list = list.filter(
      (m) =>
        m.specs?.memory?.ram?.toLowerCase().includes(params.ram.toLowerCase()) ||
        m.variants?.some((v) => v.ram?.toLowerCase().includes(params.ram.toLowerCase()))
    );
  }

  if (params.has5G === 'true' || params.has5G === true) {
    list = list.filter((m) => m.specs?.network?.has5G !== false);
  }

  if (params.minRating) {
    list = list.filter((m) => (m.rating?.avg || 0) >= Number(params.minRating));
  }

  // Sorting
  if (params.sort === 'price_asc') {
    list.sort((a, b) => a.price.current - b.price.current);
  } else if (params.sort === 'price_desc') {
    list.sort((a, b) => b.price.current - a.price.current);
  } else if (params.sort === 'rating_desc') {
    list.sort((a, b) => (b.rating?.avg || 0) - (a.rating?.avg || 0));
  }

  const page = Math.max(1, parseInt(params.page || 1, 10));
  const limit = Math.min(50, Math.max(1, parseInt(params.limit || 12, 10)));
  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: paginated,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    message: 'Mobiles retrieved (Demo Mode)',
  };
};

export const getMockMobileBySlug = (slug) => {
  const cleanSlug = (slug || '').toLowerCase();
  const mobile =
    normalizedMobiles.find((m) => m.slug.toLowerCase() === cleanSlug) ||
    normalizedMobiles[0];

  const accessories = allAccessories
    .filter((a) => a.brand.toLowerCase() === mobile.brandName.toLowerCase())
    .slice(0, 6);

  const similarMobiles = normalizedMobiles
    .filter((m) => m.brandName === mobile.brandName && m.slug !== mobile.slug)
    .slice(0, 4);

  const reviews = [
    {
      _id: 'rev-1',
      rating: 5,
      title: 'Superb Flagship Experience',
      comment: 'Camera is incredible, display is brilliant under direct Indian sunlight, and battery easily lasts 1.5 days.',
      user: { name: 'Vikram Mehta' },
      createdAt: '2024-03-15T10:00:00Z',
    },
    {
      _id: 'rev-2',
      rating: 5,
      title: 'Best value in this segment',
      comment: 'Blazing fast Snapdragon processor, smooth 120Hz refresh rate and prompt doorstep delivery.',
      user: { name: 'Sneha Reddy' },
      createdAt: '2024-04-01T14:30:00Z',
    },
  ];

  return {
    success: true,
    data: {
      mobile,
      accessories,
      similarMobiles,
      reviews,
    },
    message: 'Mobile details retrieved (Demo Mode)',
  };
};

export const getMockCompare = (slugsStr) => {
  if (!slugsStr) return { success: true, data: [] };
  const slugs = slugsStr.split(',').map((s) => s.trim().toLowerCase());
  const found = normalizedMobiles.filter((m) => slugs.includes(m.slug.toLowerCase()));
  return {
    success: true,
    data: found.length > 0 ? found : normalizedMobiles.slice(0, 2),
    message: 'Comparison data loaded (Demo Mode)',
  };
};

export const getMockBrands = () => {
  return {
    success: true,
    data: mockBrands,
    message: 'Brands retrieved (Demo Mode)',
  };
};

export const getMockAccessoriesList = (params = {}) => {
  let list = [...allAccessories];
  if (params.type) {
    list = list.filter((a) => a.type.toLowerCase() === params.type.toLowerCase());
  }
  if (params.brand) {
    list = list.filter((a) => a.brand.toLowerCase() === params.brand.toLowerCase());
  }
  return {
    success: true,
    data: list,
    meta: {
      total: list.length,
      page: 1,
      limit: list.length,
      totalPages: 1,
    },
    message: 'Accessories retrieved (Demo Mode)',
  };
};

export const getMockAccessoryBySlug = (slug) => {
  const acc =
    allAccessories.find((a) => a.slug.toLowerCase() === (slug || '').toLowerCase()) ||
    allAccessories[0];
  return {
    success: true,
    data: acc,
    message: 'Accessory details retrieved (Demo Mode)',
  };
};

export const getMockServicesList = (params = {}) => {
  let list = [...mockServices];
  if (params.category) {
    list = list.filter((s) => s.category.toLowerCase().includes(params.category.toLowerCase()));
  }
  if (params.city) {
    list = list.filter((s) => s.availableCities.includes(params.city));
  }
  return {
    success: true,
    data: list,
    message: 'Services retrieved (Demo Mode)',
  };
};
