
"use client";
import AnnouncementCard, { type Announcement } from "@/components/announcements/announcement-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_NAME } from "@/lib/constants";
import { PlusCircle, Search, Filter, Speaker } from "lucide-react"; // Added Speaker
import Link from 'next/link';

// Placeholder data - in a real app, this would come from an API
const announcementsData: Announcement[] = [
  {
    id: "1",
    title: "System Maintenance Scheduled for This Sunday",
    content: `Dear Team,

Please be advised that there will be a scheduled system maintenance for ${APP_NAME} this Sunday from 2:00 AM to 4:00 AM.

During this time, the application may be temporarily unavailable. We are performing these updates to improve performance and security.

We apologize for any inconvenience this may cause and appreciate your understanding.

Best regards,
The IT Department`,
    date: "2024-08-10T10:00:00Z",
    author: "IT Department",
    category: "System Update",
  },
  {
    id: "2",
    title: "New Advanced Printing Machine Arriving Next Week!",
    content: `Great news, everyone!

We are thrilled to announce that our new state-of-the-art Heidelberg Speedmaster CX 104 is scheduled to arrive on Monday, August 19th. This investment will significantly enhance our printing capabilities, allowing for faster turnaround times and superior print quality.

Training sessions on the new equipment will be scheduled for all relevant personnel starting the following week. More details to follow.

Let's prepare to welcome this fantastic addition to our press!

Sincerely,
Management`,
    date: "2024-08-05T14:30:00Z",
    author: "Management",
    category: "Company News",
  },
  {
    id: "3",
    title: "Reminder: Quarterly Performance Review Meetings",
    content: `Hello Team,

This is a friendly reminder that quarterly performance review meetings will be taking place throughout the next two weeks, starting August 12th.

Please check your calendars for your scheduled slot with your respective managers. Ensure you have your self-assessment forms completed beforehand.

These meetings are crucial for your growth and our collective success.

Thank you,
HR Department`,
    date: "2024-08-03T09:00:00Z",
    author: "HR Department",
    category: "Meetings & Reviews",
  },
   {
    id: "4",
    title: "Welcome to Our New Team Members!",
    content: `We are excited to welcome three new members to the ${APP_NAME} family this week!

- Anjali Sharma (Computer Team - Designer)
- Bikram Thapa (Printing Team - Operator Assistant)
- Priya Gurung (Marketing & Accounts - Junior Executive)

Please take a moment to introduce yourselves and help them get settled in. Welcome aboard, Anjali, Bikram, and Priya!

Warmly,
The ${APP_NAME} Team`,
    date: "2024-07-28T11:00:00Z",
    author: "Management",
    category: "Team Update",
  },
];

// Placeholder for admin status - in a real app, this would come from user auth
const isAdmin = true; 
const uniqueCategories = Array.from(new Set(announcementsData.map(a => a.category).filter(Boolean)));


export default function AnnouncementsPage() {
  // TODO: Implement search and filter functionality
  const announcements = announcementsData; // In future, this will be reactive based on search/filter

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Announcements</h1>
          <p className="text-muted-foreground mt-1">Stay informed with the latest news, updates, and internal communications.</p>
        </div>
        {isAdmin && (
          <Button size="lg" className="shrink-0" asChild>
            <Link href="/announcements/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Announcement
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center p-4 border rounded-lg bg-card">
        <div className="relative w-full sm:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search announcements..." className="pl-10 w-full" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category!}>{category}</SelectItem>
                ))}
            </SelectContent>
            </Select>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => console.log('Apply filter clicked')}>
                <Filter className="mr-2 h-4 w-4" /> Apply
            </Button>
        </div>
      </div>

      {announcements.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Speaker className="mx-auto h-16 w-16 text-muted-foreground/50" /> {/* Replaced Megaphone with Speaker */}
          <h2 className="text-2xl font-semibold text-muted-foreground mt-6">No Announcements Found</h2>
          <p className="text-muted-foreground mt-2">It's quiet here... Check back later for new updates or try adjusting your filters.</p>
          {isAdmin && (
             <Button size="lg" className="mt-8" asChild>
                <Link href="/announcements/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> Post First Announcement
                </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
