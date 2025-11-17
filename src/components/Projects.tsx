import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, TrendingUp, Users, Clock } from 'lucide-react';

const Projects = () => {
  const projects = [
    { name: 'Annual ISM Audit 2024', vessels: 8, progress: 65, status: 'Active', deadline: '2024-03-31' },
    { name: 'ISPS Code Renewal', vessels: 12, progress: 85, status: 'Active', deadline: '2024-02-28' },
    { name: 'Environmental Compliance Q1', vessels: 22, progress: 45, status: 'Active', deadline: '2024-04-15' },
    { name: 'Safety Equipment Inspection', vessels: 15, progress: 100, status: 'Completed', deadline: '2024-01-15' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">📈 Projects</h2>
        <p className="text-muted-foreground">
          Manage audit projects, track progress, and coordinate across your fleet.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Folder className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">73%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">34</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-orange-500">2</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{project.name}</p>
                  <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{project.vessels} vessels</span>
                  <span>Due: {project.deadline}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Manage Team</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
