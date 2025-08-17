"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Send, Plus, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface EmailShareProps {
  summary: string
  trigger?: React.ReactNode
}

const EMAIL_TEMPLATES = {
  professional: {
    name: "Professional",
    subject: "Meeting Summary - {date}",
    body: `Hi there,

Please find the meeting summary below:

{summary}

Best regards`,
  },
  casual: {
    name: "Casual",
    subject: "Meeting Notes from {date}",
    body: `Hey!

Here are the notes from our meeting:

{summary}

Thanks!`,
  },
  detailed: {
    name: "Detailed Report",
    subject: "Detailed Meeting Report - {date}",
    body: `Dear Team,

I hope this email finds you well. Please find attached the comprehensive summary of our meeting held on {date}.

{summary}

Please review the action items and let me know if you have any questions or concerns.

Best regards`,
  },
}

export function EmailShare({ summary, trigger }: EmailShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("professional")
  const [format, setFormat] = useState("html")
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Fixed sender email
  const senderEmail = "6661kumaramit@gmail.com"

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const addRecipient = () => {
    if (currentEmail && validateEmail(currentEmail) && !recipients.includes(currentEmail)) {
      setRecipients([...recipients, currentEmail])
      setCurrentEmail("")
    }
  }

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addRecipient()
    }
  }

  const applyTemplate = (templateKey: string) => {
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES]
    const currentDate = new Date().toLocaleDateString()

    setSubject(template.subject.replace("{date}", currentDate))
    setBody(template.body.replace("{summary}", summary).replace("{date}", currentDate))
    setSelectedTemplate(templateKey)
  }

  const getPreviewContent = () => {
    const currentDate = new Date().toLocaleDateString()
    return {
      subject: subject || `Meeting Summary - ${currentDate}`,
      body: body || summary,
    }
  }

  const sendEmail = async () => {
    if (recipients.length === 0 || !summary) return

    setIsSending(true)
    setSendStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: senderEmail, // ✅ added sender email
          recipients,
          subject: subject || `Meeting Summary - ${new Date().toLocaleDateString()}`,
          body: body || summary,
          format,
          summary,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      setSendStatus("success")
      setTimeout(() => {
        setIsOpen(false)
        setSendStatus("idle")
        setRecipients([])
        setSubject("")
        setBody("")
      }, 2000)
    } catch (error) {
      setSendStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send email")
    } finally {
      setIsSending(false)
    }
  }

  const resetForm = () => {
    setRecipients([])
    setCurrentEmail("")
    setSubject("")
    setBody("")
    setSelectedTemplate("professional")
    setSendStatus("idle")
    setErrorMessage("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            <Mail className="h-4 w-4 mr-1" />
            Share via Email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share Meeting Summary
          </DialogTitle>
          <DialogDescription>Send your meeting summary via email to team members</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4 mt-4">
            {/* Sender (fixed) */}
            <div>
              <Label>Sender</Label>
              <Input type="email" value={senderEmail} disabled className="mt-1" />
            </div>

            {/* Recipients */}
            <div>
              <Label htmlFor="recipients">Recipients</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="recipients"
                  type="email"
                  placeholder="Enter email address..."
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                  disabled={!currentEmail || !validateEmail(currentEmail)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Template Selection */}
            <div>
              <Label>Email Template</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant={selectedTemplate === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyTemplate(key)}
                    className="text-xs"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Meeting Summary"
                className="mt-1"
              />
            </div>

            {/* Format Selection */}
            <div>
              <Label htmlFor="format">Email Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML (Rich Text)</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="plain">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Body */}
            <div>
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your message..."
                className="mt-1 min-h-32"
              />
            </div>

            {/* Status Messages */}
            {sendStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Email sent successfully!
              </div>
            )}

            {sendStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errorMessage}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>From:</strong> {senderEmail}
                  </div>
                  <div>
                    <strong>To:</strong> {recipients.join(", ") || "No recipients"}
                  </div>
                  <div>
                    <strong>Subject:</strong> {getPreviewContent().subject}
                  </div>
                  <div>
                    <strong>Format:</strong> {format.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="bg-background border rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">{getPreviewContent().body}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetForm} disabled={isSending}>
            Reset
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={sendEmail} disabled={recipients.length === 0 || isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
