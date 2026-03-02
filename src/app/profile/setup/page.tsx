'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const INTERESTS = [
    'Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Robotics',
    'Biotechnology', 'Aerospace', 'Web Development', 'App Development',
    'Electronics', 'Research',
]

const SKILLS = [
    'Python', 'C++', 'Java', 'JavaScript', 'Mathematics', 'Statistics',
    'Lab Techniques', 'Public Speaking', 'Problem Solving', 'Research Writing',
    'SQL', 'Flutter', 'React', 'Machine Learning',
]

const CHALLENGES = [
    'Lack of Guidance', 'Financial Constraints', 'Confidence Issues',
    'Limited Resources', 'Family Expectations', 'Lack of Peers', 'Other',
]

const TRAITS = [
    'Introvert', 'Extrovert', 'Analytical', 'Creative', 'Leadership-oriented',
    'Detail-oriented', 'Collaborative', 'Independent',
]

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
    'Marathi', 'Bengali', 'Gujarati', 'Spanish', 'French', 'Mandarin', 'Arabic']

const AVAILABILITY = [
    'Weekday mornings', 'Weekday evenings', 'Weekend mornings', 'Weekend evenings', 'Flexible',
]

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
    full_name: string
    age: string
    location_city: string
    location_country: string
    education_level: string
    field_of_study: string
    interests: string[]
    skills: string[]
    career_aspirations: string
    preferred_mentor_type: string
    availability: string[]
    learning_style: string
    languages: string[]
    extracurriculars: string
    achievements: string
    challenges: string[]
    personality_traits: string[]
    communication_style: string
}

function ChipSelect({ options, selected, onChange, label }: {
    options: string[], selected: string[], onChange: (v: string[]) => void, label?: string
}) {
    const toggle = (opt: string) => {
        onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
    }
    return (
        <div>
            {label && <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '10px', color: 'rgba(248,250,252,0.7)' }}>{label}</label>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {options.map(opt => (
                    <button key={opt} type="button" className={`chip ${selected.includes(opt) ? 'selected' : ''}`}
                        onClick={() => toggle(opt)}>
                        {selected.includes(opt) ? '✓ ' : ''}{opt}
                    </button>
                ))}
            </div>
        </div>
    )
}

const STEPS = ['Basic Info', 'Interests', 'Skills & Goals', 'Preferences', 'Challenges']

export default function ProfileSetupPage() {
    const [step, setStep] = useState<Step>(1)
    const [form, setForm] = useState<FormData>({
        full_name: '', age: '', location_city: '', location_country: '',
        education_level: '', field_of_study: '', interests: [], skills: [],
        career_aspirations: '', preferred_mentor_type: '', availability: [],
        learning_style: '', languages: [], extracurriculars: '', achievements: '',
        challenges: [], personality_traits: [], communication_style: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const set = (key: keyof FormData, value: string | string[]) =>
        setForm(prev => ({ ...prev, [key]: value }))

    const inputStyle = { marginBottom: '20px' }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { error: dbError } = await supabase.from('students').upsert({
            user_id: user.id,
            full_name: form.full_name,
            age: form.age ? parseInt(form.age) : null,
            location_city: form.location_city,
            location_country: form.location_country,
            education_level: form.education_level || null,
            field_of_study: form.field_of_study,
            interests: form.interests,
            skills: form.skills,
            career_aspirations: form.career_aspirations,
            preferred_mentor_type: form.preferred_mentor_type || null,
            availability: form.availability,
            learning_style: form.learning_style || null,
            languages: form.languages,
            extracurriculars: form.extracurriculars,
            achievements: form.achievements,
            challenges: form.challenges,
            personality_traits: form.personality_traits,
            communication_style: form.communication_style || null,
        }, { onConflict: 'user_id' })

        if (dbError) { setError(dbError.message); setLoading(false); return }
        router.push('/dashboard')
    }

    const label = (text: string, required = false) => (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'rgba(248,250,252,0.7)' }}>
            {text}{required && <span style={{ color: '#f472b6', marginLeft: '4px' }}>*</span>}
        </label>
    )

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
            <div className="orb orb-purple" style={{ width: '500px', height: '500px', top: '0', left: '0', opacity: 0.4 }} />
            <div className="orb orb-pink" style={{ width: '400px', height: '400px', bottom: '0', right: '0', opacity: 0.35 }} />

            <div style={{ width: '100%', maxWidth: '620px', position: 'relative' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '8px' }}>
                        Build your <span className="gradient-text">profile</span>
                    </h1>
                    <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '15px' }}>
                        Step {step} of {STEPS.length} — {STEPS[step - 1]}
                    </p>
                </div>

                {/* Progress */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '36px', justifyContent: 'center' }}>
                    {STEPS.map((_, i) => (
                        <div key={i} className={`step-dot ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}`} />
                    ))}
                </div>

                <div className="glass-strong" style={{ padding: '40px' }}>
                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '24px' }}>👋 Tell us about yourself</h2>
                            <div style={inputStyle}>{label('Full Name', true)}<input className="input-field" placeholder="e.g. Priya Sharma" value={form.full_name} onChange={e => set('full_name', e.target.value)} required /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>{label('Age')}<input className="input-field" type="number" placeholder="e.g. 18" value={form.age} onChange={e => set('age', e.target.value)} /></div>
                                <div>{label('Education Level')}<select className="input-field" value={form.education_level} onChange={e => set('education_level', e.target.value)}><option value="">Select...</option>{['School', 'UG', 'PG', 'Other'].map(o => <option key={o}>{o}</option>)}</select></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>{label('City')}<input className="input-field" placeholder="e.g. Mumbai" value={form.location_city} onChange={e => set('location_city', e.target.value)} /></div>
                                <div>{label('Country')}<input className="input-field" placeholder="e.g. India" value={form.location_country} onChange={e => set('location_country', e.target.value)} /></div>
                            </div>
                            <div style={inputStyle}>{label('Current Field of Study')}<input className="input-field" placeholder="e.g. Computer Science" value={form.field_of_study} onChange={e => set('field_of_study', e.target.value)} /></div>
                        </div>
                    )}

                    {/* Step 2: Interests */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px' }}>🌟 Your STEM interests</h2>
                            <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '14px', marginBottom: '24px' }}>Select all that excite you. This powers your career recommendations.</p>
                            <ChipSelect options={INTERESTS} selected={form.interests} onChange={v => set('interests', v)} label="Interests (select multiple)" />
                            <div style={{ marginTop: '28px' }}>
                                <ChipSelect options={LANGUAGES} selected={form.languages} onChange={v => set('languages', v)} label="Languages you speak" />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Skills & Goals */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px' }}>🛠️ Skills & career goals</h2>
                            <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '14px', marginBottom: '24px' }}>Your existing skills help us match you better.</p>
                            <ChipSelect options={SKILLS} selected={form.skills} onChange={v => set('skills', v)} label="Your current skills" />
                            <div style={{ marginTop: '24px' }}>{label('Career Aspirations')}
                                <textarea className="input-field" placeholder="What do you dream of achieving in STEM? Tell us in your own words..." value={form.career_aspirations} onChange={e => set('career_aspirations', e.target.value)} rows={3} style={{ resize: 'none' }} />
                            </div>
                            <div style={{ marginTop: '16px' }}>{label('Achievements & Projects')}
                                <textarea className="input-field" placeholder="Any projects, competitions, or achievements you're proud of?" value={form.achievements} onChange={e => set('achievements', e.target.value)} rows={3} style={{ resize: 'none' }} />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Preferences */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px' }}>⚙️ Your preferences</h2>
                            <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '14px', marginBottom: '24px' }}>We'll use these to find your ideal mentor and match your learning style.</p>

                            <div style={inputStyle}>{label('Preferred Mentor Type')}
                                <select className="input-field" value={form.preferred_mentor_type} onChange={e => set('preferred_mentor_type', e.target.value)}>
                                    <option value="">Select...</option>
                                    {['Academic', 'Industry Professional', 'Researcher', 'Entrepreneur'].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>

                            <div style={inputStyle}>{label('Learning Style')}
                                <select className="input-field" value={form.learning_style} onChange={e => set('learning_style', e.target.value)}>
                                    <option value="">Select...</option>
                                    {['Visual', 'Hands-on', 'Theoretical', 'Hybrid'].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>

                            <div style={inputStyle}>{label('Preferred Communication Style')}
                                <select className="input-field" value={form.communication_style} onChange={e => set('communication_style', e.target.value)}>
                                    <option value="">Select...</option>
                                    {['Chat', 'Email', 'Video'].map(o => <option key={o}>{o}</option>)}
                                </select>
                            </div>

                            <ChipSelect options={AVAILABILITY} selected={form.availability} onChange={v => set('availability', v)} label="Availability" />

                            <div style={{ marginTop: '24px' }}>
                                <ChipSelect options={TRAITS} selected={form.personality_traits} onChange={v => set('personality_traits', v)} label="Personality traits (optional)" />
                            </div>
                        </div>
                    )}

                    {/* Step 5: Challenges */}
                    {step === 5 && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px' }}>💪 Challenges & activities</h2>
                            <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '14px', marginBottom: '24px' }}>Understanding your challenges helps us support you better. You're not alone.</p>
                            <ChipSelect options={CHALLENGES} selected={form.challenges} onChange={v => set('challenges', v)} label="Challenges you've faced" />
                            <div style={{ marginTop: '24px' }}>{label('Extracurricular Activities')}
                                <textarea className="input-field" placeholder="Clubs, sports, volunteering, arts — whatever you enjoy outside of studies!" value={form.extracurriculars} onChange={e => set('extracurriculars', e.target.value)} rows={3} style={{ resize: 'none' }} />
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px' }}>
                        {step > 1 ? (
                            <button className="btn-ghost" onClick={() => setStep(prev => (prev - 1) as Step)}>
                                ← Back
                            </button>
                        ) : <div />}

                        {step < 5 ? (
                            <button className="btn-primary" onClick={() => setStep(prev => (prev + 1) as Step)}>
                                Continue →
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Saving...' : '🚀 View my dashboard'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
