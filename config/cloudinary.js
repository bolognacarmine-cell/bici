import { v2 as cloudinary } from 'cloudinary'

let configured = false

export function getCloudinary() {
  if (!configured) {
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`${key} is required`)
      }
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
    configured = true
  }
  return cloudinary
}
