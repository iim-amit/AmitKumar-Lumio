"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { SummaryGenerator } from "@/components/summary-generator"
import { SummaryEditor } from "@/components/summary-editor"
import { EmailShare } from "@/components/email-share"

export default function MeetingNotesApp() {
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState("")

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI Meeting Notes Summarizer</h1>
          <p className="text-muted-foreground">
            Upload transcripts, customize prompts, and generate AI-powered summaries
          </p>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Transcript
            </CardTitle>
            <CardDescription>Upload a text file containing your meeting transcript or call notes</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload transcript={transcript} onTranscriptChange={setTranscript} />
          </CardContent>
        </Card>

        {/* Summary Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Summary
            </CardTitle>
            <CardDescription>Choose a template and AI model to generate your meeting summary</CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryGenerator transcript={transcript} onSummaryGenerated={setSummary} />
          </CardContent>
        </Card>

        {/* Summary Editor Section */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Summary Editor
                </span>
                <EmailShare summary={summary} />
              </CardTitle>
              <CardDescription>Edit, format, and export your AI-generated summary</CardDescription>
            </CardHeader>
            <CardContent>
              <SummaryEditor summary={summary} onSummaryChange={setSummary} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
