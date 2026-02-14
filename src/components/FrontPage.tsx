import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Anchor, Ship, Shield, BarChart3, Users, FileCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FrontPageProps {
  onEnterDashboard: () => void;
}

const FrontPage = ({ onEnterDashboard }: FrontPageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const wavesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([logoRef.current, titleRef.current, subtitleRef.current, descRef.current, ctaRef.current], {
        opacity: 0,
        y: 50
      });
      gsap.set(featuresRef.current?.children || [], {
        opacity: 0,
        y: 80,
        scale: 0.9
      });

      // Main timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Logo animation with bounce
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)'
      })
      // Title slide in
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, '-=0.5')
      // Subtitle
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.4')
      // Description
      .to(descRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.3')
      // CTA Button
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6
      }, '-=0.2')
      // Features staggered
      .to(featuresRef.current?.children || [], {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)'
      }, '-=0.3');

      // Continuous wave animation
      if (wavesRef.current) {
        gsap.to(wavesRef.current.children, {
          y: -10,
          duration: 2,
          ease: 'sine.inOut',
          stagger: 0.2,
          repeat: -1,
          yoyo: true
        });
      }

      // Logo pulse animation
      gsap.to(logoRef.current, {
        scale: 1.05,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1.5
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
  { icon: Ship, title: 'Fleet Tracking', desc: 'Real-time vessel monitoring & status' },
  { icon: Shield, title: 'Compliance', desc: 'ISM, ISPS & regulatory adherence' },
  { icon: BarChart3, title: 'Analytics', desc: 'CII ratings & performance metrics' },
  { icon: Users, title: 'Crew Management', desc: 'Certifications & scheduling' },
  { icon: FileCheck, title: 'Audit Trail', desc: 'Complete documentation system' },
  { icon: Anchor, title: 'Port Operations', desc: 'Voyage planning & logistics' }];


  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-[hsl(210,90%,12%)] via-[hsl(205,85%,20%)] to-[hsl(210,80%,8%)] text-white relative">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(205,85%,50%) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(205,85%,50%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[hsl(205,85%,35%)] opacity-10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(38,95%,55%)] opacity-10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[hsl(185,80%,45%)] opacity-5 blur-[150px]" />
      </div>

      {/* Wave decoration */}
      <div ref={wavesRef} className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-full opacity-20">
          <path fill="hsl(205,85%,50%)" d="M0,60 C360,120 720,0 1080,60 C1260,90 1350,80 1440,60 L1440,120 L0,120 Z" />
        </svg>
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-full opacity-15 translate-y-2">
          <path fill="hsl(185,80%,45%)" d="M0,80 C240,40 480,100 720,70 C960,40 1200,90 1440,60 L1440,120 L0,120 Z" />
        </svg>
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-full opacity-10 translate-y-4">
          <path fill="hsl(38,95%,55%)" d="M0,90 C180,70 360,100 540,80 C720,60 900,90 1080,75 C1260,60 1350,85 1440,70 L1440,120 L0,120 Z" />
        </svg>
      </div>

      {/* Main Content */}
      <div ref={heroRef} className="relative z-10 flex flex-col items-center justify-center min-h-screen px-0 py-[57px] mx-0 my-0">
        {/* Logo */}
        <div
          ref={logoRef}
          className="mb-8 relative">

          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[hsl(205,85%,45%)] to-[hsl(185,80%,35%)] flex items-center justify-center shadow-2xl shadow-[hsl(205,85%,35%)]/30 border-2 border-white/10">
            <div className="text-6xl md:text-7xl">🦅</div>
          </div>
          <div className="absolute -inset-4 rounded-full border border-white/10 animate-pulse" />
          <div className="absolute -inset-8 rounded-full border border-white/5 px-0 py-[15px] my-0" />
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-tight">

          <span className="bg-gradient-to-r from-white via-[hsl(185,80%,70%)] to-[hsl(38,95%,65%)] bg-clip-text text-transparent my-0 mx-0 px-0 font-mono font-bold text-right mb-[30px] pr-[38px] pt-[12px] py-0 text-9xl">EAGLE PLATFORM

          </span>
        </h1>

        {/* Subtitle */}
        <h2
          ref={subtitleRef}
          className="text-xl md:text-2xl lg:text-3xl font-medium text-[hsl(185,80%,70%)] mb-3 my-[35px]">

          Vessel Compliance Management
        </h2>

        {/* Description */}
        <p
          ref={descRef}
          className="text-base md:text-lg text-white/60 mb-10 max-w-2xl text-center leading-relaxed">

          Complete maritime operations platform for safety excellence, 
          regulatory compliance, and fleet performance optimization
        </p>

        {/* CTA Button */}
        <div ref={ctaRef}>
          <Button
            onClick={onEnterDashboard}
            size="lg"
            className="group relative px-8 py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-[hsl(205,85%,45%)] to-[hsl(185,80%,40%)] hover:from-[hsl(205,85%,50%)] hover:to-[hsl(185,80%,45%)] text-white shadow-xl shadow-[hsl(205,85%,35%)]/30 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">

            <span className="flex items-center gap-3">
              Enter Dashboard
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>

        {/* Features Grid */}
        <div
          ref={featuresRef}
          className="mt-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl w-full">

          {features.map((feature, index) =>
          <div
            key={index}
            className="group p-4 md:p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[hsl(205,85%,50%)]/30 transition-all duration-300 cursor-default">

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(205,85%,45%)] to-[hsl(185,80%,40%)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-[hsl(205,85%,35%)]/20">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1 text-sm md:text-base">{feature.title}</h3>
              <p className="text-xs md:text-sm text-white/50 leading-relaxed">{feature.desc}</p>
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="mt-16 flex items-center gap-4 text-white/30 text-sm">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-white/20" />
          <span>Maritime Excellence Since 2025 , Elhamy Sobhy 
Copyrights Reserved </span>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>
    </div>);
};

export default FrontPage;