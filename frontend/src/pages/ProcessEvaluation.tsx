import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { StageStatus, EvaluationStage, EvaluationStatus } from '@/types'

function ProcessEvaluation() {
  const { evaluationId } = useParams<{ evaluationId: string }>()

  // Mock evaluation data (would come from API/database)
  const [evaluationName] = useState('Final Exam 2024')
  const [totalScripts] = useState(45)
  const [evaluationStatus, setEvaluationStatus] = useState<EvaluationStatus>('not-started')

  // Three pipeline stages
  const [stages, setStages] = useState<EvaluationStage[]>([
    {
      id: 'ocr',
      name: 'OCR Processing',
      description: 'Extracting text from scanned answer sheets',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'structuring',
      name: 'Text Structuring',
      description: 'Organizing extracted text into structured data',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'scoring',
      name: 'Rubric-Based Scoring',
      description: 'Evaluating answers against rubric criteria',
      status: 'pending',
      progress: 0,
    },
  ])

  // Simulated processing
  useEffect(() => {
    if (evaluationStatus !== 'processing') return

    let currentStageIndex = 0
    const stageIds = ['ocr', 'structuring', 'scoring']

    const interval = setInterval(() => {
      setStages(prevStages => {
        const newStages = [...prevStages]
        const currentStage = newStages[currentStageIndex]

        if (currentStage.progress < 100) {
          // Update progress for current stage
          currentStage.progress = Math.min(currentStage.progress + 10, 100)
          currentStage.status = 'in-progress'
        } else if (currentStage.progress === 100) {
          // Mark current stage as completed
          currentStage.status = 'completed'

          // Move to next stage
          currentStageIndex++
          if (currentStageIndex < stageIds.length) {
            newStages[currentStageIndex].status = 'in-progress'
            newStages[currentStageIndex].progress = 0
          } else {
            // All stages completed
            setEvaluationStatus('completed')
            clearInterval(interval)
          }
        }

        return newStages
      })
    }, 500) // Update every 500ms

    return () => clearInterval(interval)
  }, [evaluationStatus])

  // Start evaluation handler
  const handleStartEvaluation = () => {
    setEvaluationStatus('processing')
    // Reset all stages
    setStages(stages.map((stage, index) => ({
      ...stage,
      status: index === 0 ? 'in-progress' : 'pending',
      progress: 0,
    })))
  }

  // Get status badge styling
  const getStatusBadge = (status: StageStatus) => {
    const styles = {
      pending: 'bg-slate-100 text-slate-600',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
    }
    const labels = {
      pending: 'Pending',
      'in-progress': 'In Progress',
      completed: 'Completed',
      error: 'Error',
    }
    return { style: styles[status], label: labels[status] }
  }

  // Get stage icon
  const getStageIcon = (stage: EvaluationStage) => {
    if (stage.status === 'completed') {
      return (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    }
    if (stage.status === 'in-progress') {
      return (
        <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    }
    return (
      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Process Evaluation</h1>
        <p className="text-slate-600">
          Initiate and monitor the evaluation pipeline for ID: <span className="font-semibold text-slate-800">{evaluationId}</span>
        </p>
      </div>

      {/* Evaluation Info Card */}
      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Evaluation Name</p>
            <p className="text-lg font-semibold text-slate-800">{evaluationName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Scripts</p>
            <p className="text-lg font-semibold text-slate-800">{totalScripts} answer sheets</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Evaluation Pipeline</h2>
            <p className="text-sm text-slate-600">
              {evaluationStatus === 'not-started' && 'Ready to start evaluation process'}
              {evaluationStatus === 'processing' && 'Evaluation in progress...'}
              {evaluationStatus === 'completed' && 'Evaluation completed successfully'}
            </p>
          </div>

          <button
            onClick={handleStartEvaluation}
            disabled={evaluationStatus === 'completed' || evaluationStatus === 'processing'}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${evaluationStatus === 'completed' || evaluationStatus === 'processing'
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
          >
            {evaluationStatus === 'processing' ? 'Processing...' : evaluationStatus === 'completed' ? 'Completed' : 'Start Evaluation'}
          </button>
        </div>

        {evaluationStatus === 'completed' && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-semibold text-green-800">Evaluation already completed</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Processing Stages</h3>

        {stages.map((stage, index) => {
          const statusBadge = getStatusBadge(stage.status)
          const isLastStage = index === stages.length - 1

          return (
            <div key={stage.id}>
              <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
                {/* Stage Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0">
                    {getStageIcon(stage)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-slate-800">{stage.name}</h4>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadge.style}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{stage.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                {(stage.status === 'in-progress' || stage.status === 'completed') && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">Progress</span>
                      <span className="text-xs font-semibold text-slate-600">{stage.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${stage.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                        style={{ width: `${stage.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {stage.status === 'in-progress' && (
                  <div className="mt-4 text-sm text-blue-700 font-medium">
                    ⚙️ {stage.name} in progress...
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {!isLastStage && (
                <div className="flex justify-center py-2">
                  <div className={`w-0.5 h-8 ${stage.status === 'completed' ? 'bg-green-400' : 'bg-slate-300'}`}></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      {evaluationStatus === 'not-started' && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Processing Pipeline</p>
              <p>The evaluation will proceed through three stages: OCR extraction, text structuring, and AI-based scoring. This process may take several minutes depending on the number of scripts.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcessEvaluation
