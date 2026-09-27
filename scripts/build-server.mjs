import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// Keep the compiled entrypoint at the project root: server.ts resolves dist/
// relative to import.meta.url, independently of the process working directory.
await build({
  entryPoints: [fileURLToPath(new URL('../server.ts', import.meta.url))],
  outfile: fileURLToPath(new URL('../server.js', import.meta.url)),
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  target: 'node22',
});
