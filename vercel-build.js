const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run the standard build
console.log('Running standard build...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Customizing build output...');

// Create redirects file
const redirectsContent = `/HostelBazaar/assets/* /assets/:splat 301
/HostelBazaar/* /:splat 301
/* /index.html 200`;

fs.writeFileSync(path.join(__dirname, 'dist', '_redirects'), redirectsContent);

// Create a custom redirect HTML for /HostelBazaar/assets/ paths
const createAssetRedirect = (assetPath) => {
  const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${assetPath.replace('/HostelBazaar/', '/')}">
  <script>
    window.location.href = "${assetPath.replace('/HostelBazaar/', '/')}";
  </script>
</head>
<body>
  Redirecting to ${assetPath.replace('/HostelBazaar/', '/')}...
</body>
</html>
`;
  return redirectHtml;
};

// Create a HostelBazaar directory and assets subdirectory
const hostelbazaarDir = path.join(__dirname, 'dist', 'HostelBazaar');
const hostelbazaarAssetsDir = path.join(hostelbazaarDir, 'assets');

if (!fs.existsSync(hostelbazaarDir)) {
  fs.mkdirSync(hostelbazaarDir);
}

if (!fs.existsSync(hostelbazaarAssetsDir)) {
  fs.mkdirSync(hostelbazaarAssetsDir);
}

// Get a list of asset files
const assetsDir = path.join(__dirname, 'dist', 'assets');
const assetFiles = fs.readdirSync(assetsDir);

// Create redirect files for each asset
assetFiles.forEach(file => {
  const redirectFile = path.join(hostelbazaarAssetsDir, file);
  fs.writeFileSync(redirectFile, createAssetRedirect(`/assets/${file}`));
});

console.log('Build customization complete!'); 