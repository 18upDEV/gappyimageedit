export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * This function was adapted from the one in the react-easy-crop project.
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // Set a maximum dimension to prevent massive canvas operations that cause lag
  const MAX_DIMENSION = 1500;
  let scale = 1;
  if (pixelCrop.width > MAX_DIMENSION || pixelCrop.height > MAX_DIMENSION) {
    scale = MAX_DIMENSION / Math.max(pixelCrop.width, pixelCrop.height);
  }

  // Set the canvas size to the scaled cropped size
  canvas.width = pixelCrop.width * scale;
  canvas.height = pixelCrop.height * scale;

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Apply the downscale
  ctx.scale(scale, scale);

  const rotRad = getRadianAngle(rotation)

  // Move the context to the center of the crop area
  ctx.translate(pixelCrop.width / 2, pixelCrop.height / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  
  // Draw the image relative to its center, offset by the crop coordinates
  // We need to translate back to the image center relative to the crop box center
  ctx.translate(
    -(pixelCrop.x + pixelCrop.width / 2) + image.width / 2,
    -(pixelCrop.y + pixelCrop.height / 2) + image.height / 2
  )
  
  // Draw the full image; the canvas will only capture the part within its width/height
  ctx.drawImage(image, -image.width / 2, -image.height / 2)

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (file) => {
        if (file) {
          resolve(URL.createObjectURL(file))
        } else {
          resolve(null)
        }
      },
      'image/png',
      1.0 // Maximum quality
    )
  })
}
