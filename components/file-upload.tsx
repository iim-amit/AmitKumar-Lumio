"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  transcript: string
  onTranscriptChange: (transcript: string) => void
}

export function FileUpload({ transcript, onTranscriptChange }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileRead = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onTranscriptChange(content)
        setUploadedFile(file)
        setUploadStatus("success")
      }
      reader.onerror = () => {
        setUploadStatus("error")
      }
      reader.readAsText(file)
    },
    [onTranscriptChange],
  )

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndProcessFile(file)
    }
  }

  const validateAndProcessFile = (file: File) => {
    // Reset status
    setUploadStatus("idle")

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/rtf",
      "application/rtf",
    ]

    const allowedExtensions = [".txt", ".pdf", ".doc", ".docx", ".rtf"]

    const isValidType =
      allowedTypes.some((type) => file.type.includes(type)) ||
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      setUploadStatus("error")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error")
      return
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      // For PDF files, we'll need a PDF parser - for now show instruction
      onTranscriptChange(
        `PDF file uploaded: ${file.name}\n\nNote: Please copy and paste the text content from your PDF file into the text area below, as PDF parsing requires additional setup.`,
      )
      setUploadedFile(file)
      setUploadStatus("success")
    } else if (file.name.toLowerCase().endsWith(".doc") || file.name.toLowerCase().endsWith(".docx")) {
      // For Word documents, show instruction
      onTranscriptChange(
        `Word document uploaded: ${file.name}\n\nNote: Please copy and paste the text content from your Word document into the text area below, as Word document parsing requires additional setup.`,
      )
      setUploadedFile(file)
      setUploadStatus("success")
    } else {
      // Handle text files normally
      handleFileRead(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
    setUploadStatus("idle")
    onTranscriptChange("")
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Upload className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case "success":
        return `Successfully loaded: ${uploadedFile?.name}`
      case "error":
        return "Error: Please upload a valid document file (.txt, .pdf, .doc, .docx, .rtf) - max 10MB"
      default:
        return "Drag and drop a document file here, or click to browse"
    }
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          uploadStatus === "success" ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "",
          uploadStatus === "error" ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".txt,.pdf,.doc,.docx,.rtf,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium">{getStatusMessage()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports: .txt, .pdf, .doc, .docx, .rtf files up to 10MB
            </p>
          </div>

          {uploadedFile && uploadStatus === "success" && (
            <div className="flex items-center gap-2 mt-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{uploadedFile.name}</span>
              <Button variant="ghost" size="sm" onClick={clearFile} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Text Input */}
      <div>
        <Label htmlFor="transcript-input">Or Paste Transcript Directly</Label>
        <Textarea
          id="transcript-input"
          placeholder="Paste your meeting transcript here..."
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          className="min-h-32 mt-2"
        />
      </div>

      {/* File Info */}
      {transcript && (
        <div className="text-xs text-muted-foreground">Character count: {transcript.length.toLocaleString()}</div>
      )}
    </div>
  )
}
