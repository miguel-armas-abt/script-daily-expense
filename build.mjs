import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// 1) Clean dist
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// 2) Direct bundle from TS (IIFE format)
await build({
  entryPoints: [path.join(SRC, 'main', 'index.ts')],
  bundle: true,
  outfile: path.join(DIST, 'bundle.js'),
  target: 'es2020',
  format: 'iife',
  globalName: 'App',
  platform: 'browser',
  sourcemap: true
});

// 3) Copy assets (HTML + manifest) to dist/
execSync('npx cpx "src/web/**/*" dist', { stdio: 'inherit' });
execSync('npx cpx "src/appsscript.json" dist', { stdio: 'inherit' });

// 4) Copy .gs
const shimSrc = path.join(SRC, 'main.gs');
if (!fs.existsSync(shimSrc)) {
  console.error('src/main.gs doesnt exist');
  process.exit(1);
}
fs.copyFileSync(shimSrc, path.join(DIST, 'main.gs'));

console.log('Build success');
