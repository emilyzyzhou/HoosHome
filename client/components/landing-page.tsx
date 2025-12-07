import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Users, DollarSign, Calendar, CheckSquare } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 py-20 px-4 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-orange-200 dark:bg-blue-800/30 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200 dark:bg-orange-800/20 rounded-full opacity-20 blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-10 text-center max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
              Welcome to HoosHome
            </h1>
            <p className="text-xl md:text-2xl text-blue-900 dark:text-orange-200 mb-8 max-w-2xl mx-auto">
              The ultimate roommate management platform. Organize bills, chores, and events all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg text-lg px-8 h-12"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md font-semibold transition-colors border border-blue-900 dark:border-orange-400 text-blue-900 dark:text-orange-200 hover:bg-orange-50 dark:hover:bg-blue-900/20 text-lg px-8 h-12"
              >
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white dark:bg-slate-900">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-orange-100 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-orange-200">Roommate Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Easily invite roommates with a simple join code and keep everyone connected.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-orange-100 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-orange-200">Bill Splitting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track shared expenses and split bills fairly with automatic calculations.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-orange-100 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <CheckSquare className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-orange-200">Chore Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Assign and track household chores with recurring schedules and reminders.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-orange-100 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-orange-200">Event Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Organize house events and track RSVPs from your roommates.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-orange-100 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-orange-200">Lease Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Keep track of lease details, landlord info, and important dates.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-orange-100 dark:border-blue-800 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-orange-200">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Store important contacts for all roommates in case of emergencies.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-blue-900 dark:text-orange-200 mb-8">
              Join thousands of roommates already using HoosHome to make shared living easier.
            </p>
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-md font-semibold transition-colors bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white shadow-lg text-lg px-8 h-12"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}