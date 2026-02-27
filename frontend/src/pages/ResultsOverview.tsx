import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ResultStatus, ScriptResult } from '@/types'

// Mock results data - simulating database response
// TODO: Replace with actual API call to fetch evaluation results
const MOCK_RESULTS: ScriptResult[] = [
  { scriptId: 'script-001', rollNo: 'CS-2024-001', studentName: 'Alice Johnson', totalMarks: 92, maximumMarks: 100, status: 'completed', percentage: 92 },
  { scriptId: 'script-002', rollNo: 'CS-2024-002', studentName: 'Bob Smith', totalMarks: 78, maximumMarks: 100, status: 'completed', percentage: 78 },
  { scriptId: 'script-003', rollNo: 'CS-2024-003', studentName: 'Carol Williams', totalMarks: 85, maximumMarks: 100, status: 'completed', percentage: 85 },
  { scriptId: 'script-004', rollNo: 'CS-2024-004', studentName: 'David Brown', totalMarks: 67, maximumMarks: 100, status: 'completed', percentage: 67 },
  { scriptId: 'script-005', rollNo: 'CS-2024-005', studentName: 'Emma Davis', totalMarks: 95, maximumMarks: 100, status: 'completed', percentage: 95 },
  { scriptId: 'script-006', rollNo: 'CS-2024-006', studentName: 'Frank Miller', totalMarks: 73, maximumMarks: 100, status: 'completed', percentage: 73 },
  { scriptId: 'script-007', rollNo: 'CS-2024-007', studentName: 'Grace Wilson', totalMarks: 88, maximumMarks: 100, status: 'completed', percentage: 88 },
  { scriptId: 'script-008', rollNo: 'CS-2024-008', studentName: 'Henry Moore', totalMarks: 81, maximumMarks: 100, status: 'completed', percentage: 81 },
  { scriptId: 'script-009', rollNo: 'CS-2024-009', studentName: 'Ivy Taylor', totalMarks: 70, maximumMarks: 100, status: 'completed', percentage: 70 },
  { scriptId: 'script-010', rollNo: 'CS-2024-010', studentName: 'Jack Anderson', totalMarks: 90, maximumMarks: 100, status: 'completed', percentage: 90 },
]

function ResultsOverview() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const navigate = useNavigate()

  const [results] = useState<ScriptResult[]>(MOCK_RESULTS)

  // Calculate summary statistics
  const totalScripts = results.length
  const completedScripts = results.filter(r => r.status === 'completed')
  const averageScore = completedScripts.length > 0
    ? Math.round(completedScripts.reduce((sum, r) => sum + r.totalMarks, 0) / completedScripts.length)
    : 0
  const highestScore = completedScripts.length > 0
    ? Math.max(...completedScripts.map(r => r.totalMarks))
    : 0
  const lowestScore = completedScripts.length > 0
    ? Math.min(...completedScripts.map(r => r.totalMarks))
    : 0

  // Navigate to script details
  const handleScriptClick = (scriptId: string) => {
    navigate(`/evaluation/${evaluationId}/results/${scriptId}`)
  }

  // Get status badge styling
  const getStatusBadge = (status: ResultStatus) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
      pending: 'bg-slate-100 text-slate-600',
    }
    const labels = {
      completed: 'Completed',
      error: 'Error',
      pending: 'Pending',
    }
    return { style: styles[status], label: labels[status] }
  }

  // Get grade based on percentage
  const getGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Results Overview</h1>
        <p className="text-slate-600">
          Evaluation ID: <span className="font-semibold text-slate-800">{evaluationId}</span>
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Total Scripts */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-slate-600">Total Scripts</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalScripts}</p>
        </div>

        {/* Average Score */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-slate-600">Average Score</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{averageScore}<span className="text-lg text-slate-500">/100</span></p>
        </div>

        {/* Highest Score */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <p className="text-sm font-semibold text-slate-600">Highest Score</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{highestScore}<span className="text-lg text-slate-500">/100</span></p>
        </div>

        {/* Lowest Score */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-slate-600">Lowest Score</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{lowestScore}<span className="text-lg text-slate-500">/100</span></p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b-2 border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Student Results</h2>
          <p className="text-sm text-slate-600 mt-1">Click on any row to view detailed analysis</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Roll No</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Student Name</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Total Marks</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Percentage</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Grade</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {results.map((result) => {
                const statusBadge = getStatusBadge(result.status)
                const grade = getGrade(result.percentage)

                return (
                  <tr
                    key={result.scriptId}
                    onClick={() => handleScriptClick(result.scriptId)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{result.rollNo}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-700">{result.studentName}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-800">
                        {result.totalMarks}
                      </span>
                      <span className="text-slate-500">/{result.maximumMarks}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${result.percentage >= 80 ? 'bg-green-600' :
                              result.percentage >= 60 ? 'bg-blue-600' :
                                result.percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{result.percentage}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                        grade === 'B' ? 'bg-blue-100 text-blue-700' :
                          grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {grade}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge.style}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Detailed Analysis Available</p>
            <p>Click on any student row to view their detailed answer-by-answer analysis, AI feedback, and scoring breakdown.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsOverview
