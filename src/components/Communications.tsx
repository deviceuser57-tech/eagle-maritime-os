import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare, Mail, Send, Plus, Loader2, Trash2, Search,
  Inbox, ArrowUpRight, AlertTriangle, CheckCheck, Clock, Ship,
  Reply, Forward, MailOpen, Filter, X, Star, StarOff
} from 'lucide-react';
import { useCommunications, Communication } from '@/hooks/useCommunications';
import { useVessels } from '@/hooks/useVessels';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

const priorityConfig = {
  high: { label: 'High', icon: AlertTriangle, class: 'bg-destructive/10 text-destructive border-destructive/20' },
  normal: { label: 'Normal', icon: Mail, class: 'bg-primary/10 text-primary border-primary/20' },
  low: { label: 'Low', icon: Clock, class: 'bg-muted/50 text-muted-foreground border-border' },
};

const Communications = () => {
  const { communications, loading, addCommunication, markAsRead, deleteCommunication } = useCommunications();
  const { vessels } = useVessels();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Communication | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterVessel, setFilterVessel] = useState<string>('all');
  const [replyMode, setReplyMode] = useState(false);

  const [formData, setFormData] = useState({
    vessel_id: '',
    subject: '',
    message: '',
    sender_name: '',
    recipient_name: '',
    priority: 'normal',
  });

  const resetForm = () => {
    setFormData({ vessel_id: '', subject: '', message: '', sender_name: '', recipient_name: '', priority: 'normal' });
    setReplyMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCommunication({
      ...formData,
      vessel_id: formData.vessel_id || null,
      status: 'sent',
      read_at: null,
    });
    resetForm();
    setIsComposeOpen(false);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteCommunication(id);
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const handleReply = (msg: Communication) => {
    setReplyMode(true);
    setFormData({
      vessel_id: msg.vessel_id || '',
      subject: `RE: ${msg.subject.replace(/^RE:\s*/i, '')}`,
      message: '',
      sender_name: msg.recipient_name || '',
      recipient_name: msg.sender_name || '',
      priority: msg.priority || 'normal',
    });
    setIsComposeOpen(true);
  };

  const handleForward = (msg: Communication) => {
    setFormData({
      vessel_id: msg.vessel_id || '',
      subject: `FW: ${msg.subject.replace(/^FW:\s*/i, '')}`,
      message: `\n\n--- Forwarded Message ---\nFrom: ${msg.sender_name || 'Unknown'}\nDate: ${format(new Date(msg.sent_at), 'PPpp')}\nSubject: ${msg.subject}\n\n${msg.message}`,
      sender_name: '',
      recipient_name: '',
      priority: msg.priority || 'normal',
    });
    setIsComposeOpen(true);
  };

  const handleSelectMessage = (msg: Communication) => {
    setSelectedMessage(msg);
    if (msg.status !== 'read') markAsRead(msg.id);
  };

  // Derived stats
  const unreadCount = communications.filter(c => c.status !== 'read').length;
  const highPriorityCount = communications.filter(c => c.priority === 'high' && c.status !== 'read').length;
  const sentToday = communications.filter(c => isToday(new Date(c.sent_at))).length;
  const uniqueVesselIds = new Set(communications.filter(c => c.vessel_id).map(c => c.vessel_id));

  // Filtered & searched messages
  const filteredMessages = useMemo(() => {
    return communications.filter(msg => {
      if (activeTab === 'unread' && msg.status === 'read') return false;
      if (activeTab === 'high-priority' && msg.priority !== 'high') return false;

      if (filterPriority !== 'all' && msg.priority !== filterPriority) return false;
      if (filterVessel !== 'all' && msg.vessel_id !== filterVessel) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          msg.subject.toLowerCase().includes(q) ||
          msg.message.toLowerCase().includes(q) ||
          (msg.sender_name || '').toLowerCase().includes(q) ||
          (msg.recipient_name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [communications, activeTab, searchQuery, filterPriority, filterVessel]);

  const formatMessageDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
    if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`;
    return format(d, 'MMM dd, HH:mm');
  };

  const getVesselName = (vesselId: string | null) => {
    if (!vesselId) return null;
    return vessels.find(v => v.id === vesselId)?.name || 'Unknown Vessel';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">Communications</h2>
          <p className="text-sm text-muted-foreground">
            Secure vessel-to-office messaging and team collaboration hub.
          </p>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={(open) => { setIsComposeOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-md">
              <Plus className="h-4 w-4" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {replyMode ? <Reply className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                {replyMode ? 'Reply' : 'Compose Message'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter message subject"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender_name">From</Label>
                  <Input
                    id="sender_name"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    placeholder="Sender name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">To *</Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    placeholder="Recipient name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Related Vessel</Label>
                  <Select value={formData.vessel_id} onValueChange={(v) => setFormData({ ...formData, vessel_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels.map((vessel) => (
                        <SelectItem key={vessel.id} value={vessel.id}>{vessel.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="normal">🔵 Normal</SelectItem>
                      <SelectItem value="high">🔴 High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type your message here..."
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsComposeOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('inbox')}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold mt-1">{communications.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('unread')}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unread</p>
                <p className="text-2xl font-bold mt-1">{unreadCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Inbox className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('high-priority')}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Urgent</p>
                <p className="text-2xl font-bold mt-1">{highPriorityCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-md transition-shadow">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent Today</p>
                <p className="text-2xl font-bold mt-1">{sentToday}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[520px]">
        {/* Message List (Left) */}
        <Card className="lg:col-span-2 border-border/50 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 space-y-3">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-9">
                <TabsTrigger value="inbox" className="text-xs gap-1">
                  <Inbox className="h-3 w-3" /> All
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs gap-1">
                  <Mail className="h-3 w-3" /> Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-1">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="high-priority" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3" /> Urgent
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost" size="sm"
                  className="absolute right-1 top-1 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="h-7 text-xs flex-1">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="normal">🔵 Normal</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterVessel} onValueChange={setFilterVessel}>
                <SelectTrigger className="h-7 text-xs flex-1">
                  <SelectValue placeholder="Vessel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  {vessels.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1">
            <div className="px-2 pb-2">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MailOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No messages found</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {searchQuery ? 'Try a different search term' : 'Compose your first message'}
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  const isUnread = msg.status !== 'read';
                  const vesselName = getVesselName(msg.vessel_id);
                  const prio = priorityConfig[msg.priority as keyof typeof priorityConfig] || priorityConfig.normal;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`
                        group relative p-3 rounded-lg mb-1 cursor-pointer transition-all
                        ${isSelected ? 'bg-primary/8 border border-primary/20' : 'hover:bg-muted/30 border border-transparent'}
                        ${isUnread ? 'bg-accent/30' : ''}
                      `}
                    >
                      {/* Unread indicator */}
                      {isUnread && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}

                      <div className="ml-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-sm truncate max-w-[160px] ${isUnread ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            {msg.sender_name || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {formatMessageDate(msg.sent_at)}
                          </span>
                        </div>

                        <p className={`text-xs truncate mb-1 ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {msg.subject}
                        </p>

                        <p className="text-[11px] text-muted-foreground/70 truncate mb-1.5">
                          {msg.message.slice(0, 80)}
                        </p>

                        <div className="flex items-center gap-1.5">
                          {msg.priority === 'high' && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] bg-destructive/10 text-destructive border-destructive/20">
                              URGENT
                            </Badge>
                          )}
                          {vesselName && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] gap-0.5">
                              <Ship className="h-2.5 w-2.5" />
                              {vesselName}
                            </Badge>
                          )}
                          {msg.status === 'read' && (
                            <CheckCheck className="h-3 w-3 text-primary/50 ml-auto" />
                          )}
                        </div>
                      </div>

                      {/* Delete on hover */}
                      <Button
                        size="sm" variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDelete(msg.id, e)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Message Detail (Right) */}
        <Card className="lg:col-span-3 border-border/50 flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedMessage.priority === 'high' && (
                        <Badge variant="destructive" className="text-[10px]">URGENT</Badge>
                      )}
                      {getVesselName(selectedMessage.vessel_id) && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Ship className="h-3 w-3" />
                          {getVesselName(selectedMessage.vessel_id)}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight mb-2">{selectedMessage.subject}</CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">From: </span>
                        <span className="font-medium">{selectedMessage.sender_name || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">To: </span>
                        <span className="font-medium">{selectedMessage.recipient_name || 'Unknown'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(selectedMessage.sent_at), 'EEEE, MMMM dd, yyyy · HH:mm')}
                      {selectedMessage.read_at && (
                        <span className="ml-2">
                          · Read {formatDistanceToNow(new Date(selectedMessage.read_at), { addSuffix: true })}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Actions */}
              <div className="flex items-center gap-2 px-6 py-2 border-b border-border/30 bg-muted/10">
                <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => handleReply(selectedMessage)}>
                  <Reply className="h-3 w-3" /> Reply
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => handleForward(selectedMessage)}>
                  <Forward className="h-3 w-3" /> Forward
                </Button>
                <div className="flex-1" />
                <Button size="sm" variant="ghost" className="gap-1.5 h-7 text-xs text-destructive" onClick={(e) => handleDelete(selectedMessage.id, e)}>
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>

              {/* Message Body */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {selectedMessage.message}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium text-muted-foreground">Select a message</p>
              <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs">
                Choose a message from the list to read its contents, reply, or forward it.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Communications;
