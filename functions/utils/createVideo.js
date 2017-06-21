const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const Ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
Ffmpeg.setFfmpegPath(ffmpegPath)

module.exports = function (fileName, images, delay, imageSize, batch) {
  console.time('create video')
  return new Promise((resolve, reject) => {
    const files = images
      .map(({img, length}, i) => i === images.length - 1
        ? `file ${img}\nduration 3\nfile ${img}`
        : `file ${img}\nduration ${delay * length}\n`
      )
      .join('')
      .replace(/,/g, '')
    fs.writeFileSync(`/tmp/${fileName}.txt`, files)

    new Ffmpeg()
      .size(`${imageSize}x${imageSize}`)
      .addInput(`/tmp/${fileName}.txt`)
      .inputOptions(['-safe 0', '-f concat'])
      .on('error', reject)
      .on('end', () => {
        console.timeEnd('create video')
        resolve(`/tmp/${fileName}.mp4`)
      })
      .output(`/tmp/${fileName}.mp4`)
      .run()
  })
}
