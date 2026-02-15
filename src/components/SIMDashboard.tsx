import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, AlertCircle, Clock, Shield, BarChart2 } from 'lucide-react';

const SIMDashboard = () => {
    const stats = [
        { label: 'Active Inspections', value: '12', icon: FileText, color: 'text-primary' },
        { label: 'Completed Today', value: '5', icon: CheckCircle, color: 'text-emerald-500' },
        { label: 'Critical Findings', value: '2', icon: AlertCircle, color: 'text-rose-500' },
        { label: 'Pending Review', value: '8', icon: Clock, color: 'text-amber-500' },
    ];

    const recentActivities = [
        { vessel: 'Eagle Odyssey', type: 'Hull Inspection', status: 'Completed', date: '2024-02-15' },
        { vessel: 'Ocean Swift', type: 'Safety Audit', status: 'In Progress', date: '2024-02-15' },
        { vessel: 'Sea Guardian', type: 'Engine Check', status: 'Scheduled', date: '2024-02-16' },
    ];

    return (
        <div className="space-y-10 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2 uppercase px-1">SIM Dashboard</h2>
                    <p className="text-muted-foreground text-base font-medium max-w-2xl px-1">
                        Streamlined Inspection & Monitoring portal for real-time fleet oversight.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="maritime-card group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-slate-500/5 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="maritime-card">
                    <CardHeader className="bg-slate-500/5 border-b border-border/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Recent Inspection Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            {recentActivities.map((activity, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-500/5 transition-colors">
                                    <div>
                                        <p className="font-bold text-sm">{activity.vessel}</p>
                                        <p className="text-xs text-muted-foreground">{activity.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-primary">{activity.status}</p>
                                        <p className="text-[10px] text-muted-foreground">{activity.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="maritime-card">
                    <CardHeader className="bg-slate-500/5 border-b border-border/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-primary" />
                            Compliance Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
                        <div className="w-32 h-32 rounded-full border-8 border-primary/20 border-t-primary flex items-center justify-center mb-4">
                            <span className="text-2xl font-black">94%</span>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aggregate Fleet Score</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SIMDashboard;
