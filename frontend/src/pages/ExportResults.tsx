import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ExportFormat, ExportScope } from '@/types'

function ExportResults() {
  const { evaluationId } = useParams<{ evaluationId: string }>()

  // State management
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [selectedScope, setSelectedScope] = useState<ExportScope>('entire')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [exportLocation, setExportLocation] = useState('')

  // Mock evaluation data
  const [evaluationName] = useState('Final Exam 2024')
  const [totalScripts] = useState(45)

  // Handle export action
  const handleExport = async () => {
    setIsExporting(true)
    setExportComplete(false)

    // Simulate export process with delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock file location
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const formatExt = selectedFormat.toUpperCase()
    const scopeLabel = selectedScope === 'entire' ? 'Complete' : 'Individual_Scripts'
    const fileName = `${evaluationName.replace(/\s+/g, '_')}_${scopeLabel}_Results_${timestamp}.${selectedFormat}`
    const mockLocation = `C:\\Users\\Downloads\\${fileName}`

    setExportLocation(mockLocation)
    setIsExporting(false)
    setExportComplete(true)

    // TODO: Replace with actual file generation logic
    // Example: Generate CSV or PDF file and trigger download
  }

  // Get format icon
  const getFormatIcon = (format: ExportFormat) => {
    if (format === 'csv') {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Export Results</h1>
        <p className="text-slate-600">
          Download evaluation results for offline record-keeping
        </p>
      </div>

      {/* Evaluation Info */}
      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Evaluation Details</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Evaluation Name</p>
            <p className="font-semibold text-slate-800">{evaluationName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Evaluation ID</p>
            <p className="font-semibold text-slate-800">{evaluationId}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Scripts</p>
            <p className="font-semibold text-slate-800">{totalScripts} answer sheets</p>
          </div>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="bg-white border-2 border-slate-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Export Configuration</h2>

        {/* Format Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Export Format
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            {/* CSV Option */}
            <label
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedFormat === 'csv'
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <input
                type="radio"
                name="format"
                value="csv"
                checked={selectedFormat === 'csv'}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={`${selectedFormat === 'csv' ? 'text-blue-600' : 'text-slate-400'}`}>
                  {getFormatIcon('csv')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">CSV Format</span>
                    {selectedFormat === 'csv' && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Spreadsheet format with marks only. Best for data analysis and grade processing.
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    Includes: Roll No, Student Name, Total Marks, Percentage
                  </div>
                </div>
              </div>
            </label>

            {/* PDF Option */}
            <label
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedFormat === 'pdf'
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={selectedFormat === 'pdf'}
                onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={`${selectedFormat === 'pdf' ? 'text-blue-600' : 'text-slate-400'}`}>
                  {getFormatIcon('pdf')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">PDF Format</span>
                    {selectedFormat === 'pdf' && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Professional document with marks and detailed feedback. Printable and shareable.
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    Includes: Complete scores, AI feedback, rubric breakdown
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Scope Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Export Scope
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Entire Evaluation */}
            <label
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedScope === 'entire'
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <input
                type="radio"
                name="scope"
                value="entire"
                checked={selectedScope === 'entire'}
                onChange={(e) => setSelectedScope(e.target.value as ExportScope)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <svg className={`w-6 h-6 ${selectedScope === 'entire' ? 'text-blue-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">Entire Evaluation</span>
                    {selectedScope === 'entire' && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Single file with all {totalScripts} students' results
                  </p>
                </div>
              </div>
            </label>

            {/* Individual Scripts */}
            <label
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedScope === 'individual'
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <input
                type="radio"
                name="scope"
                value="individual"
                checked={selectedScope === 'individual'}
                onChange={(e) => setSelectedScope(e.target.value as ExportScope)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <svg className={`w-6 h-6 ${selectedScope === 'individual' ? 'text-blue-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800">Individual Scripts</span>
                    {selectedScope === 'individual' && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Separate file for each student (ZIP archive)
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Export Action */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-sm text-slate-600">
          {selectedFormat === 'csv' ? '📊 CSV' : '📄 PDF'} •
          {selectedScope === 'entire' ? ` ${totalScripts} students in 1 file` : ` ${totalScripts} separate files`}
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${isExporting
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
        >
          {isExporting ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Results
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {exportComplete && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8 animate-fadeIn">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-2">Export Successful!</h3>
              <p className="text-sm text-green-700 mb-3">
                Your {selectedFormat.toUpperCase()} file{selectedScope === 'individual' ? 's have' : ' has'} been generated and saved.
              </p>
              <div className="bg-white border border-green-200 rounded p-3 mb-3">
                <p className="text-xs text-slate-500 mb-1">Export Location:</p>
                <p className="text-sm font-mono text-slate-800 break-all">{exportLocation}</p>
              </div>
              <p className="text-xs text-green-700">
                💡 In production, this would trigger an actual file download to your default Downloads folder.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Offline Export</p>
            <p>All exports are generated locally without internet connection. Your data never leaves your device, ensuring complete privacy and data security.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportResults
