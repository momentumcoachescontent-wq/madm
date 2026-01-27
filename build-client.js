import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/client/index.ts'],
  bundle: true,
  outfile: 'public/static/client.js',
  minify: true,
  sourcemap: true,
  platform: 'browser',
  target: ['es2020'],
  format: 'iife',
});

if (watch) {
  await ctx.watch();
  console.log('Watching client bundle...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Client bundle built successfully: public/static/client.js');
}
