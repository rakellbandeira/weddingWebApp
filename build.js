const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify: minifyHTML } = require('html-minifier');
const CleanCSS = require('clean-css');


const obfuscationOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  renameGlobals: false,
  rotateStringArray: true,
  selfDefending: true,
  shuffleStringArray: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// HTML minification options
const htmlMinifyOptions = {
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: false 
};

function buildProject() {
  console.log('🚀 Starting build process...');
  

  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  
  console.log('🔒 Obfuscating JavaScript...');
  const jsContent = fs.readFileSync(path.join('public', 'js', 'scripts.js'), 'utf8');
  const obfuscatedJS = JavaScriptObfuscator.obfuscate(jsContent, obfuscationOptions);
  
  // Create js directory in dist
  if (!fs.existsSync(path.join('dist', 'js'))) {
    fs.mkdirSync(path.join('dist', 'js'), { recursive: true });
  }
  fs.writeFileSync(path.join('dist', 'js', 'scripts.js'), obfuscatedJS.getObfuscatedCode());
  
  // Minify CSS
  console.log('🎨 Minifying CSS...');
  const cssContent = fs.readFileSync(path.join('public', 'css', 'styles.css'), 'utf8');
  const minifiedCSS = new CleanCSS().minify(cssContent);
  
  if (!fs.existsSync(path.join('dist', 'css'))) {
    fs.mkdirSync(path.join('dist', 'css'), { recursive: true });
  }
  fs.writeFileSync(path.join('dist', 'css', 'styles.css'), minifiedCSS.styles);
  
  // Minify HTML
  console.log('📄 Minifying HTML...');
  const htmlContent = fs.readFileSync(path.join('public', 'index.html'), 'utf8');
  const minifiedHTML = minifyHTML(htmlContent, htmlMinifyOptions);
  fs.writeFileSync(path.join('dist', 'index.html'), minifiedHTML);
  

  console.log('📂 Copying assets...');
  const assetDirs = ['images', 'data'];
  assetDirs.forEach(dir => {
    const srcDir = path.join('public', dir);
    const destDir = path.join('dist', dir);
    
    if (fs.existsSync(srcDir)) {
      copyDirectory(srcDir, destDir);
    }
  });
  
  console.log('✅ Build completed! Files are in the /dist directory');
  console.log('📊 File sizes:');
  
  const originalJS = fs.statSync(path.join('public', 'js', 'scripts.js')).size;
  const obfuscatedJSSize = fs.statSync(path.join('dist', 'js', 'scripts.js')).size;
  
  console.log(`   JS: ${originalJS} bytes → ${obfuscatedJSSize} bytes`);
  console.log(`   CSS: ${fs.statSync(path.join('public', 'css', 'styles.css')).size} bytes → ${fs.statSync(path.join('dist', 'css', 'styles.css')).size} bytes`);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isDirectory()) {
      copyDirectory(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}


buildProject();