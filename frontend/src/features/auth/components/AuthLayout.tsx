import { type ReactNode } from 'react'
import { Server, Shield, Search } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/90 flex-col text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(0,0,0,0.08),transparent_50%)]" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Row 1: PuTI Logo */}
          <div className="flex items-center justify-center h-2/5">
            <div className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-4">
              <img src="/puti-logo.png" alt="PuTI Security" className="h-40 w-auto" />
            </div>
          </div>

          {/* Row 2: CTF Information */}
          <div className="flex-1 flex flex-col justify-center px-16 pb-14">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Capture The Flag
              <br />
              <span className="text-primary-foreground/75 font-normal">Telkom University</span>
            </h1>

            <p className="text-primary-foreground/65 text-base leading-relaxed max-w-lg mb-8">
              Platform kompetisi keamanan TI yang diselenggarakan oleh Direktorat Pusat Teknologi Informasi (PuTI) 
              Telkom University. Uji kemampuan Anda dalam berbagai tantangan keamanan siber.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-white/15 rounded-lg p-2.5 mt-0.5 shrink-0">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-medium">Web Exploitation</p>
                  <p className="text-sm text-primary-foreground/55">SQL Injection, XSS, CSRF, SSTI</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/15 rounded-lg p-2.5 mt-0.5 shrink-0">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-medium">Blue Team</p>
                  <p className="text-sm text-primary-foreground/55">SIEM, Log Analysis, Incident Response</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-white/15 rounded-lg p-2.5 mt-0.5 shrink-0">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-medium">OSINT & Recon</p>
                  <p className="text-sm text-primary-foreground/55">Information Gathering, Threat Intelligence</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/15 pt-5 mt-8">
              <p className="text-sm text-primary-foreground/45">
                &copy; 2026 Direktorat Pusat Teknologi Informasi<br />
                Telkom University
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="w-full max-w-md px-8 py-8">
          <div className="flex justify-center mb-10 lg:hidden">
            <img src="/puti-logo.png" alt="PuTI Security" className="h-12 w-auto" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
