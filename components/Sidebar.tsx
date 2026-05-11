'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/',
    label: 'Home',
    sub: 'ハブ',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M2 7.5L8 2L14 7.5V14H10.5V10H5.5V14H2V7.5Z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    sub: '13軸',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="8" cy="8" r="5.5" />
        <circle cx="8" cy="8" r="2" />
        <line x1="8" y1="2.5" x2="8" y2="6" />
        <line x1="8" y1="10" x2="8" y2="13.5" />
        <line x1="2.5" y1="8" x2="6" y2="8" />
        <line x1="10" y1="8" x2="13.5" y2="8" />
      </svg>
    ),
  },
  {
    href: '/mirror',
    label: 'Mirror',
    sub: '気づき',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M8 1.5C4.5 1.5 2.5 4 2.5 8C2.5 11 4.5 13.5 8 14.5C11.5 13.5 13.5 11 13.5 8C13.5 4 11.5 1.5 8 1.5Z" />
        <line x1="8" y1="5" x2="8" y2="9" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/journal',
    label: 'Journal',
    sub: 'ログ',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <rect x="3" y="2" width="10" height="12" rx="1.5" />
        <line x1="5.5" y1="6" x2="10.5" y2="6" />
        <line x1="5.5" y1="8.5" x2="10.5" y2="8.5" />
        <line x1="5.5" y1="11" x2="8.5" y2="11" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="sidebar fsi"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 20,
        animationDelay: '0s',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '26px 16px 20px', overflow: 'hidden' }}>
        <div
          className="sidebar-label"
          style={{
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            marginBottom: 8,
            whiteSpace: 'nowrap',
          }}
        >
          Solnova Lab
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 24, height: 24,
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 0 12px rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <rect x="1" y="1" width="7" height="7"
                stroke="rgba(255,255,255,0.55)" strokeWidth="1"
                fill="none"
                transform="rotate(45 4.5 4.5)"
              />
            </svg>
          </div>
          <span
            className="sidebar-label"
            style={{
              fontSize: 15,
              fontWeight: 300,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}
          >
            Twin
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 12px 10px' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '4px 0' }}>
        {NAV.map(({ href, label, sub, icon }, i) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="snav"
              style={{
                color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.32)',
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                boxShadow: active
                  ? 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.04)'
                  : 'none',
                animationDelay: `${0.08 + i * 0.06}s`,
              }}
            >
              {/* Active indicator bar */}
              <div style={{
                position: 'absolute',
                left: -8, top: '20%', height: '60%', width: 2.5,
                borderRadius: 2,
                background: active ? '#fff' : 'transparent',
                boxShadow: active
                  ? '0 0 8px rgba(255,255,255,0.9), 0 0 18px rgba(255,255,255,0.5)'
                  : 'none',
                transition: 'all 0.25s ease',
              }} />

              <span style={{
                color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.22)',
                flexShrink: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', width: 18,
              }}>
                {icon}
              </span>

              <div className="sidebar-label" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 13, fontWeight: active ? 500 : 400, letterSpacing: '0.02em', lineHeight: 1.2 }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 9,
                  color: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)',
                  letterSpacing: '0.08em', marginTop: 2,
                }}>
                  {sub}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Version */}
      <div
        className="sidebar-label"
        style={{ padding: '14px 18px 22px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          SUST v0.3
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.08)', marginTop: 3 }}>
          Aggregator · 11 apps
        </div>
      </div>
    </aside>
  )
}
