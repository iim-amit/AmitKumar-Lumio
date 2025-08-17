import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transcript, prompt, model, template } = await request.json()

    if (!transcript || !prompt) {
      return NextResponse.json({ error: "Transcript and prompt are required" }, { status: 400 })
    }

    const generateMockSummary = (template: string, model: string) => {
      const baseContent = transcript.split("\n").slice(0, 5).join("\n• ")

      let summary = `**Meeting Summary** (Generated with ${model})\n\n`

      switch (template) {
        case "standup":
          summary += `**Yesterday's Accomplishments:**\n• ${baseContent}\n\n**Today's Plans:**\n• Continue with ongoing tasks\n• Address any blockers\n\n**Blockers/Impediments:**\n• None reported\n`
          break
        case "project":
          summary += `**Project Status:**\n• ${baseContent}\n\n**Milestones Achieved:**\n• Key deliverables completed\n\n**Upcoming Deadlines:**\n• Next milestone in 2 weeks\n\n**Risks Identified:**\n• Monitor resource allocation\n\n**Next Steps:**\n• Continue execution as planned\n`
          break
        case "business":
          summary += `**Strategic Decisions:**\n• ${baseContent}\n\n**Financial Discussions:**\n• Budget allocation reviewed\n\n**Market Insights:**\n• Current trends analyzed\n\n**Action Items:**\n• Follow up on key initiatives\n• Schedule next review meeting\n`
          break
        default:
          summary += `**Key Points:**\n• ${baseContent}\n\n**Action Items:**\n• Follow up on discussed topics\n• Schedule next meeting\n• Review and implement suggestions\n\n**Decisions Made:**\n• Agreed to move forward with proposed plan\n• Assigned responsibilities to team members\n\n**Next Steps:**\n• Continue monitoring progress\n• Prepare for next phase\n`
      }

      summary += `\n*Generated using ${model} with ${template} template*`
      return summary
    }

    const mockSummary = generateMockSummary(template, model)

    // Simulate processing delay based on model
    const delay = model === "groq" ? 500 : model === "gpt-3.5" ? 1500 : 2500
    await new Promise((resolve) => setTimeout(resolve, delay))

    return NextResponse.json({ summary: mockSummary })
  } catch (error) {
    console.error("Error in summarize API:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
