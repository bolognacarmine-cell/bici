import { v2 as cloudinary } from 'cloudinary'

let configured = false

export function getCloudinary() {
  if (!configured) {
    const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const
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

export async function uploadImageBuffer(buffer: Buffer, opts?: { folder?: string }) {
  const cld = getCloudinary()
  return await new Promise<any>((resolve, reject) => {
    const stream = cld.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: opts?.folder || 'promotions',
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

export async function deleteByPublicId(publicId: string) {
  const cld = getCloudinary()
  const id = String(publicId || '').trim()
  if (!id) return { result: 'not_found' }
  return await cld.uploader.destroy(id, { resource_type: 'image', invalidate: true })
}

