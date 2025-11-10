import { build } from 'esbuild';
import { execSync } from 'node:child_process';

// 1) Transpila TS a dist-tmp según tsconfig.json
execSync('npx tsc', { stdio: 'inherit' });

// 2) Bundle a IIFE para Apps Script
await build({
  entryPoints: ['dist-tmp/main.js'],       // main.js lo generamos más abajo en server/main.ts
  bundle: true,
  outfile: 'dist/bundle.js',
  target: 'es2020',
  format: 'iife',
  // No usamos globalName para evitar encapsulado, nosotros exponemos manualmente a globalThis
});

// 3) Copia assets (HTML + manifest) a dist/
execSync('npx cpx "src/web/**/*" dist', { stdio: 'inherit' });
execSync('npx cpx "src/appsscript.json" dist', { stdio: 'inherit' });

console.log('✔ Build completo: dist/bundle.js + assets copiados.');