import fs from 'fs';
import path from 'path';

const distAssets = path.resolve(process.cwd(), 'dist', 'assets');
const distBrand = path.resolve(process.cwd(), 'dist', 'brand');
const distIndex = path.resolve(process.cwd(), 'dist', 'index.html');
const backendPublic = path.resolve(process.cwd(), '..', 'dsh-backend', 'public');
const targetAssets = path.resolve(backendPublic, 'assets');
const targetBrand = path.resolve(backendPublic, 'brand');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sync() {
  if (!fs.existsSync(distAssets)) {
    console.error('dist/assets not found. Run build first.');
    process.exit(1);
  }
  ensureDir(targetAssets);
  ensureDir(targetBrand);

  const srcFiles = fs.readdirSync(distAssets);
  const dstFiles = fs.readdirSync(targetAssets);

  // Copy/overwrite files from dist to backend public assets
  srcFiles.forEach(f => {
    const src = path.join(distAssets, f);
    const dst = path.join(targetAssets, f);
    fs.copyFileSync(src, dst);
    console.log('copied', f);
  });

  // Remove files in target that aren't in dist
  dstFiles.forEach(f => {
    if (!srcFiles.includes(f)) {
      try {
        fs.unlinkSync(path.join(targetAssets, f));
        console.log('removed stale', f);
      } catch (e) {
        // ignore
      }
    }
  });

  if (fs.existsSync(distBrand)) {
    const brandFiles = fs.readdirSync(distBrand);
    const targetBrandFiles = fs.readdirSync(targetBrand);

    brandFiles.forEach(f => {
      fs.copyFileSync(path.join(distBrand, f), path.join(targetBrand, f));
      console.log('copied brand', f);
    });

    targetBrandFiles.forEach(f => {
      if (!brandFiles.includes(f)) {
        fs.unlinkSync(path.join(targetBrand, f));
        console.log('removed stale brand', f);
      }
    });
  }

  if (fs.existsSync(distIndex)) {
    fs.copyFileSync(distIndex, path.resolve(backendPublic, 'app.html'));
    console.log('copied app.html');
  }
}

sync();
