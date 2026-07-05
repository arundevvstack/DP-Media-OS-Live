const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/ai/flows/**/*.ts');

let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // AI Mock Fallbacks in suggest-scope
    content = content.replace(/console\.warn\("API key not set.*"\);\s*return getMockSuggestion\(input\);/g, 'throw new Error("AI Provider (OpenRouter/Anthropic) failed or API key not set. Cannot generate scope.");');
    
    // AI Mock Fallbacks in generate-requirements
    content = content.replace(/if \(!hasKey\) return getMockBudget\(input\);/g, 'if (!hasKey) throw new Error("AI Provider failed. Cannot generate budget.");');
    content = content.replace(/return getMockBudget\(input\);/g, 'throw new Error("AI Provider failed. Cannot generate budget.");');
    
    content = content.replace(/if \(!hasKey\) return getMockTimeline\(input\);/g, 'if (!hasKey) throw new Error("AI Provider failed. Cannot generate timeline.");');
    content = content.replace(/return getMockTimeline\(input\);/g, 'throw new Error("AI Provider failed. Cannot generate timeline.");');

    content = content.replace(/if \(!hasKey\) return getMockScope\(input\);/g, 'if (!hasKey) throw new Error("AI Provider failed. Cannot generate scope.");');
    content = content.replace(/return getMockScope\(input\);/g, 'throw new Error("AI Provider failed. Cannot generate scope.");');

    // AI Mock Fallbacks in market-flows
    content = content.replace(/return generateMockLeads\(input\);/g, 'throw new Error("AI Provider failed. Cannot generate leads.");');

    // AI Mock Fallbacks in generate-proposal-content
    content = content.replace(/return generateMockProposal\(input\);/g, 'throw new Error("AI Provider failed. Cannot generate proposal.");');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Removed mock fallback in ${file}`);
        count++;
    }
});
console.log(`Processed ${count} files in Phase 2.`);
