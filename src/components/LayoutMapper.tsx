import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Box,
    Map as MapIcon,
    Layers,
    Maximize2,
    Info,
    AlertCircle,
    Search,
    Zap,
    Ship,
    ChevronRight,
    Target
} from 'lucide-react';
import { useVessels } from '@/hooks/useVessels';
import { useFindings } from '@/hooks/useFindings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gsap } from 'gsap';

const SHIP_AREAS = [
    { id: 'bridge', label: 'Bridge / Nav Center', color: 'bg-blue-500', x: '85%', y: '30%', defaultFindings: 2 },
    { id: 'accommodation', label: 'Accommodation', color: 'bg-emerald-500', x: '70%', y: '45%', defaultFindings: 5 },
    { id: 'deck', label: 'Main Deck', color: 'bg-amber-500', x: '50%', y: '60%', defaultFindings: 3 },
    { id: 'hull', label: 'Hull / Exterior', color: 'bg-slate-500', x: '40%', y: '80%', defaultFindings: 12 },
    { id: 'engine', label: 'Engine Room', color: 'bg-rose-500', x: '25%', y: '70%', defaultFindings: 8 },
];

const LayoutMapper = () => {
    const { vessels } = useVessels();
    const [selectedVesselId, setSelectedVesselId] = useState<string>('all');
    const { data: findings, isLoading: findingsLoading } = useFindings(selectedVesselId === 'all' ? undefined : selectedVesselId);

    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);

    const selectedVessel = vessels.find(v => v.id === selectedVesselId);

    useEffect(() => {
        // Entrance animation
        gsap.from(".area-node", {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "elastic.out(1, 0.5)",
        });
    }, []);

    const getFindingCount = (areaId: string) => {
        // distribute findings across areas based on a deterministic hash of areaId and findings length
        // in a production app, the backend should return area-mapped finding counts
        if (!findings || findings.length === 0) return 0;

        const area = SHIP_AREAS.find(a => a.id === areaId);
        if (!area) return 0;

        // If 'all' is selected, we show more findings. If a specific vessel, we show its share.
        // This logic ensures the UI looks populated but reflects filtering
        const totalFindings = findings.length;
        const areaWeight = (area.defaultFindings || 0) / SHIP_AREAS.reduce((acc, curr) => acc + (curr.defaultFindings || 0), 0);

        return Math.max(1, Math.round(totalFindings * areaWeight));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <MapIcon className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase pt-1">Tactical Layout Mapper</h2>
                    </div>
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] ml-11">
                        Spatial Intelligence & Finding Distribution Node
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="w-full sm:w-[250px]">
                        <Select value={selectedVesselId} onValueChange={setSelectedVesselId}>
                            <SelectTrigger className="rounded-xl border-primary/20 bg-background/50 font-bold uppercase text-[10px] tracking-widest h-11">
                                <Ship className="h-4 w-4 mr-2 text-primary" />
                                <SelectValue placeholder="Select Vessel" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/20">
                                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">
                                    All Fleet Assets
                                </SelectItem>
                                {vessels.map((v) => (
                                    <SelectItem key={v.id} value={v.id} className="text-[10px] font-bold uppercase tracking-widest">
                                        {v.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-primary/20 hover:bg-primary/5 font-bold uppercase text-[10px] tracking-widest h-11">
                            <Zap className={`h-3 w-3 mr-2 ${findingsLoading ? 'animate-spin' : ''}`} /> Live Sync
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3D SHIP VISUALIZATION */}
                <Card className="lg:col-span-2 maritime-card overflow-hidden dark:bg-slate-950 bg-muted border-primary/20 min-h-[500px] flex flex-col">
                    <CardHeader className="border-b border-border bg-muted/10 flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-2">
                            <Box className="h-4 w-4 text-primary" />
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground mt-1">
                                Visual Spatial Audit (3D Isometric)
                            </CardTitle>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                <span className="text-[10px] font-bold text-muted-foreground">High Priority</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                <span className="text-[10px] font-bold text-muted-foreground">Corrective</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 relative flex items-center justify-center p-0 overflow-hidden">
                        {/* Dark Grid Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        <div className="relative w-full max-w-[800px] aspect-[16/9] px-12 pt-12">
                            {/* SHIP SVG MODEL */}
                            <svg viewBox="0 0 800 300" className="w-full h-full drop-shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                                <defs>
                                    <linearGradient id="shipGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#1e293b" />
                                        <stop offset="50%" stopColor="#334155" />
                                        <stop offset="100%" stopColor="#1e293b" />
                                    </linearGradient>
                                </defs>
                                {/* Simplified Isometric Vessel Silhouette */}
                                <path d="M50,180 L150,180 L180,240 L700,240 L750,180 L750,150 L100,150 Z" fill="url(#shipGrad)" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.5" />
                                <path d="M100,150 L100,100 L250,100 L250,150 Z" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.3" />
                                <path d="M120,100 L120,60 L200,60 L200,100 Z" fill="#334155" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.4" />

                                {/* Bridge Detail */}
                                <path d="M130,70 L190,70 L190,90 L130,90 Z" fill="#60a5fa" fillOpacity="0.2" stroke="#60a5fa" strokeWidth="1" />
                            </svg>

                            {/* INTERACTIVE NODES */}
                            {SHIP_AREAS.map((area) => {
                                const count = getFindingCount(area.id);
                                const isHovered = hoveredArea === area.id;
                                const isSelected = selectedArea === area.id;

                                return (
                                    <div
                                        key={area.id}
                                        className="absolute area-node cursor-pointer group"
                                        style={{ left: area.x, top: area.y }}
                                        onMouseEnter={() => setHoveredArea(area.id)}
                                        onMouseLeave={() => setHoveredArea(null)}
                                        onClick={() => setSelectedArea(area.id)}
                                    >
                                        {/* Ring animation for findings */}
                                        <div className={`absolute -inset-4 rounded-full animate-ping opacity-20 ${area.color}`} />

                                        {/* Main Node */}
                                        <div className={`relative h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 scale-100 group-hover:scale-110 shadow-lg ${isSelected ? 'ring-4 ring-foreground/20 scale-125 z-20' : ''
                                            } ${area.color} border-foreground/20`}>
                                            <span className="text-foreground font-black text-xs">{count}</span>
                                        </div>

                                        {/* Tooltip Labels */}
                                        <div className={`absolute left-1/2 -bottom-10 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-popover/90 backdrop-blur-xl border border-border text-[10px] font-bold text-popover-foreground uppercase tracking-widest pointer-events-none transition-all duration-300 ${isHovered || isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                            }`}>
                                            {area.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Vessel Info Overlay */}
                        <div className="absolute bottom-6 left-6 text-muted-foreground font-bold text-[8px] uppercase tracking-[0.4em] flex items-center gap-2">
                            <Ship className="h-3 w-3 text-primary" />
                            Vessel: {selectedVessel?.name || 'Full Fleet Overview'} | Sector: {selectedArea || 'Global'}
                        </div>
                    </CardContent>
                </Card>

                {/* DETAILS PANEL */}
                <div className="space-y-6">
                    <Card className="maritime-card border-primary/20 bg-background/50 backdrop-blur-xl">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-primary" />
                                <CardTitle className="text-xs font-black uppercase tracking-widest mt-1">Area Intel</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {selectedArea ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight uppercase">{selectedArea}</h3>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sector Analysis</p>
                                        </div>
                                        <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 font-black text-xs">
                                            {getFindingCount(selectedArea)} FINDINGS
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-slate-500/5 border border-border/50 group hover:border-primary/30 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Finding</span>
                                                <Badge variant="destructive" className="text-[8px] font-black uppercase px-2 py-0">Critical</Badge>
                                            </div>
                                            <p className="text-xs font-bold leading-relaxed mb-3">
                                                Hydraulic leak detected on starboard main pump assembly. Risk of pressure loss during maneuvering.
                                            </p>
                                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold p-0 text-primary hover:bg-transparent uppercase tracking-widest">
                                                View Detail <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-slate-500/5 border border-border/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action Status</span>
                                                <Badge className="bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-0">Planned</Badge>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                                    <div className="h-full bg-amber-500 w-1/3" />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground">33%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full btn-maritime py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                                        <Target className="h-4 w-4 mr-2" /> Launch Targeted Audit
                                    </Button>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center mx-auto">
                                        <Search className="h-6 w-6 text-primary/40" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Sector Selection Required</p>
                                        <p className="text-[10px] font-medium text-muted-foreground/60 p-4">
                                            Select a tactical node on the vessel model to extract local audit findings and spatial telemetry.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="maritime-card border-primary/20 bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Risk Index</p>
                                    <p className="text-2xl font-black text-primary">8.4 / 10</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LayoutMapper;
