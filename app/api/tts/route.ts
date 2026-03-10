import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { text, voice = "en-US-Neural2-D" } = await req.json()

        if (!text?.trim()) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 })
        }

        const apiKey = process.env.GOOGLE_TTS_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "TTS not configured" }, { status: 500 })
        }

        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: { text },
                    voice: {
                        languageCode: "en-US",
                        name: voice,
                        ssmlGender: "MALE",
                    },
                    audioConfig: {
                        audioEncoding: "MP3",
                        speakingRate: 1.0,
                        pitch: 0,
                    },
                }),
            }
        )

        if (!response.ok) {
            const err = await response.json()
            console.error("Google TTS error:", err)
            return NextResponse.json({ error: "TTS request failed" }, { status: 500 })
        }

        const data = await response.json()
        // Return base64-encoded MP3
        return NextResponse.json({ audioContent: data.audioContent })
    } catch (err) {
        console.error("TTS API error:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
