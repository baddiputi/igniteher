'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
    const [user, setUser] = useState<{ email?: string } | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/explore', label: 'Explore STEM' },
        { href: '/mentors', label: 'Mentors' },
        { href: '/role-models', label: 'Role Models' },
        { href: '/resources', label: 'Resources' },
    ]

    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
            {/* Logo */}
            <Link href={user ? '/dashboard' : '/'} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #7e22ce, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px',
                    }}>🔥</div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '20px' }}>
                        <span className="gradient-text">ignite</span>
                        <span style={{ color: '#f8fafc' }}>HER</span>
                    </span>
                </div>
            </Link>

            {/* Desktop nav links */}
            {user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    className="desktop-nav">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: isActive(link.href) ? '#c084fc' : 'rgba(248,250,252,0.6)',
                            background: isActive(link.href) ? 'rgba(168,85,247,0.12)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'Inter',
                        }}
                            onMouseEnter={e => {
                                if (!isActive(link.href)) {
                                    (e.target as HTMLElement).style.color = '#f8fafc'
                                        ; (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive(link.href)) {
                                    (e.target as HTMLElement).style.color = 'rgba(248,250,252,0.6)'
                                        ; (e.target as HTMLElement).style.background = 'transparent'
                                }
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user ? (
                    <>
                        <Link href="/profile" style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7e22ce, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 700, color: 'white',
                            textDecoration: 'none', fontFamily: 'Outfit',
                        }}>
                            {user.email?.[0]?.toUpperCase() || '?'}
                        </Link>
                        <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '13px', padding: '6px 14px' }}>
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="btn-ghost" style={{ fontSize: '14px' }}>Sign in</Link>
                        <Link href="/register" className="btn-primary" style={{ fontSize: '14px', padding: '8px 20px' }}>
                            Get started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}
