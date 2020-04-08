import fs from 'fs'
import png from 'pngjs'

const bufferToPng = (buffer, width, height, fileName) => {
  const genOutput = (inBuf, width, height) => {
    let pngImg = new png.PNG({ width, height })

    /* for (let i = 0; i < inBuf.length; ++i) {
      pngImg.data[i] = inBuf[i]
    } */
    // vertical flip

    for (let j = 0; j < height; ++j) { // from https://gist.github.com/bsergean
      for (let i = 0; i < width; ++i) {
        let k = j * width + i
        let r = inBuf[4 * k]
        let g = inBuf[4 * k + 1]
        let b = inBuf[4 * k + 2]
        let a = inBuf[4 * k + 3]

        // let m = (height - j + 1) * width + i
        let m = (height - j) * width + i
        pngImg.data[4 * m] = r
        pngImg.data[4 * m + 1] = g
        pngImg.data[4 * m + 2] = b
        pngImg.data[4 * m + 3] = a
      }
    }
    // pngImg.pack().pipe(fs.createWriteStream(fileName))
    /**
     * Use a sync write to avoid needing a promise.
     */
    fs.writeFileSync(fileName, png.PNG.sync.write(pngImg))
  }

  genOutput(buffer, width, height)
}
export default bufferToPng
