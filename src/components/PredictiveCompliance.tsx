import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Target, TrendingUp, AlertTriangle, Search, Activity } from 'lucide-react';

const PredictiveCompliance = () => {
    const analysisItems = [
        { title: 'Certification Risk', score: 'Low', trend: 'Improving', icon: Target, color: 'text-emerald-500' },
        { title: 'Regulatory Impact', score: 'Moderate', trend: 'Stable', icon: Activity, color: 'text-amber-500' },
        { title: 'Maintenance Forecasting', score: 'High', trend: 'Critical', icon: Zap, color: 'text-rose-500' },
    ];

    return (
        <div className="space-y-10 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2 uppercase px-1">Predictive Compliance</h2>
                    <p className="text-muted-foreground text-base font-medium max-w-2xl px-1">
                        AI-driven forecasting and risk assessment for future regulatory landscapes.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {analysisItems.map((item, idx) => (
                    <Card key={idx} className="maritime-card group">
                        <CardContent className="p-8">
                            <div className={`p-4 rounded-2xl bg-slate-500/5 ${item.color} mb-6 w-fit`}>
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">{item.title}</h3>
                            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confidence</p>
                                    <p className="text-sm font-black">{item.score}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Projection</p>
                                    <p className="text-sm font-black text-primary">{item.trend}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="maritime-card overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent p-8">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Compliance Trend Analysis</CardTitle>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Next 24 Months Forecasting</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    <div className="h-64 w-full bg-slate-500/5 rounded-3xl border border-dashed border-border/50 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
                        <div className="text-center z-10">
                            <Search className="h-10 w-10 text-primary/20 mx-auto mb-4" />
                            <p className="text-sm font-bold text-muted-foreground italic">Neural Engine Processing 2026 Regulatory Scripts...</p>
                        </div>
                        {/* Visual simulation of a trend line */}
                        <div className="absolute inset-0 flex items-end px-12 pb-12 gap-1 justify-between pointer-events-none opacity-20">
                            {[40, 60, 45, 70, 55, 85, 65, 95, 80, 100].map((h, i) => (
                                <div key={i} className="w-4 bg-primary rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PredictiveCompliance;
