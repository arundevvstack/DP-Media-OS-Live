import { Project, SyntaxKind, CallExpression, Identifier, ReturnStatement, SourceFile, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const sourceFiles = project.getSourceFiles('src/app/api/**/*.ts');

const domains: Record<string, string[]> = {
    identity: ['User', 'Company', 'ApiKey', 'WebhookEndpoint', 'avatar', 'users'],
    crm: ['Client', 'Prospect', 'MarketLead', 'MarketOpportunity', 'crm', 'clients'],
    projects: ['Project', 'Objective', 'Asset', 'Deliverable', 'TimeEntry', 'projects', 'proposals'],
    production: ['ProductionAIJob', 'ProductionScene', 'ProductionShot', 'ProductionAssetVersion', 'media-ops', 'production'],
    finance: ['Budget', 'Expense', 'Invoice', 'BankAccount', 'finance'],
    hrm: ['EmployeeDocument', 'EmployeeAttendance', 'SalaryStructure', 'hrm', 'time-entries'],
    ai: ['AIGenerationJob', 'AIOperationalMemory', 'intelligence'],
    workflow: ['WorkflowTemplate', 'ApprovalChain', 'ApprovalRequest', 'workflow'],
    notifications: ['Notification', 'NotificationPreference', 'notifications'],
    platform: ['AuditLog', 'ActivityLog', 'OperationalTelemetry', 'InfrastructureIncident', 'integrations', 'system', 'jobs', 'plugins', 'webhooks'],
};

function determineDomain(filePath: string): string {
    for (const [domain, keywords] of Object.entries(domains)) {
        for (const kw of keywords) {
            if (filePath.includes(`/${kw.toLowerCase()}/`) || filePath.includes(`/${kw}/`)) {
                return domain;
            }
        }
    }
    return 'platform';
}

function getServicePath(domain: string, routePath: string): string {
    // Generate a unique service name based on route path
    const parts = routePath.split('/api/v1/')[1].replace(/\/route\.ts$/, '').split('/');
    const serviceName = parts.map(p => p.replace(/[^a-zA-Z0-9]/g, '')).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'ApiService';
    return {
        serviceName,
        serviceFilePath: `src/domains/${domain}/services/${serviceName}.ts`
    };
}

for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    if (!filePath.endsWith('route.ts')) continue;

    const domain = determineDomain(filePath);
    const { serviceName, serviceFilePath } = getServicePath(domain, filePath);
    
    // Find exported HTTP methods
    const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const exportedFunctions = sourceFile.getFunctions().filter(f => f.isExported() && httpMethods.includes(f.getName() || ''));
    
    if (exportedFunctions.length === 0) continue;

    // Create the Service file
    const serviceProject = new Project({ tsConfigFilePath: 'tsconfig.json' });
    let serviceFile = serviceProject.getSourceFile(serviceFilePath);
    if (!serviceFile) {
        serviceFile = serviceProject.createSourceFile(serviceFilePath, `export class ${serviceName} {}`, { overwrite: true });
    }
    const serviceClass = serviceFile.getClass(serviceName)!;

    // Copy all imports to service
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
        // Fix relative imports
        const moduleSpecifier = imp.getModuleSpecifierValue();
        if (moduleSpecifier.startsWith('.')) {
            // Adjust relative import from api to domains
            const absImport = path.resolve(path.dirname(filePath), moduleSpecifier);
            const relToService = path.relative(path.dirname(serviceFilePath), absImport).replace(/\\/g, '/');
            serviceFile.addImportDeclaration({
                defaultImport: imp.getDefaultImport()?.getText(),
                namedImports: imp.getNamedImports().map(n => n.getText()),
                moduleSpecifier: relToService.startsWith('.') ? relToService : `./${relToService}`
            });
        } else {
            serviceFile.addImportDeclaration({
                defaultImport: imp.getDefaultImport()?.getText(),
                namedImports: imp.getNamedImports().map(n => n.getText()),
                moduleSpecifier
            });
        }
    }

    // Move any top-level variables/functions (except HTTP methods) to service
    for (const stmt of sourceFile.getStatements()) {
        if (Node.isFunctionDeclaration(stmt) && exportedFunctions.includes(stmt)) continue;
        if (Node.isImportDeclaration(stmt)) continue;
        
        serviceFile.addStatements(stmt.getText());
    }

    // Add methods to Service and rewrite route file
    let routeFileContent = `import { NextRequest, NextResponse } from 'next/server';\n`;
    
    // Calculate import path for service from route
    let relServicePath = path.relative(path.dirname(filePath), serviceFilePath.replace(/\.ts$/, '')).replace(/\\/g, '/');
    if (!relServicePath.startsWith('.')) relServicePath = './' + relServicePath;
    routeFileContent += `import { ${serviceName} } from '${relServicePath}';\n\n`;

    for (const func of exportedFunctions) {
        const methodName = func.getName()!;
        
        // Add static method to service
        const params = func.getParameters().map(p => p.getText());
        const bodyText = func.getBodyText() || '';
        
        // Transform NextResponse.json to return { status, payload }
        // This is a naive regex replacement but works for most cases
        let transformedBody = bodyText.replace(/return\s+NextResponse\.json\(\s*([\s\S]*?)\s*(?:,\s*\{\s*status:\s*(\d+)\s*\}\s*)?\);/g, 
            (match, payload, status) => {
                const stat = status || '200';
                return `return { status: ${stat}, payload: ${payload} };`;
            });
            
        // Also transform bare NextResponse
        transformedBody = transformedBody.replace(/return\s+new\s+NextResponse\(([\s\S]*?)\);/g, `return { status: 200, payload: $1 };`);

        serviceClass.addMethod({
            isStatic: true,
            isAsync: func.isAsync(),
            name: `handle${methodName}`,
            parameters: func.getParameters().map(p => ({
                name: p.getName(),
                type: p.getTypeNode()?.getText() || 'any'
            })),
            bodyText: transformedBody
        });

        // Add stub to route file
        const paramNames = func.getParameters().map(p => p.getName());
        routeFileContent += `export async function ${methodName}(${params.join(', ')}) {\n`;
        routeFileContent += `  try {\n`;
        routeFileContent += `    const result = await ${serviceName}.handle${methodName}(${paramNames.join(', ')});\n`;
        routeFileContent += `    return NextResponse.json(result.payload, { status: result.status || 200 });\n`;
        routeFileContent += `  } catch (error: any) {\n`;
        routeFileContent += `    return NextResponse.json({ error: error.message }, { status: 500 });\n`;
        routeFileContent += `  }\n`;
        routeFileContent += `}\n\n`;
    }

    // Save service file
    serviceFile.saveSync();
    
    // Overwrite route file
    fs.writeFileSync(filePath, routeFileContent);
    console.log(`Migrated ${filePath} to ${serviceFilePath}`);
}
