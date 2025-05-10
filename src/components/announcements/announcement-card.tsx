import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { CalendarDays, UserCircle } from 'lucide-react';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string or formatted date
  author?: string;
  category?: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard: FC<AnnouncementCardProps> = ({ announcement }) => {
  return (
    <Card className="shadow-md w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
            <div>
                <CardTitle className="text-xl mb-1 text-primary">{announcement.title}</CardTitle>
                <div className="flex items-center text-xs text-muted-foreground space-x-3">
                    <div className="flex items-center">
                        <CalendarDays className="mr-1 h-3.5 w-3.5" />
                        <span>{new Date(announcement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {announcement.author && (
                        <div className="flex items-center">
                            <UserCircle className="mr-1 h-3.5 w-3.5" />
                            <span>{announcement.author}</span>
                        </div>
                    )}
                </div>
            </div>
            {announcement.category && (
                <Badge variant="outline" className="text-xs shrink-0">{announcement.category}</Badge>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{announcement.content}</p>
      </CardContent>
      {/* Optional Footer for actions or links */}
      {/* <CardFooter>
        <Button variant="link" size="sm">Read More</Button>
      </CardFooter> */}
    </Card>
  );
};

export default AnnouncementCard;
