'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RoleModel } from '@/lib/types'

const CATEGORIES = ['All', 'Computer Science', 'Physics', 'Engineering', 'Biotechnology', 'Space Science', 'Entrepreneurship']

export default function RoleModelsPage() {
    const [roleModels, setRoleModels] = useState<RoleModel[]>([])
    const [category, setCategory] = useState('All')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        supabase.from('role_models').select('*').order('is_featured', { ascending: false })
            .then(({ data }) => { setRoleModels((data || []) as RoleModel[]); setLoading(false) })
    }, [])

    const filtered = category === 'All' ? roleModels : roleModels.filter(r => r.category === category)

    if (loading) return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>⭐</div>
                <p style={{ color: 'rgba(248,250,252,0.5)' }}>Loading role models...</p>
            </div>
        </div>
    )

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative' }}>
            <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '-200px', left: '-100px', opacity: 0.3 }} />
            <div className="orb orb-pink" style={{ width: '350px', height: '350px', bottom: '100px', right: '-100px', opacity: 0.25 }} />

            <div style={{ marginBottom: '40px' }}>
                <span className="tag tag-amber" style={{ marginBottom: '12px', display: 'inline-flex' }}>⭐ Inspiration Hub</span>
                <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, fontFamily: 'Outfit', marginBottom: '8px' }}>
                    Women who <span className="gradient-text">changed STEM</span>
                </h1>
                <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '16px', maxWidth: '500px' }}>
                    Discover brilliant women who broke barriers and shaped the future. Let their stories ignite yours.
                </p>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={category === cat ? 'btn-primary' : 'btn-ghost'}
                        style={{ fontSize: '13px', padding: '8px 18px' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Featured */}
            {category === 'All' && roleModels.filter(r => r.is_featured).length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '20px' }}>
                        🏆 Role Model of the Week
                    </h2>
                    {roleModels.filter(r => r.is_featured).slice(0, 1).map(rm => (
                        <div key={rm.id} className="glass" style={{
                            padding: '36px',
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.08))',
                            borderColor: 'rgba(168,85,247,0.3)',
                        }}>
                            <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <img src={rm.photo_url || ''} alt={rm.name}
                                    style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(168,85,247,0.2)', flexShrink: 0, border: '3px solid rgba(168,85,247,0.4)' }} />
                                <div style={{ flex: 1, minWidth: '240px' }}>
                                    <span className="tag tag-amber" style={{ marginBottom: '12px', display: 'inline-flex', fontSize: '11px' }}>⭐ Featured</span>
                                    <h3 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '4px' }}>{rm.name}</h3>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        <span className="tag tag-purple">{rm.category}</span>
                                        {rm.domain && <span className="tag tag-pink">{rm.domain}</span>}
                                    </div>
                                    {rm.quote && (
                                        <blockquote style={{
                                            fontSize: '15px', color: 'rgba(248,250,252,0.7)', fontStyle: 'italic',
                                            borderLeft: '3px solid #a855f7', paddingLeft: '16px', marginBottom: '16px', lineHeight: 1.7,
                                        }}>
                                            "{rm.quote}"
                                        </blockquote>
                                    )}
                                    {rm.biography && (
                                        <p style={{ fontSize: '14px', color: 'rgba(248,250,252,0.55)', lineHeight: 1.7, marginBottom: '12px' }}>
                                            {rm.biography}
                                        </p>
                                    )}
                                    {rm.achievements && (
                                        <div style={{ fontSize: '13px', color: '#c084fc' }}>🏅 {rm.achievements}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {filtered.filter(r => category !== 'All' || !r.is_featured).map(rm => (
                    <div key={rm.id} className="glass card-hover" style={{ padding: '28px' }}>
                        <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
                            <img src={rm.photo_url || ''} alt={rm.name}
                                style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '6px' }}>{rm.name}</h3>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    <span className="tag tag-purple" style={{ fontSize: '11px' }}>{rm.category}</span>
                                    {rm.domain && <span className="tag tag-pink" style={{ fontSize: '11px' }}>{rm.domain}</span>}
                                </div>
                            </div>
                        </div>

                        {rm.quote && (
                            <blockquote style={{
                                fontSize: '13px', color: 'rgba(248,250,252,0.65)', fontStyle: 'italic',
                                borderLeft: '2px solid #a855f7', paddingLeft: '12px', marginBottom: '12px', lineHeight: 1.6,
                            }}>
                                "{rm.quote.slice(0, 140)}{rm.quote.length > 140 ? '...' : ''}"
                            </blockquote>
                        )}

                        {rm.biography && (
                            <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.45)', lineHeight: 1.6, marginBottom: '10px' }}>
                                {rm.biography.slice(0, 120)}...
                            </p>
                        )}

                        {rm.achievements && (
                            <div style={{ fontSize: '12px', color: '#c084fc' }}>
                                🏅 {rm.achievements.slice(0, 80)}{rm.achievements.length > 80 ? '...' : ''}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(248,250,252,0.4)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <p>No role models found for this category yet.</p>
                </div>
            )}
        </div>
    )
}
