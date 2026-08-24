import { PrismaClient } from '@prisma/client'
import { ShadowExecutionManager } from './queue/dual-write/ShadowExecutionManager'

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          if (
            ['create', 'update', 'delete', 'upsert', 'updateMany', 'deleteMany', 'createMany'].includes(operation)
          ) {
            if (ShadowExecutionManager.isShadowMode()) {
              const jobId = ShadowExecutionManager.getJobId() || 'unknown';
              ShadowExecutionManager.interceptSideEffect(jobId, operation, { model, args });
              // Return a mock result or null to prevent execution.
              // A robust implementation would return mocked types depending on operation.
              return null as any; 
            }
          }
          return query(args)
        }
      }
    }
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
