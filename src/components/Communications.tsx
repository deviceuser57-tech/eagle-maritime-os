import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Send, Users } from 'lucide-react';

const Communications = () => {
  const messages = [
    { from: 'MV Atlantic Pride', subject: 'Audit Schedule Confirmation', date: '2024-01-15 14:30', status: 'Unread', priority: 'High' },
    { from: 'Fleet Manager', subject: 'Q1 Compliance Review', date: '2024-01-15 10:15', status: 'Read', priority: 'Normal' },
    { from: 'MV Pacific Star', subject: 'Equipment Status Update', date: '2024-01-14 16:45', status: 'Read', priority: 'Normal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">💬 Communications</h2>
        <p className="text-muted-foreground">
          Secure messaging system for vessel-to-office communication and team collaboration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">287</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-orange-500">12</p>
              </div>
              <Mail className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent Today</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Send className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Threads</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Button size="sm">Compose New</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium ${message.status === 'Unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {message.from}
                    </p>
                    {message.priority === 'High' && (
                      <Badge variant="destructive" className="text-xs">High Priority</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{message.subject}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{message.date}</p>
                    {message.status === 'Unread' && (
                      <Badge variant="default" className="mt-1">New</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Communications;
