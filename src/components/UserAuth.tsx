import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Key, Lock, Loader2 } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';

const UserAuth = () => {
  const { data: profiles, isLoading } = useProfiles();

  const users = profiles || [];
  const activeUsers = users.filter((u: any) => u.role && u.role !== '');
  const uniqueRoles = [...new Set(users.map((u: any) => u.role).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground mb-2">User Authentication</h2>
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
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="maritime-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With Assigned Roles</p>
                <p className="text-2xl font-bold">{activeUsers.length}</p>
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
                <p className="text-2xl font-bold">{uniqueRoles.length}</p>
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
                <p className="text-2xl font-bold">{users.length > 0 ? 'Active' : 'N/A'}</p>
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
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Users will appear here once they register.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{user.full_name || user.email || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{user.role || 'No role assigned'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={user.role ? 'default' : 'secondary'}>
                      {user.role ? 'Active' : 'Pending'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : '—'}
                    </p>
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAuth;
