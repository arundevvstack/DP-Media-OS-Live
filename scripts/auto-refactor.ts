import { Project, SyntaxKind, CallExpression, Identifier, PropertyAccessExpression } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
});

const sourceFiles = project.getSourceFiles('src/app/api/v1/**/*.ts');

for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    console.log(`Processing: ${filePath}`);

    // Look for `prisma.model.action`
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    
    let modified = false;
    for (const call of calls) {
        const expression = call.getExpression();
        if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression as PropertyAccessExpression;
            const expr = propAccess.getExpression();
            if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
                const subPropAccess = expr as PropertyAccessExpression;
                if (subPropAccess.getExpression().getText() === 'prisma') {
                    const modelName = subPropAccess.getName();
                    const actionName = propAccess.getName();
                    console.log(`  Found Prisma call: prisma.${modelName}.${actionName}`);
                    
                    // Replace with repository call
                    // e.g., prisma.user.findUnique -> new UserRepository().findUnique
                    const capitalizedModel = modelName.charAt(0).toUpperCase() + modelName.slice(1);
                    propAccess.replaceWithText(`new ${capitalizedModel}Repository().${actionName}`);
                    
                    // Ensure import exists (simplified)
                    sourceFile.addImportDeclaration({
                        moduleSpecifier: `@/domains/unknown/repositories/${capitalizedModel}Repository`,
                        namedImports: [`${capitalizedModel}Repository`]
                    });
                    
                    modified = true;
                }
            }
        }
    }

    if (modified) {
        // Find import prisma
        const imports = sourceFile.getImportDeclarations();
        for (const imp of imports) {
            if (imp.getModuleSpecifierValue().includes('prisma')) {
                imp.remove();
            }
        }
        
        sourceFile.saveSync();
    }
}
