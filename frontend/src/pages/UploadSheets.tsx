import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { useParams } from 'react-router-dom'
import type { UploadedFile } from '@/types'

function UploadSheets() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Rubric upload state
  const [rubricFile, setRubricFile] = useState<UploadedFile | null>(null)
  const rubricInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFiles(files)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  // Rubric file upload handlers
  const handleRubricFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setRubricFile({
        id: `rubric-${Date.now()}`,
        name: file.name,
        size: file.size,
      })
    }
  }

  const handleRubricBrowseClick = () => {
    rubricInputRef.current?.click()
  }

  const handleRemoveRubric = () => {
    setRubricFile(null)
    if (rubricInputRef.current) {
      rubricInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Upload Answer Sheets</h1>
        <p className="text-slate-600">
          Evaluation ID: <span className="font-semibold text-slate-800">{evaluationId}</span>
        </p>
      </div>

      {/* Rubric Upload Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Upload Evaluation Rubric</h2>

        {!rubricFile ? (
          <div className="bg-white border-2 border-slate-200 rounded-lg p-6">
            <input
              ref={rubricInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleRubricFileChange}
              className="hidden"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-slate-700">Upload rubric document</p>
                  <p className="text-sm text-slate-500">PDF, DOC, DOCX, or TXT files accepted</p>
                </div>
              </div>

              <button
                onClick={handleRubricBrowseClick}
                className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Choose File
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{rubricFile.name}</p>
                  <p className="text-sm text-slate-500">{formatFileSize(rubricFile.size)}</p>
                </div>
              </div>

              <button
                onClick={handleRemoveRubric}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                title="Remove rubric"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Answer Sheets Upload Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Upload Answer Sheets</h2>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-3 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${isDragging
          ? 'border-blue-600 bg-blue-50'
          : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <svg
            className={`w-16 h-16 mb-4 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            {isDragging ? 'Drop files here' : 'Drag and drop files here'}
          </h3>
          <p className="text-slate-600 mb-4">or</p>

          <button
            onClick={handleBrowseClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Browse Files
          </button>

          <p className="text-sm text-slate-500 mt-4">
            Supported formats: Images (PNG, JPG, JPEG) and PDF files
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Uploaded Files ({uploadedFiles.length})
            </h2>
            <button
              onClick={() => setUploadedFiles([])}
              className="text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Clear All
            </button>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* File Icon */}
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                  title="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Files ready for processing</p>
                <p>Proceed to the Rubric Builder to define evaluation criteria, or navigate to Process Evaluation when ready.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadSheets
