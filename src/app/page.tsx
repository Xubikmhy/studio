import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { Printer, LogIn, Zap, Users, CalendarDays, FileText, Megaphone, Landmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="grid gap-2 p-6 rounded-xl border bg-card shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
    <Icon className="h-8 w-8 text-primary mb-2" />
    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);


export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-8 h-20 flex items-center border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center justify-center gap-2 group">
          <Printer className="h-7 w-7 text-primary transition-transform group-hover:rotate-[-5deg]" />
          <span className="font-semibold text-2xl text-foreground">{APP_NAME}</span>
        </Link>
        <nav className="ml-auto flex gap-3 sm:gap-4 items-center">
          <Button variant="ghost" asChild className="text-foreground/80 hover:text-foreground">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-20 md:py-28 lg:py-36 xl:py-48 bg-gradient-to-b from-background via-muted/50 to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_650px] items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 py-1">
                    Manage Your Print Business Effortlessly
                  </h1>
                  <p className="max-w-[650px] text-muted-foreground md:text-xl text-lg">
                    {APP_NAME} is your all-in-one platform to streamline employee management, task tracking, attendance, and finances. Focus on printing, we&apos;ll handle the rest.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow duration-300 group px-8 py-6 text-lg">
                    <Link href="/dashboard">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="shadow-md hover:shadow-lg transition-shadow duration-300 px-8 py-6 text-lg">
                    <Link href="/login">
                      Login to Your Account
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/modernpress/650/650" // Updated placeholder
                width="650"
                height="650"
                alt="Modern Printing Press Workflow"
                data-ai-hint="modern office technology" // More specific hint
                className="mx-auto aspect-square overflow-hidden rounded-2xl object-cover sm:w-full lg:order-last shadow-2xl"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-12 md:mb-16">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                Key Features
              </div>
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-foreground">Everything You Need in One Place</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {APP_NAME} offers a comprehensive suite of tools designed to simplify the daily operations of your printing press, boosting efficiency and productivity.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={Users} title="Employee Management" description="Keep track of employee profiles, roles, teams, and salary information effortlessly." />
              <FeatureCard icon={Zap} title="Task Tracking" description="Assign, monitor, and manage tasks with clear status updates and priorities." />
              <FeatureCard icon={CalendarDays} title="Attendance System" description="Log daily check-ins and check-outs, and generate detailed attendance reports." />
              <FeatureCard icon={Megaphone} title="Announcements" description="Keep your team informed with company-wide announcements and updates." />
              <FeatureCard icon={Landmark} title="Financial Tools" description="Manage salary payments and advances for your employees efficiently and securely." />
              <FeatureCard icon={FileText} title="Insightful Reporting" description="Generate reports on attendance, task completion, and team productivity." />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-background">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-sm hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Privacy Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
