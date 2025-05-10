import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { Print, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card">
        <Link href="/" className="flex items-center justify-center">
          <Print className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-semibold text-primary">{APP_NAME}</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/login"> {/* Placeholder for actual login page */}
              Login
            </Link>
          </Button>
          <Button asChild>
             <Link href="/dashboard"> {/* Placeholder for actual signup or dashboard */}
              Get Started
              <LogIn className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-background to-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                    Streamline Your Printing Press Operations with <span className="text-primary">{APP_NAME}</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Efficiently manage employee attendance, daily tasks, and team productivity.
                    {APP_NAME} offers an intuitive, AI-powered solution tailored for your business.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">
                      Explore Dashboard
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features"> {/* Placeholder for features section */}
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/600/400?grayscale"
                width="600"
                height="400"
                alt="Printing Press Workflow"
                data-ai-hint="printing press"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
              />
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {APP_NAME} is packed with features to help your printing press thrive.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <div className="grid gap-1 p-4 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-primary">Attendance Tracking</h3>
                <p className="text-sm text-muted-foreground">Simple check-in/out, history, and reports.</p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-primary">Daily Task Logging</h3>
                <p className="text-sm text-muted-foreground">Log tasks, track status, and categorize by team.</p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-primary">AI-Powered Summaries</h3>
                <p className="text-sm text-muted-foreground">Get insights on task logs and identify bottlenecks.</p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-primary">Admin Dashboard</h3>
                <p className="text-sm text-muted-foreground">Manage employees, view records, and generate reports.</p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-primary">Team Categorization</h3>
                <p className="text-sm text-muted-foreground">Organize and filter by your company's teams.</p>
              </div>
              <div className="grid gap-1 p-4 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-primary">Mobile Friendly</h3>
                <p className="text-sm text-muted-foreground">Access {APP_NAME} anytime, anywhere, on any device.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
