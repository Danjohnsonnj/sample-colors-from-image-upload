import DEFAULTS from './defaults.js'
import chroma from 'chroma-js'

class Sampler {
  constructor(sampleSize = DEFAULTS.sampleSize, samples = DEFAULTS.samples) {
    this.canvas = this.getCleanCanvas()
    this.ctx = this.canvas.getContext('2d')
    this.sampleSize = sampleSize
    this.samples = samples
  }

  getCleanCanvas() {
    if (this.canvas) {
      this.clearCanvas()
      return this.canvas
    }
    const canvas = document.createElement('canvas')
    canvas.classList.add('sampler')
    document.body.appendChild(canvas)
    return canvas
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImageToCanvas(img) {
    this.getCleanCanvas()
    this.canvas.width = 1000
    this.canvas.height = 1000 * img.naturalHeight / img.naturalWidth
    this.sampleSize = Math.min(
      this.sampleSize,
      Math.floor(this.canvas.width / this.samples),
      Math.floor(this.canvas.height / this.samples)
    )
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
  }

  getColorDataAtPoint(x, y, imageData) {
    const red = y * (imageData.width * 4) + x * 4
    const [redIndex, greenIndex, blueIndex, alphaIndex] = [red, red + 1, red + 2, red + 3]
    return [imageData.data[redIndex],
      imageData.data[greenIndex],
      imageData.data[blueIndex],
      imageData.data[alphaIndex] / 255
    ]
  }

  getColorAverage(x, y) {
    const width = this.sampleSize
    const height = this.sampleSize

    x = Math.min(Math.max(0, x - width / 2), this.canvas.width - 1 - width)
    y = Math.min(Math.max(0, y - height / 2), this.canvas.height - 1 - height)

    const imageData = this.ctx.getImageData(x, y, x + width, y + height)
    const colors = []
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        colors.push(this.getColorDataAtPoint(w, h, imageData))
      }
    }
    return chroma.average(colors).css()
  }

  getImageRatio() {
    return this.canvas.height / this.canvas.width
  }
}

export default Sampler