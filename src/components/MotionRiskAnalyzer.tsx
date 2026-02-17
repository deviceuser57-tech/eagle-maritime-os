import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, Waves, Compass, Navigation, ShieldAlert, Thermometer, Ship, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVessels } from '@/hooks/useVessels';

const MotionRiskAnalyzer = () => {
    const { vessels } = useVessels();
    const [selectedVesselId, setSelectedVesselId] = React.useState<string | null>(null);
    const [isCalculating, setIsCalculating] = React.useState(false);
    const [riskMetrics, setRiskMetrics] = React.useState<any>(null);

    const activeVessel = vessels.find(v => v.id === selectedVesselId);

    const sensors = [
        { label: 'Pitch Rate', value: riskMetrics?.pitch || '0.0°', status: 'Optimal', icon: Compass },
        { label: 'Roll Angle', value: riskMetrics?.roll || '0.0°', status: 'Optimal', icon: Waves },
        { label: 'Heave Depth', value: riskMetrics?.heave || '0.0m', status: 'Optimal', icon: Navigation },
        { label: 'Vertical Acc.', value: riskMetrics?.accel || '0.00g', status: 'Optimal', icon: Activity },
    ];

    const handleCalculate = () => {
        if (!selectedVesselId) return;
        setIsCalculating(true);
        setTimeout(() => {
            setRiskMetrics({
                pitch: (Math.random() * 3 + 1).toFixed(1) + '°',
                roll: (Math.random() * 8 + 2).toFixed(1) + '°',
                heave: (Math.random() * 2 + 0.5).toFixed(1) + 'm',
                accel: (Math.random() * 0.3 + 0.1).toFixed(2) + 'g',
                cargoShift: Math.floor(Math.random() * 20 + 5),
                greenWater: Math.floor(Math.random() * 40 + 10),
                parametric: Math.floor(Math.random() * 30 + 60),
                stability: (0.9 + Math.random() * 0.09).toFixed(3)
            });
            setIsCalculating(false);
        }, 1500);
    };

    function Activity({ className }: { className?: string }) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        );
    }

    return (
        <div className="space-y-10 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase px-1">Motion Risk Analyzer</h2>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest px-1 opacity-70">
                        Hydrodynamic Stability Node
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedVesselId || ''} onValueChange={setSelectedVesselId}>
                        <SelectTrigger className="w-[280px] h-12 rounded-2xl border-primary/20 bg-background/50 backdrop-blur-xl font-bold uppercase text-[10px] tracking-widest px-6">
                            <SelectValue placeholder="SELECT TARGET VESSEL" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border bg-background/95 backdrop-blur-xl">
                            {vessels.map((v) => (
                                <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase tracking-widest py-3">
                                    {v.name} (IMO: {v.imo_number || 'N/A'})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleCalculate}
                        disabled={!selectedVesselId || isCalculating}
                        className="btn-maritime h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                    >
                        {isCalculating ? 'Computing Dynamics...' : 'Analyze Motion Risk'}
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {sensors.map((sensor, idx) => (
                    <Card key={idx} className="maritime-card group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                                    <sensor.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${sensor.status === 'Alert' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                                    }`}>
                                    {sensor.status}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{sensor.label}</p>
                            <p className="text-2xl font-black">{sensor.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <Card className="maritime-card md:col-span-2">
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-primary" />
                            Hydrodynamic Force Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="h-80 w-full dark:bg-slate-900 bg-muted rounded-3xl relative overflow-hidden flex items-center justify-center">
                            {/* Simulation of a vessel top view */}
                            <div className="w-16 h-64 dark:bg-slate-800 bg-muted-foreground/10 rounded-full border border-border relative shadow-2xl">
                                <div className="absolute top-0 inset-x-0 h-4 bg-primary/20 blur-xl" />
                                <div className="absolute bottom-4 inset-x-2 h-1 bg-rose-500 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10 pointer-events-none">
                                {Array.from({ length: 36 }).map((_, i) => (
                                    <div key={i} className="border border-foreground/20" />
                                ))}
                            </div>
                            <div className="absolute top-8 left-8">
                                <p className="text-[10px] font-mono text-emerald-400">SYS_STABILITY: {riskMetrics?.stability || '0.000'}</p>
                                <p className="text-[10px] font-mono text-emerald-400">LAT_ROLL: {riskMetrics?.roll || '0.0r/s'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="maritime-card">
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-rose-500" />
                            Risk Thresholds
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                <span>Cargo Shift Risk</span>
                                <span className={riskMetrics?.cargoShift > 15 ? "text-rose-500" : "text-emerald-500"}>
                                    {riskMetrics?.cargoShift || 0}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${riskMetrics?.cargoShift || 0}%` }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                <span>Green Water Risk</span>
                                <span className={riskMetrics?.greenWater > 30 ? "text-amber-500" : "text-emerald-500"}>
                                    {riskMetrics?.greenWater || 0}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${riskMetrics?.greenWater || 0}%` }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                <span>Parametric Rolling</span>
                                <span className={riskMetrics?.parametric > 50 ? "text-rose-500" : "text-amber-500"}>
                                    {riskMetrics?.parametric || 0}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 shadow-glow shadow-rose-500/50 transition-all duration-1000" style={{ width: `${riskMetrics?.parametric || 0}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MotionRiskAnalyzer;
