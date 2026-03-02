export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CareerDomain, LearningResource } from '@/lib/types'

const STEM_SECTIONS = [
    {
        icon: '🌐',
        title: 'Emerging STEM Fields',
        color: 'rgba(124,58,237,0.15)',
        items: [
            { name: 'Quantum Computing', desc: 'The next frontier of computation — solving impossible problems.' },
            { name: 'Synthetic Biology', desc: 'Programming living organisms like software to create medicines & materials.' },
            { name: 'Brain-Computer Interfaces', desc: 'Connecting the human brain directly to digital systems.' },
            { name: 'Climate Technology', desc: 'Engineering solutions to reverse climate change.' },
        ]
    },
    {
        icon: '🏭',
        title: 'Industry vs Research',
        color: 'rgba(236,72,153,0.12)',
        items: [
            { name: 'Industry Careers', desc: 'Fast-paced, product-focused roles at startups and tech giants.' },
            { name: 'Academic Research', desc: 'Pushing knowledge frontiers in universities and research institutes.' },
            { name: 'Government & Policy', desc: 'Shaping science policy at ISRO, DRDO, DST, and global orgs.' },
            { name: 'Consulting', desc: 'Applying STEM expertise to solve business problems.' },
        ]
    },
    {
        icon: '💼',
        title: 'Entrepreneurship in STEM',
        color: 'rgba(16,185,129,0.1)',
        items: [
            { name: 'DeepTech Startups', desc: 'Companies built on fundamental scientific innovation.' },
            { name: 'Social Impact Tech', desc: 'Technology solving education, health, and poverty challenges.' },
            { name: 'Funding & Grants', desc: 'DST WISE, Google for Startups, ACM-W scholarships.' },
            { name: 'Incubators for Women', desc: 'T-Hub, WEE Foundation, Villgro, and more.' },
        ]
    },
    {
        icon: '🏆',
        title: 'Scholarships & Competitions',
        color: 'rgba(245,158,11,0.1)',
        items: [
            { name: 'Google Women Techmakers', desc: 'Scholarships + community for women in CS.' },
            { name: 'ISRO Student Programs', desc: 'Space research internships and competitions.' },
            { name: 'Smart India Hackathon', desc: 'India\'s largest student hackathon across domains.' },
            { name: 'NASA Space Apps', desc: 'Global hackathon solving real NASA challenges.' },
        ]
    },
]

export default async function ExplorePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: domains } = await supabase.from('career_domains').select('*')

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative' }}>
            <div className="orb orb-purple" style={{ width: '500px', height: '500px', top: '-200px', right: '-100px', opacity: 0.3 }} />
            <div className="orb orb-pink" style={{ width: '400px', height: '400px', bottom: '0', left: '-100px', opacity: 0.25 }} />

            <div style={{ marginBottom: '48px' }}>
                <span className="tag tag-blue" style={{ marginBottom: '12px', display: 'inline-flex' }}>🌍 STEM Universe</span>
                <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, fontFamily: 'Outfit', marginBottom: '8px' }}>
                    Explore STEM <span className="gradient-text">domains</span>
                </h1>
                <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '16px', maxWidth: '520px' }}>
                    Discover careers, roadmaps, and opportunities across every STEM field. Click any domain to explore its path.
                </p>
            </div>

            {/* Career Domain Cards */}
            <section style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '20px' }}>🗺️ Career Domains & Roadmaps</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {(domains || []).map((domain: CareerDomain) => (
                        <Link key={domain.id}
                            href={`/explore/${encodeURIComponent(domain.name.toLowerCase().replace(/\s+/g, '-'))}`}
                            style={{ textDecoration: 'none' }}>
                            <div className="glass card-hover" style={{ padding: '28px', height: '100%' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '8px' }}>{domain.name}</h3>
                                <p style={{ fontSize: '13px', color: 'rgba(248,250,252,0.5)', lineHeight: 1.6, marginBottom: '16px' }}>
                                    {domain.description?.slice(0, 100)}...
                                </p>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                    {domain.required_skills?.slice(0, 3).map((s: string) => (
                                        <span key={s} className="tag tag-purple" style={{ fontSize: '11px' }}>{s}</span>
                                    ))}
                                </div>
                                <div style={{ fontSize: '13px', color: '#c084fc', fontWeight: 500 }}>
                                    Explore roadmap →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <hr className="glow-divider" style={{ marginBottom: '60px' }} />

            {/* STEM Awareness Sections */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '28px' }}>🌟 STEM Awareness</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {STEM_SECTIONS.map(section => (
                        <div key={section.title} className="glass" style={{ padding: '28px', background: section.color }}>
                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{section.icon}</div>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '16px' }}>{section.title}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {section.items.map(item => (
                                    <div key={item.name}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#f8fafc' }}>{item.name}</div>
                                        <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.5)', lineHeight: 1.5 }}>{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
