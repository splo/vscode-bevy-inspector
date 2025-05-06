import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import * as console from 'node:console';
import * as process from 'node:process';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  console.info(`Production mode: ${production ? 'enabled' : 'disabled'}`);
  console.info(`Watch mode: ${watch ? 'enabled' : 'disabled'}`);
  /** @type {import('esbuild').BuildOptions[]} */
  const buildOptions = [
    {
      entryPoints: ['src/components-view/index.tsx', 'src/resources-view/index.tsx'],
      bundle: true,
      format: 'esm',
      minify: production,
      sourcemap: true,
      sourcesContent: false,
      legalComments: 'none',
      platform: 'browser',
      outdir: 'dist',
      external: ['vscode'],
      logLevel: 'silent',
      plugins: [
        esbuildProblemMatcherPlugin,
        copy({
          resolveFrom: 'cwd',
          assets: {
            from: ['./src/**/index.html'],
            to: ['./dist'],
          },
          watch,
        }),
        copy({
          resolveFrom: 'cwd',
          assets: {
            from: ['./node_modules/@vscode/codicons/dist/codicon.{css,ttf}'],
            to: ['./dist'],
          },
          watch,
        }),
      ],
    },
    {
      entryPoints: ['src/extension/index.ts'],
      bundle: true,
      format: 'cjs',
      minify: production,
      sourcemap: true,
      sourcesContent: false,
      legalComments: 'none',
      platform: 'node',
      target: 'node20',
      outdir: 'dist/extension',
      external: ['vscode'],
      logLevel: 'silent',
      plugins: [esbuildProblemMatcherPlugin],
    },
  ];
  const contexts = await Promise.all(buildOptions.map(esbuild.context));
  if (watch) {
    await Promise.all(contexts.map((context) => context.watch()));
  } else {
    await Promise.all(contexts.map((context) => context.rebuild()));
    await Promise.all(contexts.map((context) => context.dispose()));
  }
}

/** @type {import('esbuild').Plugin} */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log(`${watch ? '[watch] ' : ''}build started`);
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log(`${watch ? '[watch] ' : ''}build finished`);
    });
  },
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
