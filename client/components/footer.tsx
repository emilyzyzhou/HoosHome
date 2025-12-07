import Link from "next/link"
import { Home, Github, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-orange-100 dark:border-blue-800 bg-gradient-to-b from-orange-50 to-amber-50 dark:from-slate-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg shadow-md">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
                HoosHome?
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Organize your shared living space with roommates. Manage chores, bills, and events all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900 dark:text-orange-200">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Join a Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Social */}
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900 dark:text-orange-200">Connect</h3>
            <div className="flex gap-4">
              <a href="mailto:contact@hooshome.com" className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-orange-200 dark:border-blue-800 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HoosHome. Built for roommates, by roommates.</p>
        </div>
      </div>
    </footer>
  )
}