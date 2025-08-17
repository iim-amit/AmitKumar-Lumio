"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit3, Eye, Save, Download, Copy, Undo2, Redo2, Bold, Italic, List, ListOrdered, Type } from "lucide-react"

interface SummaryEditorProps {
  summary: string
  onSummaryChange: (summary: string) => void
}

export function SummaryEditor({ summary, onSummaryChange }: SummaryEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState(summary)
  const [history, setHistory] = useState<string[]>([summary])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditedSummary(summary)
    setHistory([summary])
    setHistoryIndex(0)
  }, [summary])

  useEffect(() => {
    const words = editedSummary.trim().split(/\s+/).filter(Boolean).length
    const chars = editedSummary.length
    setWordCount(words)
    setCharCount(chars)
  }, [editedSummary])

  const addToHistory = (newSummary: string) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newSummary)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleTextChange = (value: string) => {
    setEditedSummary(value)
    // Auto-save to history every 10 characters
    if (Math.abs(value.length - editedSummary.length) > 10) {
      addToHistory(value)
    }
  }

  const handleSave = () => {
    onSummaryChange(editedSummary)
    setIsEditing(false)
    setLastSaved(new Date())
    addToHistory(editedSummary)
  }

  const handleCancel = () => {
    setEditedSummary(summary)
    setIsEditing(false)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setEditedSummary(history[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setEditedSummary(history[newIndex])
    }
  }

  const insertFormatting = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = editedSummary.substring(start, end)
    const newText = editedSummary.substring(0, start) + before + selectedText + after + editedSummary.substring(end)

    setEditedSummary(newText)
    addToHistory(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const exportAsMarkdown = () => {
    const blob = new Blob([summary], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-summary-${new Date().toISOString().split("T")[0]}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsText = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-summary-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSummaryStats = () => {
    const lines = summary.split("\n").filter(Boolean).length
    const sections = (summary.match(/\*\*.*?\*\*/g) || []).length
    const actionItems = (summary.match(/•.*?(?=\n|$)/g) || []).length
    return { lines, sections, actionItems }
  }

  const stats = getSummaryStats()

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Generated Summary</h3>
          {lastSaved && (
            <Badge variant="secondary" className="text-xs">
              Saved {lastSaved.toLocaleTimeString()}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Statistics */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
            <span>{stats.sections} sections</span>
            <span>{stats.actionItems} items</span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportAsMarkdown}>
                <Download className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsText}>
                <Download className="h-4 w-4 mr-2" />
                Export as Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <Eye className="h-4 w-4 mr-1" /> : <Edit3 className="h-4 w-4 mr-1" />}
            {isEditing ? "Preview" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <Tabs value={isEditing ? "edit" : "preview"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" onClick={() => setIsEditing(false)}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="edit" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <div className="bg-muted p-6 rounded-lg min-h-48">
            <div className="whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert">
              {summary || "No summary generated yet."}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <div className="space-y-3">
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-muted rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="h-8 w-8 p-0"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="h-8 w-8 p-0"
              >
                <Redo2 className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button variant="ghost" size="sm" onClick={() => insertFormatting("**", "**")} className="h-8 w-8 p-0">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertFormatting("*", "*")} className="h-8 w-8 p-0">
                <Italic className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button variant="ghost" size="sm" onClick={() => insertFormatting("• ")} className="h-8 w-8 p-0">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => insertFormatting("1. ")} className="h-8 w-8 p-0">
                <ListOrdered className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Type className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => insertFormatting("# ")}>
                    <Type className="h-4 w-4 mr-2" />
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => insertFormatting("## ")}>
                    <Type className="h-4 w-4 mr-2" />
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => insertFormatting("### ")}>
                    <Type className="h-4 w-4 mr-2" />
                    Heading 3
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Text Editor */}
            <Textarea
              ref={textareaRef}
              value={editedSummary}
              onChange={(e) => handleTextChange(e.target.value)}
              className="min-h-64 font-mono text-sm"
              placeholder="Edit your summary here..."
            />

            {/* Editor Footer */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {wordCount} words • {charCount} characters • {stats.actionItems} action items
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
