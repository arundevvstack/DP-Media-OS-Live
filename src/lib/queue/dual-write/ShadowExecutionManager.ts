export class ShadowExecutionManager {
    static isShadowMode(): boolean { 
        return false; 
    }
    
    static getJobId(): string | null { 
        return null; 
    }
    
    static interceptSideEffect(jobId: string, operation: string, context: any): void {
        // To be implemented
    }
}
