'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LearningResource } from '@/lib/types'

const DOMAINS = ['All', 'Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Web Development', 'Biotechnology', 'Robotics', 'Aerospace', 'App Development']
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const TYPES = ['All', 'course', 'playlist', 'project', 'competition', 'hackathon']

const TYPE_ICONS: Record<string, string> = {
    course: '🎓', playlist: '▶️', project: '🛠️', competition: '🏆', hackathon: '⚡', video: '📹',
}
const TYPE_COLORS: Record<string, string> = {
    course: 'tag-purple', playlist: 'tag-blue', project: 'tag-green', competition: 'tag-amber', hackathon: 'tag-pink',
}

export default function ResourcesPage() {
    const [resources, setResources] = useState<LearningResource[]>([])
    const [domain, setDomain] = useState('All')
    const [level, setLevel] = useState('All')
    const [type, setType] = useState('All')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        supabase.from('learning_resources').select('*').order('created_at')
            .then(({ data }) => { setResources((data || []) as LearningResource[]); setLoading(false) })
    }, [])

    const filtered = resources.filter(r =>
        (domain === 'All' || r.domain === domain) &&
        (level === 'All' || r.skill_level === level) &&
        (type === 'All' || r.type === type)
    )

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative' }}>
            <div className="orb orb-violet" style={{ width: '400px', height: '400px', top: '-200px', right: '-50px', opacity: 0.3 }} />

            <div style={{ marginBottom: '40px' }}>
                <span className="tag tag-green" style={{ marginBottom: '12px', display: 'inline-flex' }}>📚 Learning Hub</span>
                <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, fontFamily: 'Outfit', marginBottom: '8px' }}>
                    Curated <span className="gradient-text">resources</span> for you
                </h1>
                <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '16px', maxWidth: '500px' }}>
                    Free courses, playlists, projects, competitions, and hackathons — handpicked for aspiring women in STEM.
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                <div>
                    <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Domain</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {DOMAINS.map(d => (
                            <button key={d} onClick={() => setDomain(d)}
                                className={domain === d ? 'btn-primary' : 'btn-ghost'}
                                style={{ fontSize: '12px', padding: '6px 14px' }}>{d}</button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div>
                        <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Level</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {LEVELS.map(l => (
                                <button key={l} onClick={() => setLevel(l)}
                                    className={level === l ? 'btn-primary' : 'btn-ghost'}
                                    style={{ fontSize: '12px', padding: '6px 14px' }}>{l}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {TYPES.map(t => (
                                <button key={t} onClick={() => setType(t)}
                                    className={type === t ? 'btn-primary' : 'btn-ghost'}
                                    style={{ fontSize: '12px', padding: '6px 14px' }}>
                                    {TYPE_ICONS[t] || ''} {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Count */}
            <p style={{ fontSize: '14px', color: 'rgba(248,250,252,0.4)', marginBottom: '20px' }}>
                Showing <strong style={{ color: '#c084fc' }}>{filtered.length}</strong> resources
            </p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
                    <p style={{ color: 'rgba(248,250,252,0.5)' }}>Loading resources...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {filtered.map(r => (
                        <a key={r.id} href={r.url || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <div className="glass card-hover" style={{ padding: '24px', height: '100%' }}>
                                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <div style={{ fontSize: '32px', flexShrink: 0 }}>{TYPE_ICONS[r.type || ''] || '📖'}</div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px', lineHeight: 1.4, color: '#f8fafc' }}>{r.title}</h3>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {r.type && <span className={`tag ${TYPE_COLORS[r.type] || 'tag-purple'}`} style={{ fontSize: '11px' }}>{r.type}</span>}
                                            {r.skill_level && <span className="tag tag-blue" style={{ fontSize: '11px' }}>{r.skill_level}</span>}
                                            {r.domain && <span className="tag tag-green" style={{ fontSize: '11px' }}>{r.domain}</span>}
                                        </div>
                                    </div>
                                </div>
                                {r.description && (
                                    <p style={{ fontSize: '13px', color: 'rgba(248,250,252,0.5)', lineHeight: 1.6, marginBottom: '14px' }}>
                                        {r.description}
                                    </p>
                                )}
                                <div style={{ fontSize: '13px', color: '#c084fc', fontWeight: 500 }}>
                                    Open resource →
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(248,250,252,0.4)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <p>No resources match your filters. Try adjusting the selection.</p>
                </div>
            )}
        </div>
    )
}
