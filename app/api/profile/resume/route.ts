import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { PDFParse } from "pdf-parse"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const formData = await req.formData()
        const file = formData.get("file") as File
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 })

        // 1. Extract text from PDF
        const buffer = Buffer.from(await file.arrayBuffer())
        
        let rawText = ""
        try {
            const parser = new PDFParse({ data: new Uint8Array(buffer) })
            const textResult = await parser.getText()
            rawText = textResult.text
        } catch (parseError) {
            console.error("PDF Parsing error:", parseError)
            return NextResponse.json({ error: "Failed to parse PDF document." }, { status: 400 })
        }
        
        if (!rawText || rawText.trim() === "") {
            return NextResponse.json({ error: "No text could be extracted from this PDF." }, { status: 400 })
        }

        // 2. Parse into structured JSON using Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        contact: {
                            type: SchemaType.OBJECT,
                            properties: {
                                email: { type: SchemaType.STRING },
                                phone: { type: SchemaType.STRING },
                                linkedin: { type: SchemaType.STRING },
                                github: { type: SchemaType.STRING },
                            }
                        },
                        education: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    institution: { type: SchemaType.STRING },
                                    degree: { type: SchemaType.STRING },
                                    score: { type: SchemaType.STRING }, // 10th, 12th, or CGPA
                                    year: { type: SchemaType.STRING },
                                }
                            }
                        },
                        skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        experience: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    company: { type: SchemaType.STRING },
                                    role: { type: SchemaType.STRING },
                                    duration: { type: SchemaType.STRING },
                                    highlights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                }
                            }
                        },
                        projects: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    name: { type: SchemaType.STRING },
                                    tech_stack: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                    highlights: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                }
                            }
                        },
                        achievements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        summary: { type: SchemaType.STRING },
                    }
                }
            }
        })

        const prompt = `Extract all details from this resume text into a structured JSON format:
        
        Resume text:
        ${rawText}
        
        If any information is missing (like a GitHub profile or phone number), leave it as null. Extract any prominent awards, extracurriculars, or miscellaneous achievements into the "achievements" array.`

        const result = await model.generateContent(prompt)
        const resumeData = JSON.parse(result.response.text())

        // 3. Save to profile
        // Optional: upload the actual file to Supabase Storage if bucket exists
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ resume_data: resumeData })
            .eq("id", user.id)

        if (updateError) throw updateError

        return NextResponse.json({ success: true, data: resumeData })
    } catch (err: any) {
        console.error("Resume parse error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
