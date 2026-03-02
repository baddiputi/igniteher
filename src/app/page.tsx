import Link from 'next/link'

const features = [
  { icon: '🎯', title: 'Career Discovery', desc: 'Personalized career paths in AI, Biotech, Cybersecurity and more — matched to your interests.' },
  { icon: '👩‍🏫', title: 'Expert Mentors', desc: 'Connect with women scientists, engineers, and entrepreneurs who\'ve walked the path.' },
  { icon: '⭐', title: 'Role Models', desc: 'Get inspired by trailblazing women who transformed STEM fields globally.' },
  { icon: '📚', title: 'Curated Resources', desc: 'Free courses, projects, hackathons, and competitions handpicked for you.' },
  { icon: '🗺️', title: 'Learning Roadmaps', desc: 'Step-by-step structured paths from beginner to expert in any STEM domain.' },
  { icon: '🤝', title: 'Mentor Matching', desc: 'Smart matching algorithm pairs you with mentors who align with your goals.' },
]

const domains = [
  { label: 'Artificial Intelligence', icon: '🤖', color: '#7c3aed' },
  { label: 'Biotechnology', icon: '🧬', color: '#db2777' },
  { label: 'Cybersecurity', icon: '🛡️', color: '#0891b2' },
  { label: 'Aerospace', icon: '🚀', color: '#7c3aed' },
  { label: 'Data Science', icon: '📊', color: '#059669' },
  { label: 'Robotics', icon: '⚙️', color: '#d97706' },
  { label: 'Web Development', icon: '💻', color: '#be185d' },
  { label: 'App Development', icon: '📱', color: '#6d28d9' },
]

export default function HomePage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px 60px',
        position: 'relative',
      }}>
        {/* Background orbs */}
        <div className="orb orb-purple" style={{ width: '600px', height: '600px', top: '10%', left: '10%', opacity: 0.6 }} />
        <div className="orb orb-pink" style={{ width: '400px', height: '400px', bottom: '10%', right: '10%', opacity: 0.5 }} />
        <div className="dot-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div className="tag tag-purple animate-fade-in-up" style={{ marginBottom: '24px', display: 'inline-flex' }}>
            ✨ Empowering the next generation of women in STEM
          </div>

          <h1 className="animate-fade-in-up delay-100" style={{
            fontSize: 'clamp(48px, 8vw, 84px)',
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: '24px',
            letterSpacing: '-2px',
          }}>
            Your STEM journey{' '}
            <span className="gradient-text">starts here</span>
          </h1>

          <p className="animate-fade-in-up delay-200" style={{
            fontSize: '18px',
            lineHeight: 1.7,
            color: 'rgba(248,250,252,0.6)',
            maxWidth: '560px',
            margin: '0 auto 40px',
          }}>
            Get personalized career guidance, connect with inspiring mentors,
            discover role models, and explore the world of STEM — built
            specifically for <strong style={{ color: '#f472b6' }}>girls like you</strong>.
          </p>

          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ fontSize: '16px', padding: '14px 36px' }}>
              🚀 Start your journey — free
            </Link>
            <Link href="/login" className="btn-secondary" style={{ fontSize: '16px', padding: '14px 36px' }}>
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up delay-400" style={{
            display: 'flex', gap: '40px', justifyContent: 'center',
            marginTop: '60px', flexWrap: 'wrap',
          }}>
            {[
              { value: '8+', label: 'STEM Domains' },
              { value: '10+', label: 'Expert Mentors' },
              { value: '12+', label: 'Role Models' },
              { value: '20+', label: 'Free Resources' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontFamily: 'Outfit', fontWeight: 800 }}
                  className="gradient-text">{stat.value}</div>
                <div style={{ fontSize: '13px', color: 'rgba(248,250,252,0.5)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="glow-divider" />

      {/* Explore domains */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="tag tag-pink" style={{ marginBottom: '16px', display: 'inline-flex' }}>🌍 Explore STEM fields</span>
          <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, marginBottom: '12px' }}>
            Find your <span className="gradient-text">calling</span>
          </h2>
          <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '16px' }}>
            From artificial intelligence to aerospace — every domain is waiting for you.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {domains.map((d) => (
            <Link href="/register" key={d.label} style={{ textDecoration: 'none' }}>
              <div className="glass card-hover" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{d.icon}</div>
                <div style={{
                  fontSize: '14px', fontWeight: 600, color: '#f8fafc',
                  fontFamily: 'Outfit',
                }}>{d.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <hr className="glow-divider" />

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="tag tag-purple" style={{ marginBottom: '16px', display: 'inline-flex' }}>💡 Everything you need</span>
          <h2 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800 }}>
            Built for <span className="gradient-text">ambitious</span> girls
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {features.map((f) => (
            <div key={f.title} className="glass card-hover" style={{ padding: '28px' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', fontFamily: 'Outfit' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(248,250,252,0.55)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div className="orb orb-purple" style={{ width: '400px', height: '400px', top: '0', left: '50%', transform: 'translateX(-50%)', opacity: 0.4 }} />
        <div className="glass-strong" style={{
          maxWidth: '600px', margin: '0 auto', padding: '60px 40px',
          position: 'relative',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔥</div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit' }}>
            Ready to <span className="gradient-text">ignite</span> your future?
          </h2>
          <p style={{ color: 'rgba(248,250,252,0.55)', marginBottom: '32px', lineHeight: 1.6 }}>
            Join thousands of girls discovering their STEM potential.
            It's free, personalized, and designed just for you.
          </p>
          <Link href="/register" className="btn-primary" style={{ fontSize: '16px', padding: '14px 40px' }}>
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'rgba(248,250,252,0.3)',
        fontSize: '14px',
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            <span className="gradient-text">ignite</span>
            <span style={{ color: 'rgba(248,250,252,0.5)' }}>HER</span>
          </span>
        </div>
        <div>© 2026 igniteHER. Empowering women in STEM.</div>
      </footer>
    </div>
  )
}
