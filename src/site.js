class Sampler {
  constructor() {
    this.canvas = this.getCleanCanvas()
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
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImageToCanvas(img) {
    this.clearCanvas()
    this.canvas.width = img.naturalWidth
    this.canvas.height = img.naturalHeight
    this.ctx = this.canvas.getContext('2d')
    this.ctx.drawImage(img, 0, 0)
  }

  getColorDataAtPoint(x, y) {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const red = y * (this.canvas.width * 4) + x * 4
    const [redIndex, greenIndex, blueIndex, alphaIndex] = [red, red + 1, red + 2, red + 3]
    return [imageData.data[redIndex], imageData.data[greenIndex], imageData.data[blueIndex], imageData.data[alphaIndex]]
  }

  getColorPoints(img) {
    this.drawImageToCanvas(img)
    const colors = {}
    const width = this.canvas.width - 1
    const height = this.canvas.height - 1
    colors.tl = this.getColorDataAtPoint(0, 0)
    colors.tc = this.getColorDataAtPoint(Math.floor(width / 2), 0)
    colors.tr = this.getColorDataAtPoint(width, 0)
    colors.ml = this.getColorDataAtPoint(0, Math.floor(height / 2))
    colors.mc = this.getColorDataAtPoint(Math.floor(width / 2), Math.floor(height / 2))
    colors.mr = this.getColorDataAtPoint(width, Math.floor(height / 2))
    colors.bl = this.getColorDataAtPoint(0, height - 1)
    colors.bc = this.getColorDataAtPoint(Math.floor(width / 2), height - 1)
    colors.br = this.getColorDataAtPoint(width, height - 1)
    return colors
  }
}

class ImagePreview {
  constructor(input = document.querySelector('input'), preview = document.querySelector('.preview')) {
    this.input = input
    this.preview = preview
    this.fileTypes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png'
    ]

    // input.style.opacity = 0
    this.bindListeners()
    this.sampler = new Sampler()
  }

  bindListeners() {
    this.input.addEventListener('change', this.updateImageDisplay.bind(this))
  }

  validFileType(file) {
    for (var i = 0; i < this.fileTypes.length; i++) {
      if (file.type === this.fileTypes[i]) {
        return true;
      }
    }

    return false;
  }

  updateImageDisplay() {
    while (this.preview.firstChild) {
      this.preview.removeChild(this.preview.firstChild);
    }
    var curFiles = this.input.files
    let image = null
    if (curFiles.length === 0) {
      var para = document.createElement('p')
      para.textContent = 'No files currently selected for upload'
      this.preview.appendChild(para)
    } else {
      var para = document.createElement('p')
      for (var i = 0; i < curFiles.length; i++) {
        if (this.validFileType(curFiles[i])) {
          para.textContent = `File name ${curFiles[i].name}, file size ${this.returnFileSize(curFiles[i].size)}.`
          image = document.createElement('img')
          image.addEventListener('load', () => {
            console.log(this.sampler.getColorPoints(image))
          })
          image.src = window.URL.createObjectURL(curFiles[i])

          this.preview.appendChild(image)
          this.preview.appendChild(para)

        } else {
          para.textContent = `File name ${curFiles[i].name}: Not a valid file type. Update your selection.`
          this.preview.appendChild(para)
        }
      }
    }
  }

  returnFileSize(number) {
    if (number < 1024) {
      return number + 'bytes';
    } else if (number > 1024 && number < 1048576) {
      return (number / 1024).toFixed(1) + 'KB';
    } else if (number > 1048576) {
      return (number / 1048576).toFixed(1) + 'MB';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.previewer = new ImagePreview()
})
