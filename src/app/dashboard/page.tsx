export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCareerRecommendations } from '@/lib/career-engine'
import { getTopMentors } from '@/lib/mentor-matching'
import { Student, Mentor, CareerDomain, RoleModel } from '@/lib/types'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [
        { data: studentData },
        { data: mentors },
        { data: domains },
        { data: roleModels },
    ] = await Promise.all([
        supabase.from('students').select('*').eq('user_id', user.id).single(),
        supabase.from('mentors').select('*'),
        supabase.from('career_domains').select('*'),
        supabase.from('role_models').select('*').eq('is_featured', true).limit(1),
    ])

    const student = studentData as Student | null
    if (!student) redirect('/profile/setup')

    const recommendations = getCareerRecommendations(student, (domains || []) as CareerDomain[], 3)
    const topMentors = getTopMentors(student, (mentors || []) as Mentor[], 3)
    const featuredRoleModel = roleModels?.[0] as RoleModel | null

    const { data: resources } = await supabase
        .from('learning_resources')
        .select('*')
        .in('domain', student.interests?.slice(0, 3) || [])
        .limit(3)

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    const tagColorMap: Record<string, string> = {
        'course': 'tag-purple', 'video': 'tag-blue', 'project': 'tag-green',
        'competition': 'tag-amber', 'hackathon': 'tag-pink', 'playlist': 'tag-blue',
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Greeting */}
            <div style={{ marginBottom: '40px' }}>
                <p style={{ fontSize: '15px', color: 'rgba(248,250,252,0.5)', marginBottom: '8px' }}>
                    {greeting} 👋
                </p>
                <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, fontFamily: 'Outfit', lineHeight: 1.1 }}>
                    Welcome back, <span className="gradient-text">{student.full_name.split(' ')[0]}</span>!
                </h1>
                {student.interests?.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                        {student.interests.slice(0, 4).map(i => (
                            <span key={i} className="tag tag-purple">{i}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '48px' }}>
                {[
                    { icon: '🎯', label: 'Career Matches', value: `${recommendations.length}` },
                    { icon: '👩‍🏫', label: 'Top Mentors', value: `${topMentors.length}` },
                    { icon: '🛠️', label: 'Skills', value: `${student.skills?.length || 0}` },
                    { icon: '📚', label: 'Resources', value: `${resources?.length || 0}` },
                ].map(stat => (
                    <div key={stat.label} className="glass" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}
                            className="gradient-text">{stat.value}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.45)', marginTop: '4px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Career Recommendations */}
            {recommendations.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit' }}>🎯 Career Matches for You</h2>
                        <Link href="/explore" style={{ fontSize: '13px', color: '#c084fc', textDecoration: 'none' }}>View all →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {recommendations.map(({ domain, score, matchReasons, careerTitles }) => (
                            <Link key={domain.id} href={`/explore/${encodeURIComponent(domain.name.toLowerCase().replace(/\s+/g, '-'))}`} style={{ textDecoration: 'none' }}>
                                <div className="glass card-hover" style={{ padding: '24px', height: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Outfit', color: '#f8fafc' }}>{domain.name}</h3>
                                        <span className="tag tag-green" style={{ flexShrink: 0, marginLeft: '8px' }}>{score}pts</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'rgba(248,250,252,0.5)', lineHeight: 1.6, marginBottom: '16px' }}>
                                        {domain.description?.slice(0, 100)}...
                                    </p>
                                    {matchReasons[0] && (
                                        <div style={{ fontSize: '12px', color: '#c084fc', marginBottom: '12px' }}>
                                            ✓ {matchReasons[0]}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {careerTitles.slice(0, 2).map((ct) => (
                                            <span key={ct.title} className="tag tag-purple" style={{ fontSize: '11px' }}>{ct.title}</span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Top Mentor Matches */}
            {topMentors.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit' }}>👩‍🏫 Your Mentor Matches</h2>
                        <Link href="/mentors" style={{ fontSize: '13px', color: '#c084fc', textDecoration: 'none' }}>View all mentors →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {topMentors.map(({ mentor, matchReasons }) => (
                            <div key={mentor.id} className="glass card-hover" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'flex-start' }}>
                                    <img src={mentor.photo_url || ''} alt={mentor.name}
                                        style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(168,85,247,0.2)', flexShrink: 0 }} />
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '4px' }}>{mentor.name}</h3>
                                        <span className="tag tag-purple" style={{ fontSize: '11px' }}>{mentor.mentor_type}</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '13px', color: 'rgba(248,250,252,0.5)', lineHeight: 1.6, marginBottom: '12px' }}>
                                    {mentor.bio?.slice(0, 90)}...
                                </p>
                                {matchReasons[0] && (
                                    <div style={{ fontSize: '12px', color: '#c084fc', marginBottom: '12px' }}>✓ {matchReasons[0]}</div>
                                )}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                    {mentor.expertise_areas?.slice(0, 2).map(e => (
                                        <span key={e} className="tag tag-blue" style={{ fontSize: '11px' }}>{e}</span>
                                    ))}
                                </div>
                                <button className="btn-secondary" style={{ width: '100%', fontSize: '13px', padding: '10px 16px' }}>
                                    Connect
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Two column: Role Model + Resources */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px', marginBottom: '48px' }}>
                {/* Role Model Spotlight */}
                {featuredRoleModel && (
                    <section>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '20px' }}>⭐ Role Model Spotlight</h2>
                        <Link href="/role-models" style={{ textDecoration: 'none' }}>
                            <div className="glass card-hover" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.08))' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <img src={featuredRoleModel.photo_url || ''} alt={featuredRoleModel.name}
                                        style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168,85,247,0.2)', flexShrink: 0 }} />
                                    <div>
                                        <div className="tag tag-amber" style={{ fontSize: '11px', marginBottom: '8px', display: 'inline-flex' }}>🏆 Role Model of the Week</div>
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Outfit' }}>{featuredRoleModel.name}</h3>
                                        <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.5)', marginTop: '4px' }}>{featuredRoleModel.domain}</div>
                                    </div>
                                </div>
                                {featuredRoleModel.quote && (
                                    <blockquote style={{
                                        fontSize: '14px', color: 'rgba(248,250,252,0.7)', fontStyle: 'italic',
                                        borderLeft: '3px solid #a855f7', paddingLeft: '14px', lineHeight: 1.6,
                                    }}>
                                        "{featuredRoleModel.quote.slice(0, 120)}..."
                                    </blockquote>
                                )}
                            </div>
                        </Link>
                    </section>
                )}

                {/* Learning Resources */}
                {resources && resources.length > 0 && (
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit' }}>📚 Resources for You</h2>
                            <Link href="/resources" style={{ fontSize: '13px', color: '#c084fc', textDecoration: 'none' }}>All →</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {resources.map(r => (
                                <a key={r.id} href={r.url || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <div className="glass card-hover" style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '24px', flexShrink: 0 }}>
                                            {r.type === 'course' ? '🎓' : r.type === 'playlist' ? '▶️' : r.type === 'project' ? '🛠️' : r.type === 'hackathon' ? '⚡' : r.type === 'competition' ? '🏆' : '📖'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#f8fafc' }}>{r.title}</div>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                <span className={`tag ${tagColorMap[r.type || ''] || 'tag-purple'}`} style={{ fontSize: '11px' }}>{r.type}</span>
                                                <span style={{ fontSize: '11px', color: 'rgba(248,250,252,0.4)' }}>{r.skill_level}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Explore STEM */}
            <div className="glass" style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08))' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌍</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '8px' }}>
                    Explore the STEM Universe
                </h2>
                <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '15px', marginBottom: '20px' }}>
                    Discover emerging fields, roadmaps, scholarships, and more
                </p>
                <Link href="/explore" className="btn-primary" style={{ fontSize: '14px', padding: '12px 28px' }}>
                    Explore STEM →
                </Link>
            </div>
        </div>
    )
}
