// Rend quelques images fixes de la vidéo pour vérifier les visuels sans tout rendre.
// Usage : node preview-stills.mjs <dossier_sortie> <frame> [<frame>...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'Video', browserExecutable}); // COMP=Short pour un Short
for (const f of frames) {
  await renderStill({composition, serveUrl, frame: Number(f), output: path.join(outDir, `frame-${f}.png`), browserExecutable, scale: 0.5});
  console.log('ok', f);
}
