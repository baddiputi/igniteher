import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const HF_API_KEY = process.env.HF_API_KEY || ''
const HF_API_URL = 'https://router.huggingface.co/novita/v3/openai/chat/completions'
const MODEL = 'meta-llama/llama-3.1-8b-instruct'

const SYSTEM_PROMPT = `You are igniteHER AI, a supportive STEM career mentor designed specifically to guide girls and women in science, technology, engineering, and mathematics.

Your role is to:
- Provide personalized STEM career guidance based on the student's profile
- Suggest structured learning paths and roadmaps
- Recommend beginner-friendly projects relevant to their interests
- Encourage confidence, growth, and resilience
- Suggest relevant scholarships, competitions, and hackathons
- Recommend mentors, courses, and community resources

Rules you MUST follow:
1. ONLY answer questions related to STEM education, career development, skills, learning paths, projects, or scholarships
2. If asked about anything unrelated (relationships, cooking, politics, entertainment, etc.), respond ONLY with: "I specialize in STEM career guidance and education. Let's explore something related to your career growth! 🌟 What would you like to know about STEM careers?"
3. Always provide practical, actionable next steps
4. Keep tone encouraging, warm, and empowering
5. Use emojis to structure responses (✨ 🎯 📍 💡 🗺️ 💪)
6. Limit responses to 300-500 words
7. Always end with an encouraging closing statement`

const STEM_KEYWORDS = ['stem', 'career', 'job', 'study', 'learn', 'coding', 'programming', 'science', 'technology', 'engineering', 'math', 'ai', 'machine learning', 'data', 'cyber', 'robot', 'bio', 'research', 'scholarship', 'internship', 'skill', 'python', 'java', 'javascript', 'project', 'course', 'degree', 'college', 'university', 'mentor', 'hackathon', 'competition', 'confidence', 'interview', 'resume', 'portfolio', 'startup', 'isro', 'nasa', 'google', 'microsoft', 'how', 'what', 'where', 'which', 'should', 'help', 'suggest', 'recommend', 'overcome', 'improve', 'start', 'begin', 'beginner', 'advanced', 'roadmap', 'path', 'guide', 'tips', 'resources', 'tools', 'software', 'hardware', 'computer', 'web', 'app', 'mobile', 'cloud', 'network', 'database', 'algorithm', 'statistics', 'physics', 'chemistry', 'biology', 'medicine', 'space', 'satellite', 'drone', 'iot', 'blockchain', 'quantum', 'aerospace', 'mechanical', 'electrical', 'civil', 'chemical', 'biotech']

function isSTEMRelated(message: string): boolean {
    const lower = message.toLowerCase()
    return STEM_KEYWORDS.some(kw => lower.includes(kw))
}

function buildProfileContext(profile: Record<string, unknown>): string {
    if (!profile || !profile.full_name) return ''
    return `\n\nSTUDENT PROFILE (personalize every response based on this):
Name: ${profile.full_name}
Age: ${profile.age || 'Not specified'}
Education: ${profile.education_level || 'Not specified'}
Field of Study: ${profile.field_of_study || 'Not specified'}
Interests: ${Array.isArray(profile.interests) ? profile.interests.join(', ') : 'Not specified'}
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Not specified'}
Career Goal: ${profile.career_aspirations || 'Not specified'}
Learning Style: ${profile.learning_style || 'Not specified'}
Challenges: ${Array.isArray(profile.challenges) ? profile.challenges.join(', ') : 'Not specified'}`
}

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { message, studentProfile, sessionId, history = [] } = body

        if (!message?.trim() || message.length > 1000) {
            return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
        }

        // Topic restriction check
        if (!isSTEMRelated(message)) {
            const fallback = "I specialize in STEM career guidance and education. Let's explore something related to your career growth! 🌟 What would you like to know about STEM careers, learning paths, or opportunities?"
            if (sessionId) {
                await supabase.from('chat_messages').insert([
                    { session_id: sessionId, sender: 'user', message },
                    { session_id: sessionId, sender: 'assistant', message: fallback }
                ])
            }
            return NextResponse.json({ reply: fallback })
        }

        // Get or create session
        let currentSessionId = sessionId
        if (!currentSessionId) {
            const { data: session } = await supabase
                .from('chat_sessions').insert({ user_id: user.id }).select('id').single()
            currentSessionId = session?.id
        }

        // Rate limit: 20 messages per session
        if (currentSessionId) {
            const { count } = await supabase.from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', currentSessionId).eq('sender', 'user')
            if ((count || 0) >= 20) {
                return NextResponse.json({
                    reply: "You've reached the session limit of 20 messages. Click 🔄 to start a new chat! 💫",
                    sessionLimitReached: true
                })
            }
        }

        // Build full system message with profile
        const systemMessage = SYSTEM_PROMPT + buildProfileContext(studentProfile || {})

        // Build messages array (last 5 history + new message)
        const recentHistory = history.slice(-10)
        const messages = [
            { role: 'system', content: systemMessage },
            ...recentHistory.map((m: { sender: string; message: string }) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.message
            })),
            { role: 'user', content: message }
        ]

        // Call HuggingFace API
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                max_tokens: 600,
                temperature: 0.75,
                stream: false,
            }),
        })

        if (!response.ok) {
            const errText = await response.text()
            console.error('HF API error:', response.status, errText)
            throw new Error(`HF API ${response.status}: ${errText.slice(0, 100)}`)
        }

        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content?.trim() || "I couldn't generate a response. Please try again!"

        // Save to DB
        if (currentSessionId) {
            await supabase.from('chat_messages').insert([
                { session_id: currentSessionId, sender: 'user', message },
                { session_id: currentSessionId, sender: 'assistant', message: reply }
            ])
        }

        return NextResponse.json({ reply, sessionId: currentSessionId })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json({
            reply: "I encountered a technical issue. Please try again in a moment! 💜"
        }, { status: 200 })
    }
}
