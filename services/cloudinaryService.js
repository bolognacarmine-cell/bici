import { getCloudinary } from '../config/cloudinary.js'

export function uploadImageBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary()
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: options.folder || 'promotions',
        use_filename: true,
        unique_filename: true,
      },
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

export async function deleteByPublicId(publicId) {
  const cloudinary = getCloudinary()
  const id = String(publicId || '').trim()
  if (!id) return { result: 'not_found' }
  return cloudinary.uploader.destroy(id, { resource_type: 'image', invalidate: true })
}

