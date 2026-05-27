// server/scripts/seedDB.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })

import User from '../models/User.js'
import Product from '../models/Product.js'
import Tournament from '../models/Tournament.js'
import Coupon from '../models/Coupon.js'

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB for seeding...')

  if (process.env.NODE_ENV !== 'production') {
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Tournament.deleteMany({}),
      Coupon.deleteMany({}),
    ])
    console.log('Cleared existing seed data')
  }

  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await User.create({
    name: 'PlayArena Admin',
    email: 'admin@playarena.com',
    password: adminPassword,
    role: 'admin',
    phone: '+91 98000 00001',
    isActive: true,
  })

  const userPassword = await bcrypt.hash('User@1234', 12)
  await User.insertMany([
    {
      name: 'Rahul Sharma',
      email: 'rahul@test.com',
      password: userPassword,
      phone: '+91 98234 56789',
      nxlCredits: 1240,
      walletBalance: 450,
      address: {
        street: '14 Sai Nagar',
        city: 'Nashik',
        state: 'Maharashtra',
        pincode: '422005',
        country: 'India',
      },
    },
    {
      name: 'Priya Nair',
      email: 'priya@test.com',
      password: userPassword,
      phone: '+91 97654 32100',
      nxlCredits: 650,
      walletBalance: 200,
      address: {
        street: '8B Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        country: 'India',
      },
    },
    {
      name: 'Arjun Mehta',
      email: 'arjun@test.com',
      password: userPassword,
      phone: '+91 99887 65432',
      nxlCredits: 2100,
      walletBalance: 750,
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha@test.com',
      password: userPassword,
      phone: '+91 98123 45678',
      nxlCredits: 320,
      walletBalance: 0,
    },
    {
      name: 'Rohit Desai',
      email: 'rohit@test.com',
      password: userPassword,
      phone: '+91 97001 23456',
      nxlCredits: 890,
      walletBalance: 300,
    },
  ])

  await Product.insertMany([
    {
      name: 'Arena Pro Badminton Shoes',
      slug: 'arena-pro-badminton-shoes',
      description:
        'Lightweight non-marking shoes with reinforced toe cap and cushioned midsole. Designed for quick lateral movement on court. Available in sizes 6-12.',
      price: 1299,
      originalPrice: 1799,
      category: 'shoes',
      sport: 'badminton',
      stock: 45,
      isFeatured: true,
      nxlEarnRate: 5,
      ratings: { average: 4.3, count: 84 },
    },
    {
      name: 'Dri-Fit Sports Jersey',
      slug: 'dri-fit-sports-jersey',
      description:
        'Moisture-wicking polyester jersey with mesh ventilation panels. Odour-resistant treatment. Available in 6 colours and sizes XS-XXL.',
      price: 699,
      originalPrice: 999,
      category: 'jerseys',
      sport: 'general',
      stock: 120,
      isFeatured: true,
      nxlEarnRate: 5,
      ratings: { average: 4.7, count: 210 },
    },
    {
      name: 'Carbon Pro Badminton Racket',
      slug: 'carbon-pro-badminton-racket',
      description:
        'Full carbon frame with isometric head shape. Pre-strung at 24 lbs. Weight 85g. Ideal for smash-heavy attacking play.',
      price: 2499,
      originalPrice: 3299,
      category: 'rackets',
      sport: 'badminton',
      stock: 28,
      isFeatured: true,
      nxlEarnRate: 5,
      ratings: { average: 4.5, count: 56 },
    },
    {
      name: 'Nike Strike Football',
      slug: 'nike-strike-football',
      description:
        'FIFA quality pro football with aerow groove technology. Machine-stitched. Butyl bladder for excellent air retention. Size 5.',
      price: 1899,
      originalPrice: 2499,
      category: 'footballs',
      sport: 'football',
      stock: 35,
      isFeatured: true,
      nxlEarnRate: 5,
      ratings: { average: 4.6, count: 142 },
    },
    {
      name: 'Arena Protein Shaker 700ml',
      slug: 'arena-protein-shaker',
      description:
        'BPA-free Tritan plastic with stainless steel blending ball. Leak-proof flip lid. Graduated markings. Dishwasher safe.',
      price: 399,
      originalPrice: 599,
      category: 'gym-accessories',
      sport: 'gym',
      stock: 200,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.1, count: 320 },
    },
    {
      name: 'Sport Blue Eau de Toilette 100ml',
      slug: 'sport-blue-eau-de-toilette',
      description:
        'Fresh aquatic sport fragrance with bergamot top note, ocean heart, and warm woody base. Lasts 8-10 hours. Alcohol-free formula.',
      price: 899,
      originalPrice: 1199,
      category: 'perfumes',
      sport: 'general',
      stock: 60,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.4, count: 78 },
    },
    {
      name: 'Insulated Steel Water Bottle 750ml',
      slug: 'insulated-steel-water-bottle',
      description:
        'Double-wall vacuum insulated 18/8 stainless steel. Keeps beverages cold 24hr, hot 12hr. Spill-proof sports lid.',
      price: 549,
      originalPrice: 799,
      category: 'water-bottles',
      sport: 'general',
      stock: 85,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.8, count: 450 },
    },
    {
      name: 'Table Tennis Pro Blade',
      slug: 'table-tennis-pro-blade',
      description:
        '5-ply all-wood blade with ITTF approved rubber sheets. Speed rating 85, Control 90. Ideal for all-round offensive play.',
      price: 1599,
      originalPrice: 1999,
      category: 'rackets',
      sport: 'table-tennis',
      stock: 22,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.2, count: 33 },
    },
    {
      name: 'Running Compression Socks',
      slug: 'running-compression-socks',
      description:
        'Graduated compression 20-30 mmHg. Arch support and cushioned heel. Anti-blister technology. Pack of 3 pairs.',
      price: 449,
      originalPrice: 649,
      category: 'gym-accessories',
      sport: 'running',
      stock: 150,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.0, count: 95 },
    },
    {
      name: 'Tennis Training Ball Hopper',
      slug: 'tennis-training-ball-hopper',
      description:
        'Holds 72 tennis balls. Folds flat for storage. Doubles as a seat during practice. Stainless steel frame with rubber feet.',
      price: 1199,
      originalPrice: 1599,
      category: 'gym-accessories',
      sport: 'tennis',
      stock: 18,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.3, count: 27 },
    },
    {
      name: 'Football Goalkeeper Gloves',
      slug: 'football-goalkeeper-gloves',
      description:
        'German latex palm for superior grip. 4mm foam backing. Finger save spines included. Available sizes 6-11.',
      price: 799,
      originalPrice: 1099,
      category: 'gym-accessories',
      sport: 'football',
      stock: 40,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.1, count: 61 },
    },
    {
      name: 'Sport Backpack 30L',
      slug: 'sport-backpack-30l',
      description:
        'Separate wet/dry compartment. Padded laptop sleeve (15 inch). Side water bottle pockets. Reflective strips for safety.',
      price: 1499,
      originalPrice: 1999,
      category: 'gym-accessories',
      sport: 'general',
      stock: 55,
      isFeatured: false,
      nxlEarnRate: 5,
      ratings: { average: 4.5, count: 188 },
    },
  ])

  await Tournament.insertMany([
    {
      name: 'Nashik Badminton Open 2026',
      description:
        'Annual badminton championship open to all skill levels. Indoor air-conditioned courts. Professional umpires. Complimentary refreshments.',
      sport: 'Badminton',
      type: 'indoor',
      format: 'solo',
      entryFee: 199,
      prize: '₹15,000 + Trophy',
      maxSlots: 64,
      filledSlots: 54,
      startDate: new Date('2026-02-08T09:00:00'),
      endDate: new Date('2026-02-09T18:00:00'),
      venue: 'Nashik Indoor Stadium, Gangapur Road, Nashik',
      status: 'open',
      nxlReward: 100,
      createdBy: admin._id,
      rules: [
        'Players must carry government ID proof',
        'Match format: Best of 3 sets, 21 points each',
        'Check-in 30 minutes before scheduled match time',
        'Rackets and shuttles provided by organizers',
        'No coaching from the stands during match',
      ],
    },
    {
      name: 'Pune Football 5s League',
      description:
        'Fast-paced 5-a-side football tournament on artificial turf. Teams compete in groups then knockouts. Evening matches under floodlights.',
      sport: 'Football',
      type: 'outdoor',
      format: 'team',
      entryFee: 999,
      prize: '₹50,000 + Medals',
      maxSlots: 16,
      filledSlots: 11,
      startDate: new Date('2026-02-15T08:00:00'),
      endDate: new Date('2026-02-16T20:00:00'),
      venue: 'Balewadi Sports Complex, Pune',
      status: 'open',
      nxlReward: 250,
      createdBy: admin._id,
      rules: [
        'Teams must have minimum 5 players, maximum 7',
        'Players must be 16 years or above',
        'Football boots required — no metal studs on turf',
        '2 yellow cards = 1 match suspension',
        'Rolling substitutions permitted',
      ],
    },
    {
      name: 'TT Championship Series — Nashik',
      description:
        'Competitive table tennis tournament for intermediate and advanced players. ITTF standard tables.',
      sport: 'Table Tennis',
      type: 'indoor',
      format: 'solo',
      entryFee: 149,
      prize: '₹8,000 + Certificate',
      maxSlots: 32,
      filledSlots: 32,
      startDate: new Date('2026-01-25T10:00:00'),
      endDate: new Date('2026-01-25T19:00:00'),
      venue: 'Arena Sports Center, College Road, Nashik',
      status: 'ongoing',
      nxlReward: 75,
      createdBy: admin._id,
      rules: [
        'ITTF approved equipment mandatory',
        'Best of 5 games, 11 points each',
        'Service rules strictly enforced',
        'Umpire decision is final and binding',
      ],
    },
    {
      name: 'Mumbai 10K Marathon Qualifier',
      description:
        'Scenic 10km route along Marine Drive. Chip-timed race. Finisher medal and certificate for all completers.',
      sport: 'Running',
      type: 'outdoor',
      format: 'solo',
      entryFee: 299,
      prize: 'Finisher Medal + Certificate',
      maxSlots: 500,
      filledSlots: 387,
      startDate: new Date('2026-03-01T06:00:00'),
      endDate: new Date('2026-03-01T12:00:00'),
      venue: 'Marine Lines Starting Point, Mumbai',
      status: 'open',
      nxlReward: 50,
      createdBy: admin._id,
      rules: [
        'Distance: 10km qualifier route',
        'Minimum age: 18 years',
        'GPS timing chip included in registration kit',
        'Medical certificate required for 40+ participants',
        'Withdrawal 48hr before event — no refund',
      ],
    },
    {
      name: 'Hyderabad Tennis Doubles Open',
      description:
        'Doubles tennis tournament at Lal Bahadur Stadium. Mix of amateur and advanced pairs. Standard AITA rules.',
      sport: 'Tennis',
      type: 'outdoor',
      format: 'doubles',
      entryFee: 599,
      prize: '₹25,000 + Trophies',
      maxSlots: 24,
      filledSlots: 18,
      startDate: new Date('2026-02-22T09:00:00'),
      endDate: new Date('2026-02-23T18:00:00'),
      venue: 'Lal Bahadur Stadium, Hyderabad',
      status: 'open',
      nxlReward: 150,
      createdBy: admin._id,
      rules: [
        'Pairs must register together as a unit',
        'Standard tennis scoring — 6 games per set',
        'Own rackets mandatory',
        'Proper tennis attire required — no casual wear',
      ],
    },
  ])

  await Coupon.insertMany([
    {
      code: 'PLAY10',
      discountType: 'percent',
      discountValue: 10,
      minOrderAmount: 500,
      maxUses: 1000,
      expiresAt: new Date('2026-12-31'),
      isActive: true,
    },
    {
      code: 'FIRST50',
      discountType: 'flat',
      discountValue: 50,
      minOrderAmount: 299,
      maxUses: 500,
      expiresAt: new Date('2026-06-30'),
      isActive: true,
    },
    {
      code: 'SPORT200',
      discountType: 'flat',
      discountValue: 200,
      minOrderAmount: 1500,
      maxUses: 200,
      expiresAt: new Date('2026-03-31'),
      isActive: true,
    },
    {
      code: 'NXL20',
      discountType: 'percent',
      discountValue: 20,
      minOrderAmount: 1000,
      maxUses: 100,
      expiresAt: new Date('2026-02-28'),
      isActive: true,
    },
  ])

  console.log('✅ Seed complete!')
  console.log('Admin login: admin@playarena.com / Admin@123')
  console.log('Test user:   rahul@test.com / User@1234')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
