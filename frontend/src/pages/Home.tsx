import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Evaluation } from '@/types'

// Mock data - simulating database response
// TODO: Replace this with actual API call to fetch evaluations from database
const MOCK_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1706696400000',
    name: 'Final Exam 2024',
    courseSubject: 'Computer Science',
    maximumMarks: 100,
    answerType: 'printed',
    createdAt: '2024-01-31T10:00:00Z',
    status: 'in-progress',
    totalSheets: 45,
  },
  {
    id: 'eval-1706610000000',
    name: 'Mid-Term Assessment',
    courseSubject: 'Mathematics',
    maximumMarks: 75,
    answerType: 'handwritten',
    createdAt: '2024-01-30T14:30:00Z',
    status: 'completed',
    totalSheets: 32,
  },
  {
    id: 'eval-1706523600000',
    name: 'Quiz 3 - Data Structures',
    courseSubject: 'Computer Science',
    maximumMarks: 50,
    answerType: 'printed',
    createdAt: '2024-01-29T09:15:00Z',
    status: 'draft',
    totalSheets: 0,
  },
  {
    id: 'eval-1706437200000',
    name: 'Physics Practical Exam',
    courseSubject: 'Physics',
    maximumMarks: 80,
    answerType: 'handwritten',
    createdAt: '2024-01-28T11:45:00Z',
    status: 'completed',
    totalSheets: 28,
  },
]

function Home() {
  const [recentEvaluations, setRecentEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate fetching evaluations from database
  useEffect(() => {
    // TODO: Replace this with actual API call
    // Example: const response = await fetch('/api/evaluations/recent')
    // const data = await response.json()

    // Simulating network delay
    const fetchEvaluations = async () => {
      setIsLoading(true)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Set mock data (in production, this would be from the API response)
      setRecentEvaluations(MOCK_EVALUATIONS)
      setIsLoading(false)
    }

    fetchEvaluations()
  }, [])

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Helper function to get status badge styling
  const getStatusBadge = (status: Evaluation['status']) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    }
    const labels = {
      draft: 'Draft',
      'in-progress': 'In Progress',
      completed: 'Completed',
    }
    return { style: styles[status], label: labels[status] }
  }

  return (
    <div className="max-w-6xl mx-auto py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Sustainable AI Assessment Platform
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          An offline, privacy-preserving platform for AI-powered evaluation of student assessments.
          Process answer sheets locally with complete data security and transparency.
        </p>
      </div>

      {/* Create New Evaluation Button */}
      <div className="mb-12">
        <Link
          to="/evaluation/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Evaluation
        </Link>
      </div>

      {/* Recent Evaluations Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Evaluations</h2>

        {isLoading ? (
          // Loading skeleton
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border-2 border-slate-200 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recentEvaluations.length === 0 ? (
          // Empty state
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No evaluations yet</h3>
            <p className="text-slate-600 mb-4">Get started by creating your first evaluation</p>
            <Link
              to="/evaluation/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Create Evaluation
            </Link>
          </div>
        ) : (
          // Evaluations grid
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvaluations.map((evaluation) => {
              const statusBadge = getStatusBadge(evaluation.status)

              return (
                <Link
                  key={evaluation.id}
                  to={`/evaluation/${evaluation.id}/open`}
                  className="bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200 group"
                >
                  {/* Header with status badge */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {evaluation.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ml-2 ${statusBadge.style}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Evaluation details */}
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <span>{evaluation.courseSubject}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{formatDate(evaluation.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      <span>{evaluation.totalSheets || 0} sheets • {evaluation.maximumMarks} marks</span>
                    </div>
                  </div>

                  {/* Footer - Answer type */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-xs text-slate-500 capitalize">
                      {evaluation.answerType} answers
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Platform Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-semibold text-slate-700 mb-1">Privacy First</h4>
            <p className="text-sm text-slate-600">All processing happens locally on your device</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold text-slate-700 mb-1">Offline Capable</h4>
            <p className="text-sm text-slate-600">No internet connection required</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-semibold text-slate-700 mb-1">AI-Powered</h4>
            <p className="text-sm text-slate-600">Accurate and consistent evaluation</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
