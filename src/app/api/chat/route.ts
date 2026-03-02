import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_INSTRUCTION = `You are igniteHER AI, a supportive STEM career mentor designed specifically to guide girls and women in science, technology, engineering, and mathematics.

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
4. Keep tone encouraging, warm, and empowering — like a supportive older sister in STEM
5. Structure responses with clear sections using emojis as headers
6. Limit responses to 300-500 words unless user explicitly asks for a detailed explanation
7. Always end with an encouraging closing statement

Response structure to follow:
✨ [Personalized acknowledgment based on their profile]
🎯 [Core guidance/explanation]
📍 Action Steps: [numbered list]
💡 Project Ideas: [if applicable]
🗺️ Learning Path: [if applicable]
💪 [Encouraging closing]`

const TOPIC_KEYWORDS = ['stem', 'career', 'job', 'study', 'learn', 'coding', 'programming', 'science', 'technology', 'engineering', 'math', 'mathematics', 'ai', 'machine learning', 'data', 'cyber', 'robot', 'bio', 'research', 'scholarship', 'internship', 'skill', 'python', 'java', 'project', 'course', 'degree', 'college', 'university', 'mentor', 'hackathon', 'competition', 'confidence', 'interview', 'resume', 'portfolio', 'github', 'startup', 'isro', 'nasa', 'google', 'microsoft', 'how', 'what', 'where', 'which', 'should', 'help', 'suggest', 'recommend', 'overcome', 'improve', 'start', 'begin', 'beginner', 'advanced', 'roadmap']

function isSTEMRelated(message: string): boolean {
    const lower = message.toLowerCase()
    return TOPIC_KEYWORDS.some(kw => lower.includes(kw))
}

function buildProfileContext(profile: Record<string, unknown>): string {
    if (!profile) return ''
    return `
=== STUDENT PROFILE (Use this to personalize every response) ===
Name: ${profile.full_name || 'Student'}
Age: ${profile.age || 'Not specified'}
Education Level: ${profile.education_level || 'Not specified'}
Field of Study: ${profile.field_of_study || 'Not specified'}
STEM Interests: ${Array.isArray(profile.interests) ? profile.interests.join(', ') : 'Not specified'}
Current Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Not specified'}
Career Aspirations: ${profile.career_aspirations || 'Not specified'}
Preferred Learning Style: ${profile.learning_style || 'Not specified'}
Challenges Faced: ${Array.isArray(profile.challenges) ? profile.challenges.join(', ') : 'Not specified'}
Preferred Mentor Type: ${profile.preferred_mentor_type || 'Not specified'}
Languages: ${Array.isArray(profile.languages) ? profile.languages.join(', ') : 'Not specified'}
Personality Traits: ${Array.isArray(profile.personality_traits) ? profile.personality_traits.join(', ') : 'Not specified'}
=== END PROFILE ===`
}

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { message, studentProfile, sessionId, history = [] } = body

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        if (message.length > 1000) {
            return NextResponse.json({ error: 'Message too long' }, { status: 400 })
        }

        // Topic restriction check
        if (!isSTEMRelated(message)) {
            const fallback = "I specialize in STEM career guidance and education. Let's explore something related to your career growth! 🌟 What would you like to know about STEM careers, learning paths, or opportunities?"

            // Save to DB if session exists
            if (sessionId) {
                await supabase.from('chat_messages').insert([
                    { session_id: sessionId, sender: 'user', message },
                    { session_id: sessionId, sender: 'assistant', message: fallback }
                ])
            }
            return NextResponse.json({ reply: fallback })
        }

        // Build full system instruction with profile
        const profileContext = buildProfileContext(studentProfile || {})
        const fullSystemInstruction = SYSTEM_INSTRUCTION + '\n\n' + profileContext

        // Get or create session
        let currentSessionId = sessionId
        if (!currentSessionId) {
            const { data: session } = await supabase
                .from('chat_sessions')
                .insert({ user_id: user.id })
                .select('id')
                .single()
            currentSessionId = session?.id
        }

        // Rate limit: max 20 messages per session
        if (currentSessionId) {
            const { count } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', currentSessionId)
                .eq('sender', 'user')

            if ((count || 0) >= 20) {
                return NextResponse.json({
                    reply: "You've reached the session limit of 20 messages. Please start a new chat session to continue! 💫",
                    sessionLimitReached: true
                })
            }
        }

        // Build chat history (last 5 turns = 10 messages)
        const recentHistory = history.slice(-10)
        const geminiHistory = recentHistory.map((msg: { sender: string; message: string }) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.message }]
        }))

        // Call Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: fullSystemInstruction,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
            generationConfig: {
                maxOutputTokens: 600,
                temperature: 0.7,
            }
        })

        const chat = model.startChat({ history: geminiHistory })
        const result = await chat.sendMessage(message)
        const reply = result.response.text()

        // Save messages to DB
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
            reply: "I'm having a little technical hiccup right now. Please try again in a moment! 💜"
        }, { status: 200 })
    }
}
