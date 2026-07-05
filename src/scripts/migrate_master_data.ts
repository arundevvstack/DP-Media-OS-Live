import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const entityMap: Record<string, string> = {
  'BUSINESS_UNIT': 'businessUnit',
  'REGION': 'region',
  'COUNTRY': 'country',
  'STATE': 'state',
  'CITY': 'city',
  'BRANCH': 'branch',
  'DIVISION': 'division',
  'DEPARTMENT': 'department',
  'TEAM': 'team', // Special handling if needed
  'DESIGNATION': 'designation',
  'JOB_GRADE': 'jobGrade',
  'SHIFT': 'shift',
  'OFFICE_LOCATION': 'location', // Mapped to Location
  'WAREHOUSE': 'warehouse',
  'STUDIO': 'studio',
  'COST_CENTER': 'costCenter',
  'PROFIT_CENTER': 'profitCenter',
  'PAYROLL_GROUP': 'payrollGroup',
  'TAX_GROUP': 'taxGroup',
  'ASSET_GROUP': 'assetCategory', // Mapped to AssetCategory
  'EQUIPMENT_PACKAGE': 'equipmentCategory', // Mapped to EquipmentCategory
  'PROJECT_CATEGORY': 'projectCategory',
  'CLIENT_CATEGORY': 'clientCategory',
  'VENDOR_CATEGORY': 'vendorCategory'
};

async function main() {
  

  for (const [oldCategory, modelName] of Object.entries(entityMap)) {
    try {
      // Find old records that might exist in MasterDataRecord (as raw strings if enum changed, though prisma query might fail if enum removed)
      // Since we updated the enum, Prisma client will error if we query by the old enum if it was removed.
      // We will use raw SQL to fetch the old records because the enum is updated.
      
      const records = await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM "MasterDataRecord" WHERE category = $1`, oldCategory);
      
      if (records.length === 0) continue;
      
      
      
      for (const record of records) {
        // Upsert into new dedicated table
        const delegate = (prisma as any)[modelName];
        await delegate.create({
          data: {
            id: record.id,
            name: record.name,
            code: record.code,
            description: record.description,
            is_active: record.is_active,
            metadata: record.metadata,
            company_id: record.company_id,
            created_at: record.created_at,
            updated_at: record.updated_at
          }
        });
      }
      
      // Delete migrated records
      await prisma.$executeRawUnsafe(`DELETE FROM "MasterDataRecord" WHERE category = $1`, oldCategory);
      
    } catch (e) {
      
    }
  }
  
  
}

main()
  .catch(e => {
    
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
