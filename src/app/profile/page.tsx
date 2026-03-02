'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Student } from '@/lib/types'

const INTERESTS = ['Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Robotics', 'Biotechnology', 'Aerospace', 'Web Development', 'App Development', 'Electronics', 'Research']
const SKILLS = ['Python', 'C++', 'Java', 'JavaScript', 'Mathematics', 'Statistics', 'Lab Techniques', 'Public Speaking', 'Problem Solving', 'Research Writing', 'SQL', 'Flutter', 'React', 'Machine Learning']

function ChipSelect({ options, selected, onChange, label }: { options: string[], selected: string[], onChange: (v: string[]) => void, label: string }) {
    const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
    return (
        <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '10px', color: 'rgba(248,250,252,0.7)' }}>{label}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {options.map(opt => (
                    <button key={opt} type="button" className={`chip ${selected.includes(opt) ? 'selected' : ''}`} onClick={() => toggle(opt)}>
                        {selected.includes(opt) ? '✓ ' : ''}{opt}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default function ProfilePage() {
    const [student, setStudent] = useState<Student | null>(null)
    const [form, setForm] = useState<Partial<Student>>({})
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) { router.push('/login'); return }
            const { data } = await supabase.from('students').select('*').eq('user_id', user.id).single()
            if (data) { setStudent(data as Student); setForm(data as Student) }
            setLoading(false)
        })
    }, [])

    const set = (key: keyof Student, value: string | string[] | number | null) =>
        setForm(prev => ({ ...prev, [key]: value }))

    const handleSave = async () => {
        setSaving(true)
        const { error } = await supabase.from('students').update({
            full_name: form.full_name,
            age: form.age,
            location_city: form.location_city,
            location_country: form.location_country,
            education_level: form.education_level,
            field_of_study: form.field_of_study,
            interests: form.interests,
            skills: form.skills,
            career_aspirations: form.career_aspirations,
            preferred_mentor_type: form.preferred_mentor_type,
            learning_style: form.learning_style,
            languages: form.languages,
            extracurriculars: form.extracurriculars,
            achievements: form.achievements,
            challenges: form.challenges,
            personality_traits: form.personality_traits,
            communication_style: form.communication_style,
        }).eq('id', student!.id)

        if (!error) { setStudent({ ...student!, ...form } as Student); setSuccess(true); setEditing(false) }
        setSaving(false)
        setTimeout(() => setSuccess(false), 3000)
    }

    if (loading) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✨</div>
                <p style={{ color: 'rgba(248,250,252,0.5)' }}>Loading profile...</p>
            </div>
        </div>
    )

    if (!student) return null

    const inputStyle = { marginBottom: '20px' }
    const label = (txt: string) => <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'rgba(248,250,252,0.7)' }}>{txt}</label>

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px', position: 'relative' }}>
            <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '-200px', right: '-100px', opacity: 0.3 }} />

            {success && (
                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#6ee7b7', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✅ Profile updated successfully!
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7e22ce, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '30px', fontWeight: 800, color: 'white', fontFamily: 'Outfit', flexShrink: 0,
                    }}>{student.full_name?.[0]?.toUpperCase()}</div>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '4px' }}>{student.full_name}</h1>
                        {student.location_city && <p style={{ fontSize: '14px', color: 'rgba(248,250,252,0.5)' }}>📍 {student.location_city}, {student.location_country}</p>}
                        {student.education_level && <p style={{ fontSize: '13px', color: 'rgba(248,250,252,0.4)', marginTop: '4px' }}>{student.education_level} · {student.field_of_study}</p>}
                    </div>
                </div>
                <button className={editing ? 'btn-ghost' : 'btn-primary'} onClick={() => editing ? setEditing(false) : setEditing(true)} style={{ fontSize: '14px', padding: '10px 24px' }}>
                    {editing ? 'Cancel' : '✏️ Edit Profile'}
                </button>
            </div>

            {/* Interests & Skills (view mode) */}
            {!editing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {student.interests?.length > 0 && (
                        <div className="glass" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '12px' }}>🌟 Interests</h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {student.interests.map(i => <span key={i} className="tag tag-purple">{i}</span>)}
                            </div>
                        </div>
                    )}
                    {student.skills?.length > 0 && (
                        <div className="glass" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '12px' }}>🛠️ Skills</h3>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {student.skills.map(s => <span key={s} className="tag tag-blue">{s}</span>)}
                            </div>
                        </div>
                    )}
                    {student.career_aspirations && (
                        <div className="glass" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px' }}>🎯 Career Aspirations</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(248,250,252,0.6)', lineHeight: 1.7 }}>{student.career_aspirations}</p>
                        </div>
                    )}
                    {student.achievements && (
                        <div className="glass" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px' }}>🏆 Achievements</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(248,250,252,0.6)', lineHeight: 1.7 }}>{student.achievements}</p>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="glass" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)', marginBottom: '6px' }}>Learning Style</div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>{student.learning_style || '—'}</div>
                        </div>
                        <div className="glass" style={{ padding: '20px' }}>
                            <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)', marginBottom: '6px' }}>Mentor Preference</div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>{student.preferred_mentor_type || '—'}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit mode */}
            {editing && (
                <div className="glass-strong" style={{ padding: '36px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '28px' }}>Edit Profile</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>{label('Full Name')}<input className="input-field" value={form.full_name || ''} onChange={e => set('full_name', e.target.value)} /></div>
                        <div>{label('Age')}<input className="input-field" type="number" value={form.age || ''} onChange={e => set('age', parseInt(e.target.value) || null)} /></div>
                        <div>{label('City')}<input className="input-field" value={form.location_city || ''} onChange={e => set('location_city', e.target.value)} /></div>
                        <div>{label('Country')}<input className="input-field" value={form.location_country || ''} onChange={e => set('location_country', e.target.value)} /></div>
                    </div>

                    <div style={inputStyle}>{label('Field of Study')}<input className="input-field" value={form.field_of_study || ''} onChange={e => set('field_of_study', e.target.value)} /></div>

                    <div style={{ marginBottom: '24px' }}>
                        <ChipSelect options={INTERESTS} selected={form.interests || []} onChange={v => set('interests', v)} label="Interests" />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <ChipSelect options={SKILLS} selected={form.skills || []} onChange={v => set('skills', v)} label="Skills" />
                    </div>

                    <div style={inputStyle}>{label('Career Aspirations')}
                        <textarea className="input-field" value={form.career_aspirations || ''} onChange={e => set('career_aspirations', e.target.value)} rows={3} style={{ resize: 'none' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>{label('Learning Style')}<select className="input-field" value={form.learning_style || ''} onChange={e => set('learning_style', e.target.value)}>
                            <option value="">Select...</option>
                            {['Visual', 'Hands-on', 'Theoretical', 'Hybrid'].map(o => <option key={o}>{o}</option>)}
                        </select></div>
                        <div>{label('Mentor Preference')}<select className="input-field" value={form.preferred_mentor_type || ''} onChange={e => set('preferred_mentor_type', e.target.value)}>
                            <option value="">Select...</option>
                            {['Academic', 'Industry Professional', 'Researcher', 'Entrepreneur'].map(o => <option key={o}>{o}</option>)}
                        </select></div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : '✓ Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
