export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { CareerDomain } from '@/lib/types'

interface Props {
    params: Promise<{ domain: string }>
}

export default async function DomainPage({ params }: Props) {
    const { domain: slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const domainName = decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    const { data: domains } = await supabase.from('career_domains').select('*')
    const domain = (domains || []).find((d: CareerDomain) =>
        d.name.toLowerCase() === domainName.toLowerCase()
    ) as CareerDomain | undefined

    if (!domain) notFound()

    const { data: resources } = await supabase.from('learning_resources').select('*').eq('domain', domain.name).limit(5)

    const roadmapSteps: Record<string, string[]> = {
        'Artificial Intelligence': ['Learn Python Basics', 'Study Linear Algebra & Statistics', 'ML Fundamentals with scikit-learn', 'Deep Learning with TensorFlow/PyTorch', 'Specialise in NLP / Computer Vision', 'Build Projects & Kaggle Competitions', 'Apply for Research/Internships'],
        'Data Science': ['Python & SQL Basics', 'Statistics & Probability', 'Data Wrangling with Pandas', 'Visualisation with Matplotlib/Seaborn', 'Machine Learning Models', 'Big Data & Cloud Tools', 'Domain Specialisation (Finance, Health…)'],
        'Cybersecurity': ['Networking Basics (TCP/IP, DNS)', 'Linux & Command Line', 'Python Scripting', 'Web Security (OWASP Top 10)', 'Ethical Hacking & CTF Practice', 'Certifications: CEH, CompTIA Security+', 'Specialise in Penetration Testing / SOC'],
        'Web Development': ['HTML & CSS Mastery', 'JavaScript Fundamentals', 'Responsive Design & Git', 'React / Next.js Framework', 'Node.js & REST APIs', 'Databases & Authentication', 'Deploy Projects & Build Portfolio'],
        'Biotechnology': ['Biology & Chemistry Foundations', 'Molecular Biology Techniques', 'Lab Skills (PCR, ELISA)', 'Bioinformatics Basics', 'Research Paper Reading', 'Internship in a Lab', 'Specialise: CRISPR / Drug Discovery / Diagnostics'],
        'Robotics': ['Electronics & Arduino Basics', 'Programming in C++ / Python', 'Mechanics & CAD Design', 'Robot Operating System (ROS)', 'Sensors & Computer Vision', 'Build Robot Projects', 'Compete in Robotics Challenges'],
        'Aerospace': ['Physics & Mathematics Mastery', 'CAD Tools (CATIA, SolidWorks)', 'Aerodynamics & Fluid Mechanics', 'Programming (MATLAB, Python)', 'Research ISRO / NASA Projects', 'Internship at DRDO / HAL / ISRO', 'Specialise in Propulsion / Avionics / Satellites'],
        'App Development': ['Learn Flutter or React Native', 'UI/UX Design Principles', 'State Management (Bloc, Redux)', 'Firebase / Supabase Integration', 'Publish First App to Play Store', 'Monetisation & Analytics', 'Build a Portfolio of 3+ Apps'],
    }

    const steps = roadmapSteps[domain.name] || ['Learn the foundations', 'Build projects', 'Contribute to open source', 'Internship / research', 'Specialise in a niche', 'Continuous learning']

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', position: 'relative' }}>
            <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '-200px', right: '-100px', opacity: 0.3 }} />

            <Link href="/explore" style={{ color: '#c084fc', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
                ← Back to Explore
            </Link>

            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, fontFamily: 'Outfit', marginBottom: '12px' }}>
                    <span className="gradient-text">{domain.name}</span>
                </h1>
                <p style={{ color: 'rgba(248,250,252,0.6)', fontSize: '16px', lineHeight: 1.7, maxWidth: '600px' }}>
                    {domain.description}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                {/* Career Titles */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '16px' }}>💼 Career Paths</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {domain.career_titles?.map((ct) => (
                            <div key={ct.title} style={{ padding: '12px', background: 'rgba(168,85,247,0.08)', borderRadius: '10px', border: '1px solid rgba(168,85,247,0.15)' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{ct.title}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(248,250,252,0.5)' }}>{ct.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Required Skills */}
                <div className="glass" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '16px' }}>🛠️ Key Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {domain.required_skills?.map(s => (
                            <span key={s} className="tag tag-purple">{s}</span>
                        ))}
                    </div>
                    {domain.roadmap_link && (
                        <a href={domain.roadmap_link} target="_blank" rel="noopener noreferrer"
                            className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex', fontSize: '13px', padding: '10px 20px' }}>
                            📍 Full Roadmap →
                        </a>
                    )}
                </div>
            </div>

            {/* Learning Roadmap */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '24px' }}>🗺️ Learning Roadmap</h2>
                <div style={{ position: 'relative' }}>
                    {steps.map((step, i) => (
                        <div key={step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: i < steps.length - 1 ? '0' : '0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #7e22ce, #ec4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0,
                                }}>{i + 1}</div>
                                {i < steps.length - 1 && (
                                    <div style={{ width: '2px', height: '40px', background: 'linear-gradient(180deg, rgba(168,85,247,0.5), rgba(168,85,247,0.1))', margin: '4px 0' }} />
                                )}
                            </div>
                            <div className="glass" style={{ flex: 1, padding: '14px 20px', marginBottom: '8px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#f8fafc' }}>{step}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Resources */}
            {resources && resources.length > 0 && (
                <section>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Outfit', marginBottom: '20px' }}>📚 Beginner Resources</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                        {resources.map(r => (
                            <a key={r.id} href={r.url || '#'} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <div className="glass card-hover" style={{ padding: '18px 20px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#f8fafc' }}>{r.title}</div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <span className="tag tag-purple" style={{ fontSize: '11px' }}>{r.type}</span>
                                        <span className="tag tag-blue" style={{ fontSize: '11px' }}>{r.skill_level}</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
