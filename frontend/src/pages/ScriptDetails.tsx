import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get } from '@/api/client'

// Backend API response types
interface OcrResult {
  sheet_id: string
  status: string
  result?: {
    extracted_text: string
    confidence: number
  }
}

interface ComponentScore {
  component: string
  marks_awarded: number
  max_marks: number
  feedback?: string
}

interface QuestionScore {
  question_number: number
  question_text: string
  component_scores: ComponentScore[]
  total_marks: number
  max_marks: number
  feedback: string
}

interface ScriptResultDetails {
  success: boolean
  sheet_id: string
  student: {
    name: string
    file_name: string
  }
  evaluation?: {
    questions: QuestionScore[]
    total_score: number
    max_score: number
    percentage: number
    grade: string
  }
  message?: string
}

function ScriptDetails() {
  const { evaluationId, scriptId } = useParams<{ evaluationId: string; scriptId: string }>()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [ocrText, setOcrText] = useState<string>('')
  const [details, setDetails] = useState<ScriptResultDetails | null>(null)

  useEffect(() => {
    if (!evaluationId || !scriptId) return

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch OCR text and evaluation details in parallel
        const [ocrRes, detailsRes] = await Promise.all([
          get<OcrResult>(`/evaluations/${evaluationId}/ocr/result/${scriptId}`),
          get<ScriptResultDetails>(`/evaluations/${evaluationId}/results/${scriptId}`)
        ])

        if (ocrRes.result?.extracted_text) {
          setOcrText(ocrRes.result.extracted_text)
        } else {
          setOcrText('OCR text not available or processing failed.')
        }

        setDetails(detailsRes)
      } catch (err: any) {
        setError(err.message || 'Failed to load script details')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [evaluationId, scriptId])

  // Get category badge styling
  const getCategoryBadge = (pct: number) => {
    if (pct >= 80) return 'bg-green-100 text-green-700 border-green-200'
    if (pct >= 60) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (pct >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  // Get progress bar color
  const getProgressColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-600'
    if (pct >= 60) return 'bg-blue-600'
    if (pct >= 40) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const handleBackToResults = () => {
    navigate(`/evaluation/${evaluationId}/results`)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 font-medium">Loading script analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Script</h2>
          <p className="text-red-600">{error || 'Unknown error'}</p>
          <button
            onClick={handleBackToResults}
            className="mt-6 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Results
          </button>
        </div>
      </div>
    )
  }

  const evalData = details.evaluation

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBackToResults}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Results
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Script Details</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-600">
              <span>
                <span className="font-semibold text-slate-800">Student:</span> {details.student.name}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-sm">
                <span className="font-semibold font-sans text-slate-800">File:</span> {details.student.file_name}
              </span>
            </div>
          </div>

          {/* Score Badge */}
          {evalData && (
            <div className={`text-white rounded-lg p-4 text-center min-w-[120px] shadow-sm ${getProgressColor(evalData.percentage)}`}>
              <p className="text-sm font-semibold mb-1 opacity-90">Total Score</p>
              <p className="text-4xl font-bold tracking-tight">{evalData.total_score}</p>
              <p className="text-xs mt-1 opacity-80 border-t border-white/20 pt-1">out of {evalData.max_score}</p>
              <div className="mt-2 bg-black/20 rounded px-2 py-1 flex items-center justify-between text-xs font-bold">
                <span>{evalData.percentage}%</span>
                <span>Grade {evalData.grade}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!evalData ? (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800 font-medium text-lg">Evaluation not yet completed for this script.</p>
          <p className="text-yellow-700 mt-2">{details.message}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Left Panel: OCR Text */}
          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden flex flex-col sticky top-6 shadow-sm" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">OCR Extracted Text</h2>
                  <p className="text-xs text-slate-500">Raw digitized content from Mistral OCR</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
              <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {ocrText}
              </pre>
            </div>
          </div>

          {/* Right Panel: Scores & Feedback */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-lg p-5 border-2 border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">AI Scoring Breakdown</h2>
                <p className="text-sm text-slate-500 mt-1">Per-question analysis and rubric evaluation</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-800">{evalData.questions.length}</span>
                <span className="text-sm text-slate-500 ml-1">Questions</span>
              </div>
            </div>

            <div className="space-y-6">
              {evalData.questions.map((q) => {
                const qPct = q.max_marks > 0 ? (q.total_marks / q.max_marks) * 100 : 0
                
                return (
                  <div
                    key={q.question_number}
                    className={`bg-white border-2 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md ${getCategoryBadge(qPct)}`}
                  >
                    {/* Question Header */}
                    <div className="p-5 border-b border-black/5 bg-white/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">Q{q.question_number}</span>
                          </div>
                          <h3 className="text-base font-semibold text-slate-800 leading-snug">
                            {q.question_text || "Unidentified Question"}
                          </h3>
                        </div>
                        <div className="text-right shrink-0 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                          <span className="text-2xl font-bold text-slate-800">
                            {q.total_marks}
                          </span>
                          <span className="text-sm text-slate-500 font-medium">/{q.max_marks}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Sub-components */}
                      {q.component_scores && q.component_scores.length > 0 && (
                        <div className="mb-5 space-y-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rubric Components</h4>
                          {q.component_scores.map((comp, idx) => {
                            const compPct = comp.max_marks > 0 ? (comp.marks_awarded / comp.max_marks) * 100 : 0
                            return (
                              <div key={idx} className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-sm font-semibold text-slate-700">{comp.component}</span>
                                  <span className="text-sm font-bold text-slate-800">{comp.marks_awarded} <span className="text-slate-400 font-normal">/ {comp.max_marks}</span></span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${getProgressColor(compPct)}`}
                                    style={{ width: `${compPct}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Feedback */}
                      {q.feedback && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Feedback</h4>
                          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                            <div className="flex gap-3">
                              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {q.feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScriptDetails
