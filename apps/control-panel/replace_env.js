const fs = require('fs');
const path = require('path');

const walkSync = function (dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
        } catch (err) {
            if (err.code === 'OOM' || err.code === 'EMFILE') throw err;
        }
    });
    return filelist;
};

const targetDir = 'd:/6 WEBSITE/2 2025/desember/backend-engine/control-panel-backend/apps/control-panel/src';
const files = walkSync(targetDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/env\.ORANGE_API/g, 'env.API_BASE');
    content = content.replace(/env\.GREEN_API/g, 'env.BACKEND_SYSTEM_API');

    // Also any stray comments with ORANGE_API or GREEN_API
    content = content.replace(/ORANGE_API/g, 'API_BASE');
    content = content.replace(/GREEN_API/g, 'BACKEND_SYSTEM_API');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        changedFiles++;
    }
});

console.log(`Total files updated: ${changedFiles}`);
