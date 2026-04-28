import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get } from '@/api/client'

// Backend API response types
interface ResultSummary {
  total_students: number
  average_score: number
  highest_score: number
  lowest_score: number
  average_percentage: number
}

interface ScriptResult {
  _id: string
  student_name: string
  file_name: string
  total_score: number
  max_score: number
  percentage: number
  grade: string
}

interface ResultsOverviewApiResponse {
  success: boolean
  evaluation_id: string
  summary: ResultSummary
  results: ScriptResult[]
}

// Minimal interface for an Evaluation just to show the title
interface EvaluationDetails {
  name: string
}

function ResultsOverview() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [evaluationName, setEvaluationName] = useState<string>('Loading...')

  const [summary, setSummary] = useState<ResultSummary>({
    total_students: 0,
    average_score: 0,
    highest_score: 0,
    lowest_score: 0,
    average_percentage: 0,
  })
  const [results, setResults] = useState<ScriptResult[]>([])

  useEffect(() => {
    if (!evaluationId) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch basic details just for the name
        const evalDetails = await get<EvaluationDetails>(`/evaluations/${evaluationId}`)
        setEvaluationName(evalDetails.name)

        // Fetch results
        const data = await get<ResultsOverviewApiResponse>(`/evaluations/${evaluationId}/results`)
        setSummary(data.summary)
        setResults(data.results)
      } catch (err: any) {
        setError(err.message || 'Failed to load results')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [evaluationId])

  // Navigate to script details
  const handleScriptClick = (scriptId: string) => {
    navigate(`/evaluation/${evaluationId}/results/${scriptId}`)
  }

  // Get grade badge styling based on percentage
  const getGradeStyle = (grade: string): string => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-700'
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700'
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 font-medium">Loading evaluation results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Results</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Results Overview</h1>
        <p className="text-slate-600">
          Evaluation: <span className="font-semibold text-slate-800">{evaluationName}</span>
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Total Scripts */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Scripts</p>
          </div>
          <p className="text-4xl font-bold text-slate-800 mt-4">{summary.total_students}</p>
        </div>

        {/* Average Score */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.759-1.576 1.5 1.5 0 112.738-.088A2.999 2.999 0 0116 13h-1v-1a1 1 0 10-2 0v1h-1a1 1 0 10-2 0v-1a1 1 0 10-2 0v1H7.5A1.5 1.5 0 006 14.5V16h-.5z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Average %</p>
          </div>
          <p className="text-4xl font-bold text-slate-800 mt-4">{summary.average_percentage}<span className="text-2xl text-slate-400 font-normal">%</span></p>
        </div>

        {/* Highest Score */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Highest Marks</p>
          </div>
          <p className="text-4xl font-bold text-slate-800 mt-4">{summary.highest_score}</p>
        </div>

        {/* Lowest Score */}
        <div className="bg-white border-2 border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Lowest Marks</p>
          </div>
          <p className="text-4xl font-bold text-slate-800 mt-4">{summary.lowest_score}</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6 border-b-2 border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Student Results</h2>
            <p className="text-sm text-slate-600 mt-1">Click on any row to view detailed analysis</p>
          </div>
          <button
            onClick={() => navigate(`/evaluation/${evaluationId}/export`)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>

        {results.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No completed results found. Ensure the evaluation pipeline has finished successfully.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700 tracking-wider">File Name</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700 tracking-wider">Student Name</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700 tracking-wider">Total Marks</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700 tracking-wider">Percentage</th>
                  <th className="text-center p-4 text-sm font-semibold text-slate-700 tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result) => {
                  const gradeStyle = getGradeStyle(result.grade)

                  return (
                    <tr
                      key={result._id}
                      onClick={() => handleScriptClick(result._id)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="p-4">
                        <span className="text-slate-600 font-mono text-xs">{result.file_name}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{result.student_name}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-slate-800">{result.total_score}</span>
                        <span className="text-slate-500 text-xs ml-1">/{result.max_score}</span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${result.percentage >= 80 ? 'bg-green-500' :
                                result.percentage >= 60 ? 'bg-blue-500' :
                                  result.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${result.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-slate-700 w-10 text-right">{result.percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${gradeStyle}`}>
                          {result.grade}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      {results.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5 flex gap-4">
          <svg className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-1 text-base">Detailed Analysis Available</p>
            <p className="opacity-90">Click on any student row to view their detailed answer-by-answer analysis, raw OCR text extraction, and AI scoring breakdown.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsOverview
