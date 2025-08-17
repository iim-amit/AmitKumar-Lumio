"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Wand2, Clock, Users, Target, Briefcase, Settings, Loader2 } from "lucide-react"

interface SummaryGeneratorProps {
  transcript: string
  onSummaryGenerated: (summary: string) => void
}

const PROMPT_TEMPLATES = {
  general: {
    name: "General Meeting",
    icon: Users,
    prompt: "Please summarize the key points, action items, and decisions from this meeting.",
  },
  standup: {
    name: "Daily Standup",
    icon: Clock,
    prompt:
      "Summarize this standup meeting focusing on: 1) What was accomplished yesterday, 2) What's planned for today, 3) Any blockers or impediments mentioned.",
  },
  project: {
    name: "Project Review",
    icon: Target,
    prompt:
      "Create a project review summary including: project status, milestones achieved, upcoming deadlines, risks identified, and next steps.",
  },
  business: {
    name: "Business Meeting",
    icon: Briefcase,
    prompt:
      "Summarize this business meeting with focus on: strategic decisions, financial discussions, market insights, and action items with owners and deadlines.",
  },
  custom: {
    name: "Custom",
    icon: Settings,
    prompt: "",
  },
}

const AI_MODELS = [
  { id: "gpt-4", name: "GPT-4", description: "Most capable, best for complex analysis" },
  { id: "gpt-3.5", name: "GPT-3.5 Turbo", description: "Fast and efficient" },
  { id: "claude", name: "Claude", description: "Great for detailed summaries" },
  { id: "groq", name: "Groq", description: "Ultra-fast processing" },
]

export function SummaryGenerator({ transcript, onSummaryGenerated }: SummaryGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("general")
  const [customPrompt, setCustomPrompt] = useState(PROMPT_TEMPLATES.general.prompt)
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (templateId !== "custom") {
      setCustomPrompt(PROMPT_TEMPLATES[templateId as keyof typeof PROMPT_TEMPLATES].prompt)
    }
  }

  const generateSummary = async () => {
    if (!transcript.trim() || !customPrompt.trim()) return

    setIsGenerating(true)
    setProgress(0)
    setError("")

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 200)

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          prompt: customPrompt,
          model: selectedModel,
          template: selectedTemplate,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      onSummaryGenerated(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary")
    } finally {
      setIsGenerating(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const getTranscriptStats = () => {
    const words = transcript.trim().split(/\s+/).length
    const characters = transcript.length
    const estimatedReadTime = Math.ceil(words / 200) // Average reading speed
    return { words, characters, estimatedReadTime }
  }

  const stats = getTranscriptStats()

  return (
    <div className="space-y-6">
      {/* Transcript Statistics */}
      {transcript && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{stats.words.toLocaleString()} words</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{stats.characters.toLocaleString()} characters</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary">~{stats.estimatedReadTime} min read</Badge>
          </div>
        </div>
      )}

      {/* Template Selection */}
      <div>
        <Label className="text-base font-medium">Summary Template</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {Object.entries(PROMPT_TEMPLATES).map(([key, template]) => {
            const Icon = template.icon
            return (
              <button
                key={key}
                onClick={() => handleTemplateChange(key)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedTemplate === key
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{template.name}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* AI Model Selection */}
      <div>
        <Label htmlFor="model-select">AI Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Prompt */}
      <div>
        <Label htmlFor="custom-prompt">
          Custom Instructions
          {selectedTemplate !== "custom" && (
            <span className="text-xs text-muted-foreground ml-2">
              (from {PROMPT_TEMPLATES[selectedTemplate as keyof typeof PROMPT_TEMPLATES].name} template)
            </span>
          )}
        </Label>
        <Textarea
          id="custom-prompt"
          value={customPrompt}
          onChange={(e) => {
            setCustomPrompt(e.target.value)
            if (selectedTemplate !== "custom") {
              setSelectedTemplate("custom")
            }
          }}
          className="mt-1 min-h-24"
          placeholder="Enter your custom summarization instructions..."
        />
      </div>

      {/* Generate Button and Progress */}
      <div className="space-y-3">
        <Button
          onClick={generateSummary}
          disabled={!transcript.trim() || !customPrompt.trim() || isGenerating}
          size="lg"
          className="w-full flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate AI Summary
            </>
          )}
        </Button>

        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Processing with {AI_MODELS.find((m) => m.id === selectedModel)?.name}...
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    </div>
  )
}
