const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const packagesDir = path.join(rootDir, 'packages');
const appsDir = path.join(rootDir, 'apps', 'backend-control-panel');
const srcDir = path.join(appsDir, 'src');
const targetFeatures = path.join(srcDir, 'features-target');

// Destination paths
const destinations = {
    '@cp/api-manager': path.join(targetFeatures, 'feature-dynamic-routes', 'legacy-core'),
    '@cp/datasource-manager': path.join(targetFeatures, 'feature-data-sources', 'legacy-core'),
    '@modular/database': path.join(targetFeatures, 'shared-database'),
    // Let's add config and middleware just in case they are used inside the handlers
    '@cp/config': path.join(targetFeatures, 'shared-config'),
    '@cp/middleware': path.join(targetFeatures, 'shared-middleware'),
    // Core and others
    '@cp/core': path.join(targetFeatures, 'shared-core'),
    '@modular/contracts': path.join(targetFeatures, 'shared-contracts')
};

// Map package name to its actual folder in packages/
const packageFolders = {
    '@cp/api-manager': 'system-api',
    '@cp/datasource-manager': 'system-datasource',
    '@modular/database': 'database',
    '@cp/config': 'config',
    '@cp/middleware': 'system-middleware',
    '@cp/core': 'system-core',
    '@modular/contracts': 'contracts'
};

function copyDirRecursiveSync(source, target) {
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    
    const files = fs.readdirSync(source);
    
    for (const file of files) {
        if (file === 'node_modules' || file === 'dist' || file === '.turbo') continue;
        
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirRecursiveSync(sourcePath, targetPath);
        } else {
            // Only copy ts/js files or package.json
            if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json')) {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }
}

// 1. Move all needed packages to their new destinations
for (const [pkgName, destPath] of Object.entries(destinations)) {
    const pkgFolder = packageFolders[pkgName];
    const srcPath = path.join(packagesDir, pkgFolder, 'src');
    
    if (fs.existsSync(srcPath)) {
        console.log(`Copying ${pkgName} -> ${destPath}`);
        copyDirRecursiveSync(srcPath, destPath);
    } else {
        // Some packages might not have a 'src' folder (e.g. contracts might be at root)
        const rootPkg = path.join(packagesDir, pkgFolder);
        if (fs.existsSync(rootPkg)) {
            console.log(`Copying (Root) ${pkgName} -> ${destPath}`);
            copyDirRecursiveSync(rootPkg, destPath);
        } else {
            console.warn(`WARN: Package ${pkgName} not found at ${rootPkg}`);
        }
    }
}

// 2. Rewrite imports in all .ts files under src/ (Recursive)
function rewriteImports(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            rewriteImports(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            for (const [pkgName, destPath] of Object.entries(destinations)) {
                // Determine relative path from CURRENT file to the DESTINATION path
                const fileDir = path.dirname(fullPath);
                let relativePath = path.relative(fileDir, destPath).replace(/\\/g, '/');
                if (!relativePath.startsWith('.')) {
                    relativePath = './' + relativePath;
                }
                
                // Replace strictly exact package matches (e.g. "@modular/database")
                const regexExact = new RegExp(`from\\s+['"]${pkgName}['"]`, 'g');
                if (regexExact.test(content)) {
                    content = content.replace(regexExact, `from '${relativePath}'`);
                    modified = true;
                }
                
                // Replace sub-path imports (e.g. "@modular/database/schema")
                const regexSub = new RegExp(`from\\s+['"]${pkgName}/([^'"]+)['"]`, 'g');
                if (regexSub.test(content)) {
                    content = content.replace(regexSub, `from '${relativePath}/$1'`);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Rewrote imports in: ${fullPath.replace(rootDir, '')}`);
            }
        }
    }
}

console.log('--- REWRITING IMPORTS ---');
rewriteImports(srcDir);
console.log('Flattening script finished execution.');
