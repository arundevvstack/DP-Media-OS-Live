import React from 'react';
import { Settings, Users, Building, DollarSign, Box, Shield, Zap, ChevronRight, Edit, Trash, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const modules = [
  {
    id: 'organization',
    name: 'Organization',
    icon: <Building className="h-5 w-5" />,
    entities: [
      { id: 'businessUnit', name: 'Business Units' },
      { id: 'region', name: 'Regions' },
      { id: 'country', name: 'Countries' },
      { id: 'state', name: 'States' },
      { id: 'city', name: 'Cities' },
      { id: 'branch', name: 'Branches' },
      { id: 'division', name: 'Divisions' },
      { id: 'department', name: 'Departments' },
      { id: 'team', name: 'Teams' }
    ]
  },
  {
    id: 'hr',
    name: 'Human Resources',
    icon: <Users className="h-5 w-5" />,
    entities: [
      { id: 'designation', name: 'Designations' },
      { id: 'jobGrade', name: 'Job Grades' },
      { id: 'shift', name: 'Shifts' },
      // MasterData records for HR
      { id: 'EMPLOYMENT_TYPE', name: 'Employment Types', isMasterData: true },
      { id: 'EMPLOYMENT_STATUS', name: 'Employment Statuses', isMasterData: true }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: <DollarSign className="h-5 w-5" />,
    entities: [
      { id: 'costCenter', name: 'Cost Centers' },
      { id: 'profitCenter', name: 'Profit Centers' },
      { id: 'payrollGroup', name: 'Payroll Groups' },
      { id: 'taxGroup', name: 'Tax Groups' },
      { id: 'CURRENCY', name: 'Currencies', isMasterData: true }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: <Box className="h-5 w-5" />,
    entities: [
      { id: 'location', name: 'Locations' },
      { id: 'warehouse', name: 'Warehouses' },
      { id: 'studio', name: 'Studios' },
      { id: 'assetCategory', name: 'Asset Categories' },
      { id: 'equipmentCategory', name: 'Equipment Categories' }
    ]
  },
  {
    id: 'system',
    name: 'System',
    icon: <Settings className="h-5 w-5" />,
    entities: [
      { id: 'TAG', name: 'Tags', isMasterData: true },
      { id: 'LABEL', name: 'Labels', isMasterData: true },
      { id: 'ROLE', name: 'Roles', isMasterData: true }
    ]
  }
];

export default function EnterpriseConfigurationPage() {
  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enterprise Configuration Engine</h1>
        <p className="text-muted-foreground mt-1">Manage core enterprise entities and lookup values.</p>
      </div>
      
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Modules Sidebar */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 pb-8">
          {modules.map(mod => (
            <Card key={mod.id}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {mod.icon} {mod.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 flex flex-col">
                {mod.entities.map(ent => (
                  <button 
                    key={ent.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm text-left transition-colors"
                  >
                    <span>{ent.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Area placeholder */}
        <div className="flex-1 bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold">Select a Configuration Entity</h2>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Record
            </button>
          </div>
          <div className="p-6 flex-1 flex items-center justify-center text-muted-foreground">
            Please select an entity from the sidebar to manage its configuration.
          </div>
        </div>
      </div>
    </div>
  );
}
