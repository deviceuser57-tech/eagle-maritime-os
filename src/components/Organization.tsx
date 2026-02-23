import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Users, Building, Settings, ShieldCheck, Trash2, Mail, MoreVertical, Shield, UserMinus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const Organization = () => {
    const {
        organization,
        members,
        invitations,
        loading,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        inviteMember,
        revokeInvitation,
        removeMember,
        updateMemberRole
    } = useOrganization();

    const [newOrgName, setNewOrgName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editOrgName, setEditOrgName] = useState(organization?.name || '');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Determine administrative status
    const isAdmin = organization?.userRole === 'Super Admin' || organization?.userRole === 'Admin';

    useEffect(() => {
        if (organization?.name) {
            setEditOrgName(organization.name);
        }
    }, [organization]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setIsInviting(true);
        try {
            await inviteMember(inviteEmail);
            setInviteEmail('');
            setIsInviteOpen(false);
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsInviting(false);
        }
    };

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;

        setIsCreating(true);
        try {
            // Create slug from name (simple version)
            const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            await createOrganization(newOrgName, slug);
            setNewOrgName('');
        } catch (error) {
            console.error('Failed to create organization:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateOrg = async () => {
        if (!editOrgName.trim()) return;
        setIsUpdating(true);
        try {
            await updateOrganization({ name: editOrgName });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteOrg = async () => {
        try {
            await deleteOrganization();
        } catch (error) {
            console.error('Failed to delete organization:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="container max-w-md py-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Organization</CardTitle>
                        <CardDescription>
                            To get started, create an organization for your team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateOrg} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="orgName">Organization Name</Label>
                                <Input
                                    id="orgName"
                                    placeholder="Acme Maritime"
                                    value={newOrgName}
                                    onChange={(e) => setNewOrgName(e.target.value)}
                                    disabled={isCreating}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isCreating || !newOrgName.trim()}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Organization
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Organization</h2>
                    <p className="text-muted-foreground">
                        Manage your organization settings and team members.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="maritime-card overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Organization Name</CardTitle>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                            <Building className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-black tracking-tight">{organization.name}</div>
                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 mt-1">
                            Node: {organization.slug}
                        </p>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
                </Card>

                <Card className="maritime-card overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Subscription Plan</CardTitle>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-black tracking-tight text-blue-600">Enterprise Core</div>
                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 mt-1">
                            High Availability Protocol
                        </p>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
                </Card>

                <Card className="maritime-card overflow-hidden group sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Fleet Personnel</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-black tracking-tight">{members.length}</div>
                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 mt-1">
                            Authorized Crew & Admins
                        </p>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
                </Card>
            </div>

            <Tabs defaultValue="members" className="w-full">
                <TabsList>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                Invite your team members to collaborate.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex justify-end">
                                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                                    <DialogTrigger asChild>
                                        <Button disabled={!isAdmin}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {isAdmin ? 'Invite Member' : 'Admin Access Required'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Invite Team Member</DialogTitle>
                                            <DialogDescription>
                                                Send an invitation to a new member to join your organization.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleInvite} className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="colleague@company.com"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={isInviting}>
                                                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Send Invitation
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="hidden md:table-cell">Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>
                                                                {member.email ? member.email.substring(0, 2).toUpperCase() : 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">User {member.user_id.substring(0, 8)}...</span>
                                                            <span className="text-xs text-muted-foreground">{member.email || 'No email visible'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {member.role || 'Member'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {new Date(member.joined_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" disabled={!isAdmin}>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => updateMemberRole(member.user_id, 'Admin')}>
                                                                <Shield className="mr-2 h-4 w-4" />
                                                                Promote to Admin
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => removeMember(member.user_id)}
                                                            >
                                                                <UserMinus className="mr-2 h-4 w-4" />
                                                                Remove from Fleet
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {members.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No members found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {invitations && invitations.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-4">Pending Fleet Invitations</h3>
                                    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="hidden md:table-cell">Sent At</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {invitations.map((invite) => (
                                                    <TableRow key={invite.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                                {invite.email}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">
                                                                {invite.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {new Date(invite.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => revokeInvitation(invite.id)}
                                                                className="text-destructive hover:text-destructive/90"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Settings</CardTitle>
                            <CardDescription>
                                Manage your organization preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="org-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Organization Display Name</Label>
                                <Input
                                    id="org-name"
                                    value={editOrgName}
                                    onChange={(e) => setEditOrgName(e.target.value)}
                                    placeholder="Enter new name..."
                                    disabled={!isAdmin}
                                />
                            </div>
                            <Button
                                onClick={handleUpdateOrg}
                                disabled={isUpdating || editOrgName === organization.name || !isAdmin}
                                className="w-full sm:w-auto"
                            >
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isAdmin ? 'Save Protocol Changes' : 'Admin Privileges Required'}
                            </Button>

                            <div className="pt-8 border-t border-border/50 mt-8 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-destructive uppercase tracking-tighter">Terminal Deletion Protocol</h3>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Deleting this organization will permanently purge all vessels, certifications, and crew data. This action is irreversible.
                                        {!isAdmin && <span className="block mt-1 text-rose-500 font-bold">LOCKED: Requires Admin Clearance.</span>}
                                    </p>
                                </div>
                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="w-full sm:w-auto font-black italic" disabled={!isAdmin}>
                                            {isAdmin ? 'Initiate Organization Purge' : 'Purge Interface Locked'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Confirm Extreme Action</DialogTitle>
                                            <DialogDescription>
                                                Are you absolutely sure you want to delete <strong>{organization.name}</strong>? All data will be lost forever.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                            <Button variant="destructive" onClick={handleDeleteOrg}>Purge Everything</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Organization;
