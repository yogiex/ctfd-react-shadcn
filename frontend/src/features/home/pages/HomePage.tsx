import { useAuth } from '@/contexts'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Server, Shield, Search, Terminal, BookOpen, Target, Users, Trophy, ArrowRight, Flag, Lock, Globe } from 'lucide-react'

const redTeamTopics = [
  { icon: Server, title: 'Web Exploitation', desc: 'SQL Injection, XSS, CSRF, SSTI, RCE' },
  { icon: Terminal, title: 'Penetration Testing', desc: 'Network scanning, exploitation, post-exploitation' },
  { icon: Lock, title: 'Cryptography', desc: 'Cipher analysis, hash cracking, PKI' },
  { icon: Search, title: 'OSINT & Recon', desc: 'Information gathering, footprinting, threat intel' },
]

const blueTeamTopics = [
  { icon: Shield, title: 'SIEM & Log Analysis', desc: 'Security monitoring, correlation, alerting' },
  { icon: Globe, title: 'Network Defense', desc: 'Firewall, IDS/IPS, network segmentation' },
  { icon: Target, title: 'Incident Response', desc: 'Detection, containment, eradication, recovery' },
  { icon: BookOpen, title: 'Threat Intelligence', desc: 'Threat hunting, IOC analysis, CTI feeds' },
]

export function HomePage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-4">
          <div className="bg-primary/10 rounded-full p-3 w-fit mx-auto">
            <Flag className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground max-w-md">
            Ready to continue your cybersecurity training? Jump back into the challenges.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link to="/challenges">View Challenges</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/scoreboard">Scoreboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="border rounded-xl bg-card overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Column — Logo */}
          <div className="lg:w-2/5 bg-muted/30 flex items-center justify-center p-12 lg:p-16">
            <div className="border border-border dark:border-muted rounded-2xl p-4 bg-white dark:bg-white shadow-sm dark:shadow-black/20">
              <img src="/puti-hero-logo.png" alt="PuTI Security" className="h-32 lg:h-40 w-auto" />
            </div>
          </div>

          {/* Right Column — CTF Information */}
          <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-xl space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="text-primary">$</span>
                <span>cat /etc/ctfd/mission</span>
              </div>

              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
                Learn Cyber Security
                <br />
                <span className="text-muted-foreground font-normal">Through Capture The Flag</span>
              </h1>

              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                Platform pembelajaran keamanan TI yang diselenggarakan oleh Direktorat Pusat Teknologi Informasi (PuTI)
                Telkom University. Tingkatkan kemampuan <strong className="text-foreground">Red Team</strong> dan <strong className="text-foreground">Blue Team</strong> Anda
                melalui tantangan CTF interaktif.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 500+ Participants</span>
                <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /> 50+ Challenges</span>
                <span className="flex items-center gap-1.5"><Flag className="h-4 w-4" /> Weekly CTF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Red Team Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400 px-4 py-1">
            <Server className="h-3.5 w-3.5 mr-1" />
            Red Team
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">Offensive Security</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pelajari teknik serangan siber dari dasar hingga mahir. Kuasai web exploitation, 
            penetration testing, dan berbagai metode yang digunakan oleh ethical hackers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {redTeamTopics.map((topic) => (
            <Card key={topic.title} className="group hover:border-red-200 dark:hover:border-red-900 transition-colors">
              <CardContent className="p-6">
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 w-fit mb-4">
                  <topic.icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground">{topic.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Blue Team Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400 px-4 py-1">
            <Shield className="h-3.5 w-3.5 mr-1" />
            Blue Team
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">Defensive Security</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kuasai teknik pertahanan siber untuk melindungi infrastruktur TI. Dari SIEM hingga 
            incident response, siap menjadi garis depan pertahanan organisasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {blueTeamTopics.map((topic) => (
            <Card key={topic.title} className="group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
              <CardContent className="p-6">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 w-fit mb-4">
                  <topic.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground">{topic.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4">
        <Card className="border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-bold">Ready to Start Your Journey?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                Bergabunglah dengan komunitas cyber security Telkom University. 
                Belajar, berkompetisi, dan tingkatkan kemampuan Anda.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" className="h-12 px-8">
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
        <div className="border-t pt-8">
          <p className="mb-2">
            &copy; 2026 Direktorat Pusat Teknologi Informasi — Telkom University
          </p>
          <p className="text-xs text-muted-foreground/60">
            Platform CTF untuk pembelajaran keamanan siber | Red Team &bull; Blue Team &bull; Capture The Flag
          </p>
        </div>
      </footer>
    </div>
  )
}
