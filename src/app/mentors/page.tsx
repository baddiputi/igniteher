export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { getTopMentors } from '@/lib/mentor-matching'
import { Student, Mentor } from '@/lib/types'

export default async function MentorsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [{ data: studentData }, { data: mentorsData }] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', user.id).single(),
        supabase.from('mentors').select('*'),
    ])

    const student = studentData as Student | null
    const mentors = (mentorsData || []) as Mentor[]
    const topMatches = student ? getTopMentors(student, mentors, 3).map(m => m.mentor.id) : []

    const mentorTypeColors: Record<string, string> = {
        'Academic': 'tag-purple', 'Industry Professional': 'tag-blue',
        'Researcher': 'tag-green', 'Entrepreneur': 'tag-amber',
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '-200px', right: '-100px', opacity: 0.3 }} />
            </div>

            <div style={{ marginBottom: '40px' }}>
                <span className="tag tag-blue" style={{ marginBottom: '12px', display: 'inline-flex' }}>👩‍🏫 Expert Mentors</span>
                <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, fontFamily: 'Outfit', marginBottom: '8px' }}>
                    Find your <span className="gradient-text">mentor</span>
                </h1>
                <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '16px', maxWidth: '500px' }}>
                    Connect with women scientists, engineers, and entrepreneurs who have walked the path before you.
                </p>
            </div>

            {topMatches.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <div className="glass" style={{ padding: '16px 20px', background: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>✨</span>
                        <span style={{ fontSize: '14px', color: 'rgba(248,250,252,0.7)' }}>
                            Your <strong style={{ color: '#c084fc' }}>top {topMatches.length} matches</strong> are highlighted below based on your profile.
                        </span>
                    </div>
                </div>
            )}

            {/* Top matches first */}
            {topMatches.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '16px' }}>
                        ⭐ Your Best Matches
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {mentors.filter(m => topMatches.includes(m.id)).map(mentor => (
                            <MentorCard key={mentor.id} mentor={mentor} mentorTypeColors={mentorTypeColors} isTop />
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '16px' }}>
                    All Mentors
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {mentors.map(mentor => (
                        <MentorCard key={mentor.id} mentor={mentor} mentorTypeColors={mentorTypeColors} isTop={false} />
                    ))}
                </div>
            </section>
        </div>
    )
}

function MentorCard({ mentor, mentorTypeColors, isTop }: { mentor: Mentor, mentorTypeColors: Record<string, string>, isTop: boolean }) {
    return (
        <div className="glass card-hover" style={{
            padding: '28px',
            ...(isTop ? { borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.05)' } : {})
        }}>
            <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <img src={mentor.photo_url || ''} alt={mentor.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '6px' }}>{mentor.name}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className={`tag ${mentorTypeColors[mentor.mentor_type] || 'tag-purple'}`} style={{ fontSize: '11px' }}>{mentor.mentor_type}</span>
                        <span className="tag tag-pink" style={{ fontSize: '11px' }}>{mentor.domain}</span>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(248,250,252,0.55)', lineHeight: 1.7, marginBottom: '14px' }}>
                {mentor.bio}
            </p>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {mentor.expertise_areas?.slice(0, 3).map(e => (
                    <span key={e} className="tag tag-blue" style={{ fontSize: '11px' }}>{e}</span>
                ))}
            </div>

            {mentor.inspirational_message && (
                <blockquote style={{
                    fontSize: '12px', color: 'rgba(248,250,252,0.6)', fontStyle: 'italic',
                    borderLeft: '2px solid #a855f7', paddingLeft: '12px', marginBottom: '16px', lineHeight: 1.6,
                }}>
                    "{mentor.inspirational_message}"
                </blockquote>
            )}

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(248,250,252,0.4)' }}>Available via:</span>
                {mentor.communication_styles?.map(s => (
                    <span key={s} className="tag tag-green" style={{ fontSize: '11px' }}>{s}</span>
                ))}
            </div>

            <button className="btn-primary" style={{ width: '100%', fontSize: '14px', padding: '10px 16px' }}>
                Connect with {mentor.name.split(' ')[0]}
            </button>
        </div>
    )
}
