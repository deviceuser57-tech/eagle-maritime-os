import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cpu, Box, Database, Network, Activity, Layers, ArrowUpRight, Maximize2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useVessels } from '@/hooks/useVessels';

const DigitalTwin = () => {
    const { vessels } = useVessels();
    const [selectedVesselId, setSelectedVesselId] = React.useState<string | null>(null);
    const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [lastMousePos, setLastMousePos] = React.useState({ x: 0, y: 0 });

    const twinStats = [
        { label: 'Asset Synchronicity', value: selectedVesselId ? '99.9%' : '0.0%', icon: Network, color: 'text-emerald-500' },
        { label: 'Data Points/Sec', value: selectedVesselId ? '14.2k' : '0', icon: Database, color: 'text-primary' },
        { label: 'Simulation Fidelity', value: 'High', icon: Cpu, color: 'text-primary' },
        { label: 'Virtual Node Status', value: selectedVesselId ? 'Active' : 'Standby', icon: Activity, color: 'text-emerald-500' },
    ];

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        setRotation(prev => ({
            x: prev.x + deltaY * 0.5,
            y: prev.y + deltaX * 0.5
        }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="space-y-10 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground mb-1 uppercase px-1">Digital Twin</h2>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest px-1 opacity-70">
                        Asset State Mirroring Node
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
                                    {v.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button className="btn-maritime h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                        Sync Data
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                {twinStats.map((stat, idx) => (
                    <Card key={idx} className="maritime-card group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-muted/10 ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">{stat.label}</p>
                                    <p className="text-xl font-black tracking-tight">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="maritime-card group">
                    <CardHeader className="bg-muted/10 border-b border-border/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Box className="h-4 w-4 text-primary" />
                            Structural Mirroring
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div
                            className="h-96 w-full rounded-[2rem] dark:bg-slate-950 bg-muted flex items-center justify-center relative overflow-hidden group/viz cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            style={{ perspective: '1200px' }}
                        >
                            {/* Visual Feedback Overlay */}
                            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/10 border border-border backdrop-blur-md z-20">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">360° Tactical View Active</span>
                            </div>

                            {/* 3D ROTATABLE CONTAINER */}
                            <div
                                className="relative transition-transform duration-150 ease-out"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                                }}
                            >
                                {/* THE VESSEL MODEL (CSS 3D) */}
                                <div className="relative w-64 h-24" style={{ transformStyle: 'preserve-3d' }}>
                                    {/* Hull Bottom */}
                                    <div className="absolute inset-0 bg-primary/20 border-2 border-primary/40 rounded-[20%_80%_80%_20%] shadow-[0_0_50px_rgba(59,130,246,0.2)]" />

                                    {/* Deck Plane */}
                                    <div
                                        className="absolute inset-0 dark:bg-slate-800/80 bg-muted-foreground/10 border border-primary/30 rounded-[20%_80%_80%_20%]"
                                        style={{ transform: 'translateZ(30px)' }}
                                    >
                                        <div className="absolute top-1/2 left-1/4 w-12 h-16 dark:bg-slate-700 bg-muted-foreground/20 border border-primary/20 rounded-lg -translate-y-1/2" style={{ transform: 'translateZ(20px)' }}>
                                            {/* Bridge */}
                                            <div className="absolute inset-2 bg-blue-500/20 border border-blue-400/30 rounded" />
                                        </div>
                                        {/* Forecastle */}
                                        <div className="absolute top-1/2 right-10 w-8 h-8 rounded-full border border-primary/20 -translate-y-1/2 opacity-40" />
                                    </div>

                                    {/* Hull Walls (Simplified) */}
                                    <div
                                        className="absolute h-[30px] w-full bg-gradient-to-b from-primary/30 to-transparent border-x border-primary/20"
                                        style={{ transform: 'rotateX(-90deg) translateY(-15px)', transformOrigin: 'top' }}
                                    />
                                </div>

                                {/* Ground Grid Plane */}
                                <div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none"
                                    style={{
                                        transform: 'rotateX(90deg) translateZ(-60px)',
                                        backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                                        backgroundSize: '30px 30px'
                                    }}
                                />
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-mono text-emerald-400 tracking-tighter">ROT_X: {rotation.x.toFixed(1)}°</p>
                                    <p className="text-[10px] font-mono text-emerald-400 tracking-tighter">ROT_Y: {rotation.y.toFixed(1)}°</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-muted/10 border border-border hover:bg-muted/20"
                                        onClick={() => setRotation({ x: 0, y: 0 })}>
                                        <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                    <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-xl backdrop-blur-md">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Manual Override Engaged</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="maritime-card">
                    <CardHeader className="bg-muted/10 border-b border-border/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Network className="h-4 w-4 text-primary" />
                            Telemetric Node Network
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {[
                            { id: 'NODE_01', tag: 'Main Engine', integrity: '98%', load: 'High' },
                            { id: 'NODE_02', tag: 'Auxiliary Power', integrity: '100%', load: 'Normal' },
                            { id: 'NODE_03', tag: 'Fuel Distribution', integrity: '95%', load: 'Idle' },
                            { id: 'NODE_04', tag: 'Navigation Core', integrity: '100%', load: 'Normal' },
                        ].map((node, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow" />
                                    <div>
                                        <p className="text-xs font-black tracking-tight">{node.id}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{node.tag}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black">{node.integrity}</p>
                                    <p className="text-[10px] font-bold text-primary uppercase">{node.load}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DigitalTwin;
