import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Key, Lock } from 'lucide-react';

const UserAuth = () => {
  const users = [
    { id: 1, name: 'John Smith', role: 'Admin', status: 'Active', lastLogin: '2024-01-15 09:30' },
    { id: 2, name: 'Sarah Johnson', role: 'Fleet Manager', status: 'Active', lastLogin: '2024-01-15 08:15' },
    { id: 3, name: 'Mike Chen', role: 'Auditor', status: 'Active', lastLogin: '2024-01-14 16:45' },
    { id: 4, name: 'Emma Wilson', role: 'Crew Manager', status: 'Inactive', lastLogin: '2024-01-10 11:20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">🔒 User Authentication</h2>
        <p className="text-muted-foreground">
          Manage user access, roles, and security settings for your fleet management system.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Roles</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <Key className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Level</p>
                <p className="text-2xl font-bold">High</p>
              </div>
              <Lock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="maritime-card">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{user.lastLogin}</p>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAuth;
