import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2, Globe, Shield, Activity, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useIntegrations, ERPConfig, WebhookEndpoint } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';

const IntegrationSettings = () => {
    const { erpConfigs, webhooks, logs, loading, addERPConfig, deleteERPConfig, addWebhook, deleteWebhook, refetch } = useIntegrations();
    const [activeTab, setActiveTab] = useState('erp');
    const [isAddingERP, setIsAddingERP] = useState(false);
    const [isAddingWebhook, setIsAddingWebhook] = useState(false);

    const [erpForm, setErpForm] = useState({ name: '', type: 'SAP' as any, url: '' });
    const [webhookForm, setWebhookForm] = useState({ url: '', events: ['vessel.updated'] });

    const handleAddERP = async (e: React.FormEvent) => {
        e.preventDefault();
        await addERPConfig({
            name: erpForm.name,
            erp_type: erpForm.type,
            base_url: erpForm.url
        });
        setIsAddingERP(false);
        setErpForm({ name: '', type: 'SAP', url: '' });
    };

    const handleAddWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        await addWebhook({
            url: webhookForm.url,
            events: webhookForm.events
        });
        setIsAddingWebhook(false);
        setWebhookForm({ url: '', events: ['vessel.updated'] });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase italic">Connectivity Node</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary uppercase tracking-widest px-2">
                            External Systems Bridge
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest px-2 bg-blue-500/10 text-blue-500 border-blue-500/20">
                            API v1.0 Gateway
                        </Badge>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={refetch}
                    disabled={loading}
                    className="rounded-xl border-primary/20 hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest"
                >
                    <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Sync Core Connectivity
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/30 border border-border p-1 rounded-2xl mb-8 overflow-x-auto whitespace-nowrap">
                    <TabsTrigger value="erp" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Link2 className="h-3 w-3 mr-2" /> ERP Connections
                    </TabsTrigger>
                    <TabsTrigger value="webhooks" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Globe className="h-3 w-3 mr-2" /> Webhooks
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Activity className="h-3 w-3 mr-2" /> Security & Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="erp" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {erpConfigs.map((config) => (
                            <Card key={config.id} className="bg-card border-border group hover:border-primary/30 transition-all rounded-3xl overflow-hidden relative">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter">
                                            {config.erp_type} Node
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground/30 hover:text-rose-500"
                                            onClick={() => deleteERPConfig(config.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="text-xl font-black text-foreground mt-4">{config.name}</CardTitle>
                                    <CardDescription className="text-muted-foreground font-bold truncate text-[10px] uppercase tracking-widest">{config.base_url || 'No URL configured'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className={`h-2 w-2 rounded-full ${config.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{config.status}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Card
                            className="bg-muted/10 border-dashed border-2 border-border hover:border-primary/30 cursor-pointer transition-all rounded-3xl group h-[200px] flex flex-col items-center justify-center"
                            onClick={() => setIsAddingERP(true)}
                        >
                            <div className="p-4 rounded-full bg-muted/10 group-hover:bg-primary/20 transition-all">
                                <Plus className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary" />
                            </div>
                            <p className="mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary">Establish ERP Link</p>
                        </Card>
                    </div>

                    {isAddingERP && (
                        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                            <Card className="max-w-md w-full bg-card border-border p-8 rounded-3xl">
                                <h3 className="text-2xl font-black text-foreground uppercase italic mb-6">Connect ERP Node</h3>
                                <form onSubmit={handleAddERP} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Configuration Name</Label>
                                        <Input className="bg-muted/10 border-border" value={erpForm.name} onChange={e => setErpForm({ ...erpForm, name: e.target.value })} placeholder="e.g. Frankfurt Mainframe" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground">ERP Architecture</Label>
                                        <Select value={erpForm.type} onValueChange={v => setErpForm({ ...erpForm, type: v })}>
                                            <SelectTrigger className="bg-muted/10 border-border"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SAP">SAP S/4HANA</SelectItem>
                                                <SelectItem value="ORACLE">Oracle Cloud ERP</SelectItem>
                                                <SelectItem value="DYNAMICS">MS Dynamics 365</SelectItem>
                                                <SelectItem value="CUSTOM">Custom Enterprise API</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground">Target Gateway URL</Label>
                                        <Input className="bg-muted/10 border-border" value={erpForm.url} onChange={e => setErpForm({ ...erpForm, url: e.target.value })} placeholder="https://api.internal.corp/gateway" required />
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button variant="ghost" className="flex-1 text-foreground border border-border" onClick={() => setIsAddingERP(false)}>Cancel</Button>
                                        <Button className="flex-1 btn-maritime" type="submit">Establish Link</Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="webhooks" className="space-y-6">
                    <Card className="bg-card border-border rounded-3xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-foreground uppercase tracking-tighter italic">Fleet Event Dispatchers</CardTitle>
                                <CardDescription className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Real-time data streaming to authorized endpoints</CardDescription>
                            </div>
                            <Button onClick={() => setIsAddingWebhook(true)} className="btn-maritime text-[10px] font-black">
                                <Plus className="h-3 w-3 mr-2" /> Deploy Endpoint
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {webhooks.length === 0 ? (
                                    <p className="text-center py-12 text-muted-foreground/30 font-black uppercase tracking-widest text-xs">No active dispatchers operational.</p>
                                ) : (
                                    webhooks.map(w => (
                                        <div key={w.id} className="p-5 border border-border rounded-2xl bg-muted/5 flex items-center justify-between group">
                                            <div>
                                                <p className="font-black text-foreground text-sm tracking-tight mb-1">{w.url}</p>
                                                <div className="flex gap-2">
                                                    {w.events.map(ev => (
                                                        <Badge key={ev} variant="outline" className="text-[8px] font-black uppercase border-border text-muted-foreground">{ev}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className={`${w.is_active ? 'bg-emerald-500 text-emerald-950' : 'bg-muted-foreground/30'} text-[8px] font-black`}>
                                                    {w.is_active ? 'BROADCASTING' : 'SUSPENDED'}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground/20 hover:text-rose-500" onClick={() => deleteWebhook(w.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-6">
                    <Card className="bg-card border-border rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-black text-foreground uppercase tracking-tighter italic">Transmission Archive</CardTitle>
                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Audit trail for external data synchronization</p>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground text-left">
                                            <th className="pb-4 pt-2">Timestamp</th>
                                            <th className="pb-4 pt-2">Protocol/Event</th>
                                            <th className="pb-4 pt-2">Status</th>
                                            <th className="pb-4 pt-2">Latency</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold">
                                        {logs.map(log => (
                                            <tr key={log.id} className="border-b border-border hover:bg-muted/5 transition-all">
                                                <td className="py-4 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                                                <td className="py-4 text-foreground italic">{log.event_type}</td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        {log.status_code && log.status_code < 300 ? (
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                        ) : (
                                                            <AlertCircle className="h-3 w-3 text-rose-500" />
                                                        )}
                                                        <span className={log.status_code && log.status_code < 300 ? "text-emerald-500" : "text-rose-500"}>
                                                            {log.status_code || 'ERR'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-muted-foreground">{log.duration_ms}ms</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default IntegrationSettings;
