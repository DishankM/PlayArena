// server/utils/aggregations.js

export const revenueByDayPipeline = (days = 7) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  return [
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        orders: 1,
      },
    },
  ]
}

export const topProductsPipeline = (limit = 5) => [
  { $match: { paymentStatus: 'paid' } },
  { $unwind: '$items' },
  {
    $group: {
      _id: '$items.product',
      totalSold: { $sum: '$items.quantity' },
      revenue: {
        $sum: { $multiply: ['$items.price', '$items.quantity'] },
      },
    },
  },
  { $sort: { totalSold: -1 } },
  { $limit: limit },
  {
    $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'product',
    },
  },
  { $unwind: '$product' },
  {
    $project: {
      _id: 0,
      productId: '$_id',
      name: '$product.name',
      category: '$product.category',
      totalSold: 1,
      revenue: 1,
    },
  },
]

export const revenueByCategoryPipeline = () => [
  { $match: { paymentStatus: 'paid' } },
  { $unwind: '$items' },
  {
    $lookup: {
      from: 'products',
      localField: 'items.product',
      foreignField: '_id',
      as: 'productInfo',
    },
  },
  { $unwind: '$productInfo' },
  {
    $group: {
      _id: '$productInfo.category',
      revenue: {
        $sum: { $multiply: ['$items.price', '$items.quantity'] },
      },
      count: { $sum: '$items.quantity' },
    },
  },
  { $sort: { revenue: -1 } },
  {
    $project: {
      _id: 0,
      category: '$_id',
      revenue: 1,
      count: 1,
    },
  },
]

export const nxlSummaryPipeline = () => [
  {
    $group: {
      _id: '$type',
      total: { $sum: '$nxlAmount' },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      type: '$_id',
      total: 1,
      count: 1,
    },
  },
]

export const registrationsBySportPipeline = () => [
  {
    $lookup: {
      from: 'tournaments',
      localField: 'tournament',
      foreignField: '_id',
      as: 'tournamentInfo',
    },
  },
  { $unwind: '$tournamentInfo' },
  {
    $group: {
      _id: '$tournamentInfo.sport',
      count: { $sum: 1 },
      paid: {
        $sum: {
          $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0],
        },
      },
    },
  },
  { $sort: { count: -1 } },
  {
    $project: {
      _id: 0,
      sport: '$_id',
      count: 1,
      paid: 1,
    },
  },
]

export const ordersByStatusPipeline = () => [
  {
    $group: {
      _id: '$orderStatus',
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      status: '$_id',
      count: 1,
    },
  },
]

export const userGrowthPipeline = (days = 30) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  return [
    {
      $match: {
        role: 'user',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1,
      },
    },
  ]
}
