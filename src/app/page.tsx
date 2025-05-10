import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { Printer, LogIn } from "lucide-react"; // Corrected: Printer instead of Print
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Printer className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl text-foreground">{APP_NAME}</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-background to-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Manage Your Print Business Effortlessly with {APP_NAME}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Our all-in-one platform helps you streamline employee management, task tracking, attendance, and more. Focus on printing, we'll handle the rest.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href="/dashboard">
                      Get Started
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href="/login">
                      Login to Your Account
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/picsum1/600/400"
                width="600"
                height="400"
                alt="Hero"
                data-ai-hint="printing press business"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-2xl"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">Everything You Need in One Place</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {APP_NAME} offers a comprehensive suite of tools designed to simplify the daily operations of your printing press.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-primary">Employee Management</h3>
                <p className="text-sm text-muted-foreground">Keep track of employee profiles, roles, and teams effortlessly.</p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-primary">Task Tracking</h3>
                <p className="text-sm text-muted-foreground">Assign, monitor, and manage tasks with clear status updates.</p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-primary">Attendance System</h3>
                <p className="text-sm text-muted-foreground">Log daily check-ins and check-outs, and generate attendance reports.</p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-primary">Announcements</h3>
                <p className="text-sm text-muted-foreground">Keep your team informed with company-wide announcements.</p>
              </div>
               <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-primary">Financial Tools</h3>
                <p className="text-sm text-muted-foreground">Manage salary payments and advances for your employees efficiently.</p>
              </div>
               <div className="grid gap-2 p-6 rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold text-primary">Reporting</h3>
                <p className="text-sm text-muted-foreground">Generate insightful reports on attendance, tasks, and team productivity.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
