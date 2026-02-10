import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'public/logo_small.png';
const outputPath = 'public/logo_small_fixed.png';

async function processIcon() {
  try {
    console.log(`Processing ${inputPath}...`);
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);
    
    // Trim whitespace
    const trimmed = image.trim();
    const trimmedMeta = await trimmed.metadata();
    console.log(`Trimmed dimensions: ${trimmedMeta.width}x${trimmedMeta.height}`);
    
    // Resize to max 512x512 while keeping aspect ratio, just to be safe for web use
    // But user just said remove whitespace.
    // If it's huge (4MB), we should probably resize it for a favicon.
    // Favicons are usually small.
    // Let's resize to height 64, letting width adjust, or fit in 64x64.
    // But if it's for "tab logo", higher res is better for retina. 
    // Let's go with 128px height.
    
    await trimmed
      .resize({ height: 128, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(outputPath);
      
    console.log(`Saved to ${outputPath}`);
    
  } catch (error) {
    console.error('Error processing icon:', error);
  }
}

processIcon();
