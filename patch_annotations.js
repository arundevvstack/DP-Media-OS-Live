const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/projects/[projectId]/page.tsx', 'utf8');

// 1. Add import for Server Action
if (!content.includes('addReviewAnnotation')) {
    const importStatement = `import { addReviewAnnotation } from "@/app/actions/project-overview";\n`;
    content = content.replace('import { useParams', importStatement + 'import { useParams');
}

// 2. Add useSupabaseCollection for ProductionComment
if (!content.includes('const { data: productionComments')) {
    const commentHook = `
  const { data: productionComments, refetch: refetchComments } = useSupabaseCollection("ProductionComment", {
    where: { project_id: projectId }
  });
  
  // Transform DB comments to local annotation format for the video player
  const liveAnnotations = (productionComments || [])
    .filter(c => c.asset_id === selectedAssetForReview?.id)
    .map(c => {
        const parts = c.content.split(' - ');
        return {
            timestamp: parts[0] || "00:00",
            comment: parts.slice(1).join(' - ') || c.content,
            author: "User" // Or lookup author ID
        };
    });
`;
    content = content.replace('// --- DATA FETCHING FROM SUPABASE ---', '// --- DATA FETCHING FROM SUPABASE ---\n' + commentHook);
}

// 3. Replace mockAnnotations with liveAnnotations in the UI
content = content.replace(/mockAnnotations/g, 'liveAnnotations');

// 4. Update handleAddAnnotation to use the Server Action
const handleAddAnnotationRegex = /const handleAddAnnotation = \(\) => \{[\s\S]*?setNewAnnotation\(\{ minutes: "00", seconds: "00", text: "" \}\);\s*toast\(\{[\s\S]*?\}\);\s*\};/;
const newHandleAddAnnotation = `const handleAddAnnotation = async () => {
    if (!newAnnotation.text.trim() || !selectedAssetForReview) return;
    const timestamp = \`\${newAnnotation.minutes.padStart(2, "0")}:\${newAnnotation.seconds.padStart(2, "0")}\`;
    
    await addReviewAnnotation(
        projectId as string, 
        selectedAssetForReview.id, 
        timestamp, 
        newAnnotation.text, 
        profile?.id || 'anonymous'
    );
    
    refetchComments();
    setNewAnnotation({ minutes: "00", seconds: "00", text: "" });
    toast({
      title: "Feedback Recorded",
      description: \`Annotation saved to live database.\`,
    });
  };`;
content = content.replace(handleAddAnnotationRegex, newHandleAddAnnotation);

fs.writeFileSync('src/app/(dashboard)/projects/[projectId]/page.tsx', content);
console.log('Page patched for live annotations and EventBus.');
