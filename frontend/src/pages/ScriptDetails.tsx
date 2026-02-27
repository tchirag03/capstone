import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { RubricCriterion } from '@/types'

// Mock OCR extracted text
const MOCK_OCR_TEXT = `Question 1: Implement a binary search algorithm

Answer:

Binary search is an efficient algorithm for finding a target value within a sorted array.
It works by repeatedly dividing the search interval in half.

Here's my implementation:

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    }
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

Time Complexity: O(log n)
Space Complexity: O(1)

Question 2: Explain the concept of recursion

Answer:

Recursion is a programming technique where a function calls itself to solve a problem.
It breaks down complex problems into smaller, similar sub-problems.

Key components:
1. Base case - stopping condition
2. Recursive case - function calls itself with modified parameters

Example: Factorial calculation
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

Question 3: What are the different data structures?

Answer:

Arrays - linear collection with index-based access
Linked Lists - nodes connected via pointers
Stacks - LIFO (Last In First Out)
Queues - FIFO (First In First Out)
Trees - hierarchical structure
Graphs - nodes connected by edges
Hash Tables - key-value pairs for fast lookup`

// Mock rubric criteria with scores
const MOCK_RUBRIC: RubricCriterion[] = [
  {
    id: 'algo-correctness',
    name: 'Algorithm Correctness',
    scoreAwarded: 22,
    maximumScore: 30,
    feedback: 'Binary search implementation is correct with proper handling of edge cases. Logic for updating left and right pointers is accurate.',
    category: 'good',
  },
  {
    id: 'code-quality',
    name: 'Code Quality & Style',
    scoreAwarded: 18,
    maximumScore: 20,
    feedback: 'Code is well-structured and readable. Variable names are meaningful. Good use of const for mid calculation.',
    category: 'excellent',
  },
  {
    id: 'complexity-analysis',
    name: 'Complexity Analysis',
    scoreAwarded: 8,
    maximumScore: 10,
    feedback: 'Correctly identified time complexity as O(log n) and space complexity as O(1). Could have explained the reasoning.',
    category: 'good',
  },
  {
    id: 'recursion-understanding',
    name: 'Recursion Concepts',
    scoreAwarded: 12,
    maximumScore: 15,
    feedback: 'Good explanation of recursion fundamentals. Base case and recursive case clearly identified. Example is appropriate.',
    category: 'good',
  },
  {
    id: 'data-structures',
    name: 'Data Structures Knowledge',
    scoreAwarded: 10,
    maximumScore: 15,
    feedback: 'Listed major data structures but explanations are brief. Missing details about time complexities and use cases.',
    category: 'satisfactory',
  },
  {
    id: 'presentation',
    name: 'Presentation & Clarity',
    scoreAwarded: 8,
    maximumScore: 10,
    feedback: 'Answers are well-organized and easy to follow. Good use of formatting and structure.',
    category: 'good',
  },
]

function ScriptDetails() {
  const { evaluationId, scriptId } = useParams<{ evaluationId: string; scriptId: string }>()
  const navigate = useNavigate()

  // Mock data
  const [studentName] = useState('Alice Johnson')
  const [rollNo] = useState('CS-2024-001')
  const [ocrText] = useState(MOCK_OCR_TEXT)
  const [rubricCriteria] = useState<RubricCriterion[]>(MOCK_RUBRIC)

  // Calculate total score
  const totalScore = rubricCriteria.reduce((sum, c) => sum + c.scoreAwarded, 0)
  const maximumTotal = rubricCriteria.reduce((sum, c) => sum + c.maximumScore, 0)
  const percentage = Math.round((totalScore / maximumTotal) * 100)

  // Get category badge styling
  const getCategoryBadge = (category: RubricCriterion['category']) => {
    const styles = {
      excellent: 'bg-green-100 text-green-700 border-green-200',
      good: 'bg-blue-100 text-blue-700 border-blue-200',
      satisfactory: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'needs-improvement': 'bg-red-100 text-red-700 border-red-200',
    }
    return styles[category]
  }

  // Navigate back to results
  const handleBackToResults = () => {
    navigate(`/evaluation/${evaluationId}/results`)
  }

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
            <div className="flex items-center gap-4 text-slate-600">
              <span>
                <span className="font-semibold">Student:</span> {studentName}
              </span>
              <span>•</span>
              <span>
                <span className="font-semibold">Roll No:</span> {rollNo}
              </span>
              <span>•</span>
              <span>
                <span className="font-semibold">Script ID:</span> {scriptId}
              </span>
            </div>
          </div>

          {/* Score Badge */}
          <div className="bg-blue-600 text-white rounded-lg p-4 text-center min-w-[120px]">
            <p className="text-sm font-semibold mb-1">Total Score</p>
            <p className="text-3xl font-bold">{totalScore}</p>
            <p className="text-sm opacity-90">out of {maximumTotal}</p>
            <p className="text-xs mt-2 bg-blue-700 rounded px-2 py-1">{percentage}%</p>
          </div>
        </div>
      </div>

      {/* Split View Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel: OCR Text */}
        <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden flex flex-col" style={{ maxHeight: '800px' }}>
          <div className="bg-slate-50 border-b-2 border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <h2 className="text-lg font-bold text-slate-800">OCR Extracted Text</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Digitized answer sheet content (read-only)</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {ocrText}
            </pre>
          </div>
        </div>

        {/* Right Panel: Scores & Feedback */}
        <div className="flex flex-col gap-6" style={{ maxHeight: '800px', overflowY: 'auto' }}>
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Evaluation Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Criteria Evaluated</p>
                <p className="text-2xl font-bold text-slate-800">{rubricCriteria.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Overall Score</p>
                <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
              </div>
            </div>
          </div>

          {/* Rubric Criteria */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Criterion-wise Scoring</h2>

            {rubricCriteria.map((criterion) => (
              <div
                key={criterion.id}
                className={`bg-white border-2 rounded-lg p-5 ${getCategoryBadge(criterion.category)}`}
              >
                {/* Criterion Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-800 flex-1">
                    {criterion.name}
                  </h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-800">
                      {criterion.scoreAwarded}
                    </span>
                    <span className="text-slate-500">/{criterion.maximumScore}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${criterion.category === 'excellent' ? 'bg-green-600' :
                        criterion.category === 'good' ? 'bg-blue-600' :
                          criterion.category === 'satisfactory' ? 'bg-yellow-600' :
                            'bg-red-600'
                        }`}
                      style={{ width: `${(criterion.scoreAwarded / criterion.maximumScore) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-white bg-opacity-50 rounded p-3 border border-slate-200">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {criterion.feedback}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">AI-Generated Evaluation</p>
                <p>Scores and feedback are generated using rubric-based AI analysis. All evaluations maintain consistency with the defined grading criteria.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScriptDetails
