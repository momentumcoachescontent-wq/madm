import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: {
    client: 'src/client/index.ts',
    admin: 'src/client/admin.ts',
  },
  bundle: true,
  outdir: 'public/static',
  minify: true,
  sourcemap: true,
  platform: 'browser',
  target: ['es2020'],
  format: 'iife',
});

if (watch) {
  await ctx.watch();
  console.log('Watching client bundles...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Client bundles built successfully: public/static/');
}
