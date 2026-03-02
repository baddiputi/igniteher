'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Student } from '@/lib/types'

interface Message {
    id: string
    sender: 'user' | 'assistant'
    message: string
    timestamp: Date
}

type QuickPrompt = {
    label: string
    prompt: string
    icon: string
}

const QUICK_PROMPTS: QuickPrompt[] = [
    { icon: '🎯', label: 'Suggest careers for me', prompt: 'Based on my profile, what STEM careers would suit me best?' },
    { icon: '🤖', label: 'How to start AI/ML?', prompt: 'How do I start learning Artificial Intelligence and Machine Learning from scratch?' },
    { icon: '🏆', label: 'Find scholarships', prompt: 'What scholarships and competitions are available for women in STEM?' },
    { icon: '🛡️', label: 'Cybersecurity projects', prompt: 'What are beginner-friendly projects to learn cybersecurity?' },
    { icon: '💪', label: 'Overcome confidence issues', prompt: 'How do I build confidence as a girl pursuing STEM?' },
    { icon: '🗺️', label: 'Build my roadmap', prompt: 'Can you create a personalized 6-month learning roadmap based on my interests?' },
]

function TypingIndicator() {
    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>✨</div>
            <div style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
            </div>
        </div>
    )
}

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.sender === 'user'
    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '16px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
            {!isUser && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>✨</div>
            )}
            <div style={{
                maxWidth: '78%',
                padding: '12px 16px',
                borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isUser ? 'linear-gradient(135deg, #7e22ce, #9333ea)' : 'rgba(168,85,247,0.1)',
                border: isUser ? 'none' : '1px solid rgba(168,85,247,0.2)',
                color: '#f8fafc',
                fontSize: '13.5px',
                lineHeight: '1.65',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            }}>
                {msg.message}
            </div>
            {isUser && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>👩</div>
            )}
        </div>
    )
}

interface ChatWidgetProps {
    student: Student | null
}

export default function ChatWidget({ student }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [showQuickPrompts, setShowQuickPrompts] = useState(true)
    const [messageCount, setMessageCount] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => { scrollToBottom() }, [messages, isLoading])

    // Load chat history when opened
    useEffect(() => {
        if (!isOpen || messages.length > 0) return
        const loadHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: sessions } = await supabase
                .from('chat_sessions')
                .select('id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)

            if (sessions && sessions.length > 0) {
                const sid = sessions[0].id
                setSessionId(sid)
                const { data: msgs } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .eq('session_id', sid)
                    .order('timestamp', { ascending: true })
                    .limit(30)

                if (msgs && msgs.length > 0) {
                    setMessages(msgs.map(m => ({ id: m.id, sender: m.sender as 'user' | 'assistant', message: m.message, timestamp: new Date(m.timestamp) })))
                    setShowQuickPrompts(false)
                    setMessageCount(msgs.filter(m => m.sender === 'user').length)
                }
            }

            // Add welcome message if no history
            if (!sessions || sessions.length === 0) {
                const welcome: Message = {
                    id: 'welcome',
                    sender: 'assistant',
                    message: `Hi ${student?.full_name?.split(' ')[0] || 'there'}! 👋 I'm igniteHER AI — your personal STEM career mentor.\n\nI'm here to help you explore careers, plan your learning journey, find scholarships, and overcome any challenges in your STEM path.\n\nWhat would you like to explore today? ✨`,
                    timestamp: new Date()
                }
                setMessages([welcome])
            }
        }
        loadHistory()
    }, [isOpen])

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
    }, [isOpen])

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || isLoading || messageCount >= 20) return

        setShowQuickPrompts(false)
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', message: trimmed, timestamp: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInputValue('')
        setIsLoading(true)
        setMessageCount(prev => prev + 1)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmed,
                    studentProfile: student,
                    sessionId,
                    history: messages.slice(-10).map(m => ({ sender: m.sender, message: m.message })),
                }),
            })
            const data = await res.json()
            if (data.sessionId && !sessionId) setSessionId(data.sessionId)
            const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'assistant', message: data.reply || "Something went wrong. Please try again.", timestamp: new Date() }
            setMessages(prev => [...prev, aiMsg])
        } catch {
            setMessages(prev => [...prev, { id: 'err', sender: 'assistant', message: "I had a technical issue. Please try again! 💜", timestamp: new Date() }])
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, messages, sessionId, student, messageCount])

    const clearChat = async () => {
        setMessages([])
        setSessionId(null)
        setShowQuickPrompts(true)
        setMessageCount(0)
        const welcome: Message = { id: 'welcome-new', sender: 'assistant', message: `Fresh start! 🌟 I'm here to help you with your STEM journey, ${student?.full_name?.split(' ')[0] || 'there'}. What would you like to explore?`, timestamp: new Date() }
        setMessages([welcome])
    }

    return (
        <>
            <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chat-slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .chat-panel { animation: chat-slide-in 0.3s ease forwards; }
        .chat-input:focus { outline: none; border-color: rgba(168,85,247,0.5) !important; background: rgba(168,85,247,0.08) !important; }
        .quick-prompt-btn:hover { background: rgba(168,85,247,0.2) !important; border-color: rgba(168,85,247,0.4) !important; transform: translateY(-1px); }
      `}</style>

            {/* Floating button */}
            <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 1000 }}>
                {!isOpen && (
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(168,85,247,0.4)', animation: 'pulse-ring 2s ease-out infinite' }} />
                        <button
                            onClick={() => setIsOpen(true)}
                            style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, #9333ea, #db2777)', border: 'none', cursor: 'pointer', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(147,51,234,0.45)', transition: 'transform 0.2s ease', position: 'relative' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                            title="Chat with igniteHER AI"
                        >✨</button>
                        <div style={{ position: 'absolute', top: '-8px', right: '-4px', background: 'linear-gradient(135deg, #ec4899, #f472b6)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '100px', whiteSpace: 'nowrap', fontFamily: 'Outfit' }}>AI</div>
                    </div>
                )}

                {/* Chat Panel */}
                {isOpen && (
                    <div className="chat-panel" style={{ width: '380px', height: '580px', background: 'rgba(10,10,20,0.96)', backdropFilter: 'blur(30px)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.1)' }}>

                        {/* Header */}
                        <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(126,34,206,0.4), rgba(219,39,119,0.2))', borderBottom: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #7e22ce, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>✨</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Outfit', color: '#f8fafc' }}>igniteHER AI</div>
                                <div style={{ fontSize: '11px', color: 'rgba(248,250,252,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                                    STEM Career Mentor · Online
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={clearChat} title="New chat" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(248,250,252,0.5)', cursor: 'pointer', fontSize: '14px', padding: '6px 8px', lineHeight: 1 }}>🔄</button>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(248,250,252,0.5)', cursor: 'pointer', fontSize: '14px', padding: '6px 8px', lineHeight: 1 }}>✕</button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.3) transparent' }}>
                            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                            {isLoading && <TypingIndicator />}
                            <div ref={messagesEndRef} />

                            {/* Quick prompts */}
                            {showQuickPrompts && messages.length <= 1 && !isLoading && (
                                <div style={{ marginTop: '8px' }}>
                                    <p style={{ fontSize: '11px', color: 'rgba(248,250,252,0.35)', marginBottom: '8px', textAlign: 'center' }}>Quick start 👇</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {QUICK_PROMPTS.map(qp => (
                                            <button
                                                key={qp.label}
                                                className="quick-prompt-btn"
                                                onClick={() => sendMessage(qp.prompt)}
                                                style={{ textAlign: 'left', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '10px', padding: '8px 12px', color: 'rgba(248,250,252,0.75)', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            >
                                                <span>{qp.icon}</span> {qp.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messageCount >= 20 && (
                                <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'rgba(248,250,252,0.4)', background: 'rgba(168,85,247,0.05)', borderRadius: '10px', marginTop: '8px' }}>
                                    Session limit reached. Click 🔄 to start a new chat.
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(168,85,247,0.12)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <input
                                    ref={inputRef}
                                    className="chat-input"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue) } }}
                                    placeholder="Ask your STEM mentor..."
                                    disabled={isLoading || messageCount >= 20}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', color: '#f8fafc', fontSize: '13.5px', fontFamily: 'Inter', transition: 'all 0.2s', outline: 'none' }}
                                />
                                <button
                                    onClick={() => sendMessage(inputValue)}
                                    disabled={isLoading || !inputValue.trim() || messageCount >= 20}
                                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: inputValue.trim() ? 'linear-gradient(135deg, #7e22ce, #db2777)' : 'rgba(255,255,255,0.06)', border: 'none', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 }}
                                >→</button>
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(248,250,252,0.2)', marginTop: '6px' }}>
                                {messageCount}/20 messages · Powered by Llama 3.1
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
