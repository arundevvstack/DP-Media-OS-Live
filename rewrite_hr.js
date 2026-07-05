const fs = require('fs');

const path = 'src/app/(dashboard)/hr-ops/dashboard/components/hr-quick-actions.tsx';
let content = fs.readFileSync(path, 'utf8');

const newImports = `import { addEmployeeAction, getDepartmentsAction, getDesignationsAction, getBranchesAction, getTeamsAction, getJobGradesAction, getShiftsAction, getPayrollGroupsAction, getEmploymentTypesAction } from '../actions';`;
content = content.replace(/import \{ addEmployeeAction.*\} from '\.\.\/actions';/, newImports);

// Replace state and fetching logic
const stateAndFetchOld = `  // Master Data State
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);

  React.useEffect(() => {
    if (activeWizard === 'employee') {
      setIsLoadingMasterData(true);
      getDepartmentsAction().then(data => {
        setDepartments(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, department: data[0].name }));
        } else {
          setFormData(prev => ({ ...prev, department: '' }));
        }
      }).finally(() => {
        setIsLoadingMasterData(false);
      });
    }
  }, [activeWizard]);
  
  // Add Employee State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ fullName: '', email: '', department: 'Engineering' });`;

const stateAndFetchNew = `  // Master Data State
  const [configData, setConfigData] = useState({
    departments: [] as any[],
    designations: [] as any[],
    branches: [] as any[],
    teams: [] as any[],
    jobGrades: [] as any[],
    shifts: [] as any[],
    payrollGroups: [] as any[],
    employmentTypes: [] as any[]
  });
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false);

  React.useEffect(() => {
    if (activeWizard === 'employee') {
      setIsLoadingMasterData(true);
      Promise.all([
        getDepartmentsAction(),
        getDesignationsAction(),
        getBranchesAction(),
        getTeamsAction(),
        getJobGradesAction(),
        getShiftsAction(),
        getPayrollGroupsAction(),
        getEmploymentTypesAction()
      ]).then(([deps, desigs, branches, teams, jgs, shifts, pgs, ets]) => {
        setConfigData({
          departments: deps, designations: desigs, branches, teams, jobGrades: jgs, shifts, payrollGroups: pgs, employmentTypes: ets
        });
        setFormData(prev => ({
          ...prev,
          department: deps[0]?.name || '',
          designation: desigs[0]?.name || '',
          branch: branches[0]?.name || '',
          team: teams[0]?.name || '',
          jobGrade: jgs[0]?.name || '',
          shift: shifts[0]?.name || '',
          payrollGroup: pgs[0]?.name || '',
          employmentType: ets[0]?.name || ''
        }));
      }).finally(() => {
        setIsLoadingMasterData(false);
      });
    }
  }, [activeWizard]);
  
  // Add Employee State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    fullName: '', email: '', department: '', designation: '', branch: '', team: '', jobGrade: '', shift: '', payrollGroup: '', employmentType: '' 
  });`;

content = content.replace(stateAndFetchOld, stateAndFetchNew);

const formResetOld = `setFormData({ fullName: '', email: '', department: 'Engineering' });`;
const formResetNew = `setFormData({ fullName: '', email: '', department: '', designation: '', branch: '', team: '', jobGrade: '', shift: '', payrollGroup: '', employmentType: '' });`;
content = content.replaceAll(formResetOld, formResetNew);


// Replace the department dropdown UI with all dropdowns
const uiOld = `{step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">Department</label>
                        {isLoadingMasterData ? (
                          <div className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-muted-foreground animate-pulse">Loading master data...</div>
                        ) : departments.length === 0 ? (
                          <div className="w-full p-4 border border-border rounded-md bg-muted/50 text-center">
                            <p className="text-sm text-muted-foreground mb-3">No departments found in Master Data.</p>
                            <button
                              type="button"
                              onClick={() => router.push('/enterprise/administration/master-data')}
                              className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md font-medium"
                            >
                              Go to Master Data
                            </button>
                          </div>
                        ) : (
                          <select 
                            value={formData.department}
                            onChange={e => setFormData({...formData, department: e.target.value})}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:border-primary"
                          >
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                          </select>
                        )}
                      </div>`;

const uiNew = `{step === 2 && (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {isLoadingMasterData ? (
                         <div className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-muted-foreground animate-pulse">Loading configuration data...</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-1">Department</label>
                            <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Designation</label>
                            <select value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.designations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Branch</label>
                            <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.branches.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Team</label>
                            <select value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.teams.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Job Grade</label>
                            <select value={formData.jobGrade} onChange={e => setFormData({...formData, jobGrade: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.jobGrades.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Shift</label>
                            <select value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.shifts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Payroll Group</label>
                            <select value={formData.payrollGroup} onChange={e => setFormData({...formData, payrollGroup: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.payrollGroups.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-1">Employment Type</label>
                            <select value={formData.employmentType} onChange={e => setFormData({...formData, employmentType: e.target.value})} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm">
                              <option value="">Select...</option>
                              {configData.employmentTypes.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            </select>
                          </div>
                        </div>
                      )}`;

content = content.replace(uiOld, uiNew);

// Fix the disabled condition
content = content.replace(`disabled={isSubmitting || departments.length === 0}`, `disabled={isSubmitting || isLoadingMasterData}`);

fs.writeFileSync(path, content);
console.log('Done rewriting hr-quick-actions.tsx');
