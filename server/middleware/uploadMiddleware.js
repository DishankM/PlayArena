import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const createStorage = (folder, formats) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: formats,
      resource_type: 'image',
    },
  })

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'), false)
  cb(null, true)
}

export const uploadProduct = multer({
  storage: createStorage('playarena/products', ['jpg', 'jpeg', 'png', 'webp']),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).array('images', 6)

export const uploadAvatar = multer({
  storage: createStorage('playarena/avatars', ['jpg', 'jpeg', 'png']),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
}).single('avatar')

export const uploadTournamentPoster = multer({
  storage: createStorage('playarena/tournaments', ['jpg', 'jpeg', 'png', 'webp']),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
}).single('poster')
