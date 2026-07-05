const fs = require('fs');
const path = require('path');

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for hardcoded arrays/mock data
    if (content.match(/const [a-zA-Z0-9_]+ = \[\s*\{/g)) issues.push('Hardcoded arrays/objects detected');
    if (content.toLowerCase().includes('mock')) issues.push('Mock data/keywords detected');
    if (content.toLowerCase().includes('dummy')) issues.push('Dummy data/keywords detected');
    if (content.toLowerCase().includes('placeholder')) issues.push('Placeholder keywords detected');
    
    // Check for Prisma usage
    if (!content.includes('prisma') && !content.includes('db.') && !content.includes('fetch(') && !content.includes('useQuery')) {
        issues.push('No obvious database or API connection (missing prisma/fetch/useQuery)');
    }

    // Check for EventBus
    if (content.includes('EventBus') || content.includes('eventBus')) {
        // has event bus
    } else {
        // issues.push('No EventBus usage detected');
    }
    
    return issues;
}

function scanDir(dir, results = {}) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, results);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const issues = analyzeFile(fullPath);
            if (issues.length > 0) {
                results[fullPath] = issues;
            }
        }
    }
    return results;
}

const dashboardProjects = scanDir('src/app/(dashboard)/projects');
console.log(JSON.stringify(dashboardProjects, null, 2));
