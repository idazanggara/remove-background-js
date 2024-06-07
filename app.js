const sharp = require('sharp')

async function removeBackground(imagePath, outputPath) {
  try {
    const image = sharp(imagePath)
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const threshold = 30 // Threshold ini perlu disesuaikan

    function isSimilarColor(index, baseColor) {
      return Math.abs(data[index] - baseColor.r) < threshold &&
        Math.abs(data[index + 1] - baseColor.g) < threshold &&
        Math.abs(data[index + 2] - baseColor.b) < threshold
    }

    // Asumsikan background color adalah rata-rata warna dari beberapa pixel di tepi
    const cornerSampleSize = 10 // Ambil sampel dari 10 pixel di setiap sudut
    let baseColor = { r: 0, g: 0, b: 0 }
    let count = 0

    // Sampel dari sudut kiri atas
    for (let y = 0; y < cornerSampleSize; y++) {
      for (let x = 0; x < cornerSampleSize; x++) {
        let idx = (info.width * y + x) * 4
        baseColor.r += data[idx]
        baseColor.g += data[idx + 1]
        baseColor.b += data[idx + 2]
        count++
      }
    }

    // Hitung rata-rata warna
    baseColor.r /= count
    baseColor.g /= count
    baseColor.b /= count

    // Buat background menjadi transparan
    for (let i = 0; i < data.length; i += 4) {
      if (isSimilarColor(i, baseColor)) {
        // Set alpha channel menjadi 0 untuk transparansi
        data[i + 3] = 0
      }
    }

    // Output gambar sebagai PNG
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4 // RGB + Alpha
      }
    }).toFormat('png').toFile(outputPath)

    console.log('Background removal completed and saved to', outputPath)
  } catch (error) {
    console.error('Error processing image:', error)
  }
}

// Ambil input dan output file name dari argumen terminal
const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node app.js <inputFileNameAndExtention> <outputFileName>')
  process.exit(1)
}

const inputFileName = args[0]
const outputFileName = args[1]

// Silahkan buat folder input dan output bebas dimanapun dan jangan lupa ubah path dibawah ini
const inputPath = `/Users/idazanggara/Enigmacamp/Lecture/#16/Frontend/bgRv/input/${inputFileName}`
const outputPath = `/Users/idazanggara/Enigmacamp/Lecture/#16/Frontend/bgRv/ouput/${outputFileName}.png`

removeBackground(inputPath, outputPath)
