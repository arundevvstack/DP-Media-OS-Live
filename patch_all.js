const fs = require('fs');

let c = fs.readFileSync('src/app/(dashboard)/projects/[projectId]/page.tsx', 'utf8');

// 1. File Size
c = c.replace(/file_size: 14890240, \/\/ 14\.8 MB dummy size/g, '');
c = c.replace(/\{\(asset\.file_size \/ 1000000\)\.toFixed\(1\)\} MB/g, '{( (asset.file_size || 0) / 1000000).toFixed(1)} MB');

// 2. handleToggleObjective EventBus
const oldObjToggle = `    await supabase
      .from("Objective")
      .update({ status: newStatus })
      .eq("id", objectiveId);
    await supabase
      .from("Project")
      .update({ progress: liveProgress })
      .eq("id", projectId);
    refetchObjectives();`;

const newObjToggle = `    await supabase
      .from("Objective")
      .update({ status: newStatus })
      .eq("id", objectiveId);

    if (newStatus === "Completed" || newStatus === "done") {
        fetch("/api/v1/system/demo/start", {
            method: "POST",
            body: JSON.stringify({
                action: "OBJECTIVE_COMPLETED",
                project_id: projectId,
                objective_id: objectiveId
            })
        }).catch(console.error);
    }

    await supabase
      .from("Project")
      .update({ progress: liveProgress })
      .eq("id", projectId);
    refetchObjectives();`;

c = c.replace(oldObjToggle, newObjToggle);

fs.writeFileSync('src/app/(dashboard)/projects/[projectId]/page.tsx', c);
console.log('All patches applied.');
