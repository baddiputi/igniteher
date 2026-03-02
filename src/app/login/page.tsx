'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }
        router.push('/dashboard')
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '24px', position: 'relative',
        }}>
            <div className="orb orb-purple" style={{ width: '500px', height: '500px', top: '10%', left: '5%', opacity: 0.5 }} />
            <div className="orb orb-pink" style={{ width: '350px', height: '350px', bottom: '10%', right: '5%', opacity: 0.4 }} />

            <div className="glass-strong animate-fade-in-up" style={{
                width: '100%', maxWidth: '440px', padding: '48px 40px',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔥</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '8px' }}>
                        Welcome back
                    </h1>
                    <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '15px' }}>
                        Continue your STEM journey
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                        color: '#fca5a5', fontSize: '14px',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'rgba(248,250,252,0.7)' }}>
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'rgba(248,250,252,0.7)' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '8px', width: '100%', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Signing in...' : 'Sign in →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'rgba(248,250,252,0.5)' }}>
                    Don't have an account?{' '}
                    <Link href="/register" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600 }}>
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    )
}
