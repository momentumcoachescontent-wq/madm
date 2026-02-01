import { decode as decodeJpeg, encode as encodeJpeg } from '@jsquash/jpeg'
import { decode as decodePng } from '@jsquash/png'
import resize from '@jsquash/resize'

export interface ProcessedImage {
  data: ArrayBuffer | ReadableStream
  contentType: string
}

export async function processImage(file: File, targetWidth?: number): Promise<ProcessedImage> {
  // Default: return original stream
  let fileData: ArrayBuffer | ReadableStream = file.stream()
  let contentType = file.type

  if (targetWidth && targetWidth > 0 && targetWidth <= 2000) {
    try {
      let imageData: ImageData | null = null
      const buffer = await file.arrayBuffer()

      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        imageData = await decodeJpeg(buffer)
      } else if (file.type === 'image/png') {
        imageData = await decodePng(buffer)
      }

      if (imageData) {
        // Calculate height to maintain aspect ratio
        const targetHeight = Math.round(imageData.height * (targetWidth / imageData.width))

        const resizedData = await resize(imageData, {
          width: targetWidth,
          height: targetHeight
        })

        // Always encode to JPEG for thumbnails to ensure consistency and compression
        const newBuffer = await encodeJpeg(resizedData)

        fileData = newBuffer
        contentType = 'image/jpeg'
      }
    } catch (e) {
      console.error('Resize failed, falling back to original:', e)
      // Reset stream from original file
      fileData = file.stream()
      contentType = file.type
    }
  }

  return { data: fileData, contentType }
}
