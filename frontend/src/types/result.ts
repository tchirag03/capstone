// Result status types
export type ResultStatus = 'completed' | 'error' | 'pending'

// Script evaluation result
export interface ScriptResult {
    scriptId: string
    rollNo: string
    studentName: string
    totalMarks: number
    maximumMarks: number
    status: ResultStatus
    percentage: number
}
