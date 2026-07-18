/**
 * Widget-only static export (esbuild → src/widgets/out/*.html).
 * Mirrors @nitrostack/cli build widget bundling; skips MCP tsc when dist is current.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const projectRoot = process.argv[2];
if (!projectRoot) {
  console.error('Usage: node build-widgets-static.mjs <projectRoot>');
  process.exit(1);
}

const widgetsPath = path.resolve(projectRoot, 'src', 'widgets');
const widgetsPackageJsonPath = path.join(widgetsPath, 'package.json');
if (!fs.existsSync(widgetsPackageJsonPath)) {
  console.error('No src/widgets/package.json found');
  process.exit(1);
}

const cliRoot = path.join(projectRoot, 'node_modules', '@nitrostack', 'cli');
if (!fs.existsSync(path.join(cliRoot, 'package.json'))) {
  console.error('@nitrostack/cli is not installed in the project — run npm install at the project root');
  process.exit(1);
}

const require = createRequire(path.join(cliRoot, 'package.json'));
const esbuild = require('esbuild');

const widgetsNodeModulesPath = path.join(widgetsPath, 'node_modules');
if (!fs.existsSync(widgetsNodeModulesPath)) {
  console.error('Widget dependencies missing — run npm install in src/widgets');
  process.exit(1);
}

const APP_DIR = path.join(widgetsPath, 'app');
const OUT_DIR = path.join(widgetsPath, 'out');

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const widgetPages = [];

function findWidgetPages(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      findWidgetPages(fullPath, relativePath);
    } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx') {
      const widgetName = basePath || 'index';
      widgetPages.push({
        name: widgetName,
        entryPoint: fullPath,
        outputName: widgetName.replace(/\//g, '-'),
      });
    }
  }
}

if (fs.existsSync(APP_DIR)) {
  findWidgetPages(APP_DIR);
}

const widgetsNm = path.join(widgetsPath, 'node_modules');
const widgetReactAliases = {
  react: path.join(widgetsNm, 'react'),
  'react-dom': path.join(widgetsNm, 'react-dom'),
  'react/jsx-runtime': path.join(widgetsNm, 'react', 'jsx-runtime.js'),
  'react/jsx-dev-runtime': path.join(widgetsNm, 'react', 'jsx-dev-runtime.js'),
};

for (const widget of widgetPages) {
  const tempEntry = path.join(OUT_DIR, `_temp_${widget.outputName}.jsx`);
  const jsOutput = path.join(OUT_DIR, `${widget.outputName}.js`);
  const htmlOutput = path.join(OUT_DIR, `${widget.outputName}.html`);

  const entryCode = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import WidgetPage from '${widget.entryPoint.replace(/\\/g, '/')}';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  const data = window.openai?.toolOutput || {};
  let root = document.getElementById('widget-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'widget-root';
    document.body.appendChild(root);
  }
  const reactRoot = createRoot(root);
  reactRoot.render(React.createElement(WidgetPage, { data }));
}
`;

  fs.writeFileSync(tempEntry, entryCode);
  await esbuild.build({
    entryPoints: [tempEntry],
    bundle: true,
    format: 'iife',
    outfile: jsOutput,
    platform: 'browser',
    target: ['es2020'],
    minify: true,
    jsx: 'automatic',
    jsxImportSource: 'react',
    external: [],
    nodePaths: [widgetsNm],
    alias: widgetReactAliases,
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
  });

  const bundledJs = fs.readFileSync(jsOutput, 'utf-8');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #widget-root { width: 100%; min-height: 100vh; }
  </style>
</head>
<body>
  <div id="widget-root"></div>
  <script>${bundledJs}</script>
</body>
</html>`;
  fs.writeFileSync(htmlOutput, html);
  fs.unlinkSync(tempEntry);
  fs.unlinkSync(jsOutput);
}

if (widgetPages.length === 0) {
  console.error('No widget pages found under src/widgets/app');
  process.exit(1);
}

console.log(`Widget static export complete (${widgetPages.length} widget(s))`);
