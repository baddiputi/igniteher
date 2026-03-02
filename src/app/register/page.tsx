'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        setLoading(true)
        const { error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }
        router.push('/profile/setup')
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '24px', position: 'relative',
        }}>
            <div className="orb orb-purple" style={{ width: '500px', height: '500px', top: '5%', right: '5%', opacity: 0.5 }} />
            <div className="orb orb-pink" style={{ width: '400px', height: '400px', bottom: '5%', left: '5%', opacity: 0.4 }} />

            <div className="glass-strong animate-fade-in-up" style={{
                width: '100%', maxWidth: '460px', padding: '48px 40px',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>✨</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '8px' }}>
                        Join <span className="gradient-text">igniteHER</span>
                    </h1>
                    <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '15px' }}>
                        Start your personalized STEM journey — it's free!
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

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'rgba(248,250,252,0.7)' }}>
                            Email address
                        </label>
                        <input
                            id="reg-email"
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
                            id="reg-password"
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'rgba(248,250,252,0.7)' }}>
                            Confirm password
                        </label>
                        <input
                            id="reg-confirm"
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <p style={{ fontSize: '12px', color: 'rgba(248,250,252,0.4)', marginTop: '-4px' }}>
                        You'll complete your profile in the next step.
                    </p>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '4px', width: '100%', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Creating account...' : 'Create account →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'rgba(248,250,252,0.5)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
