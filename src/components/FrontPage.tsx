import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Anchor,
  Ship,
  Shield,
  BarChart3,
  Users,
  FileCheck,
  ChevronRight } from
"lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.png";
import eagleLogo from "@/assets/eagle-maritime-logo.png";

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
  const floatingElementsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 3D Perspective setup
      gsap.set(containerRef.current, { perspective: 1200 });

      // Initial states with 3D positions
      gsap.set(
        [
        logoRef.current,
        titleRef.current,
        subtitleRef.current,
        descRef.current,
        ctaRef.current],

        {
          opacity: 0,
          y: 100,
          z: -200,
          rotationX: -45
        }
      );

      gsap.set(featuresRef.current?.children || [], {
        opacity: 0,
        y: 150,
        z: -300,
        rotationY: 45,
        scale: 0.8
      });

      // Main timeline for 3D entrance
      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1.5 }
      });

      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        z: 0,
        rotationX: 0,
        duration: 2,
        ease: "elastic.out(1, 0.75)"
      }).
      to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          z: 50,
          rotationX: 0
        },
        "-=1.6"
      ).
      to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          z: 30,
          rotationX: 0
        },
        "-=1.4"
      ).
      to(
        descRef.current,
        {
          opacity: 1,
          y: 0,
          z: 20,
          rotationX: 0
        },
        "-=1.3"
      ).
      to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          z: 40,
          rotationX: 0
        },
        "-=1.2"
      ).
      to(
        featuresRef.current?.children || [],
        {
          opacity: 1,
          y: 0,
          z: 0,
          rotationY: 0,
          scale: 1,
          stagger: 0.1,
          duration: 1.2,
          ease: "back.out(1.7)"
        },
        "-=1"
      );

      // Floating 3D objects animation
      if (floatingElementsRef.current) {
        Array.from(floatingElementsRef.current.children).forEach((el, i) => {
          gsap.to(el, {
            y: "random(-40, 40)",
            x: "random(-30, 30)",
            z: "random(-100, 100)",
            rotation: "random(-360, 360)",
            duration: `random(3, 6)`,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2
          });
        });
      }

      // Continuous wave animation with depth
      if (wavesRef.current) {
        gsap.to(wavesRef.current.children, {
          y: -15,
          z: (i) => i * 20,
          opacity: (i) => 0.1 + i * 0.05,
          duration: 3,
          ease: "sine.inOut",
          stagger: {
            each: 0.4,
            repeat: -1,
            yoyo: true
          }
        });
      }

      // Mouse tracking parallax effect
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 2;
        const yPos = (clientY / window.innerHeight - 0.5) * 2;

        gsap.to(heroRef.current, {
          rotationY: xPos * 8,
          rotationX: -yPos * 8,
          duration: 1,
          ease: "power2.out"
        });

        // Parallax depth for background elements
        if (floatingElementsRef.current) {
          gsap.to(floatingElementsRef.current.children, {
            x: (i) => xPos * (i + 1) * 20,
            y: (i) => yPos * (i + 1) * 20,
            duration: 1.5,
            ease: "power1.out"
          });
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
  {
    icon: Ship,
    title: "Fleet Tracking",
    desc: "Real-time vessel monitoring & status"
  },
  {
    icon: Shield,
    title: "Compliance",
    desc: "ISM, ISPS & regulatory adherence"
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "CII ratings & performance metrics"
  },
  {
    icon: Users,
    title: "Crew Management",
    desc: "Certifications & scheduling"
  },
  {
    icon: FileCheck,
    title: "Audit Trail",
    desc: "Complete documentation system"
  },
  {
    icon: Anchor,
    title: "Port Operations",
    desc: "Voyage planning & logistics"
  }];


  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full overflow-hidden text-white relative flex flex-col items-center justify-center"
      style={{ perspective: "1500px", backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* 3D Floating Elements in Background */}
      <div
        ref={floatingElementsRef}
        className="absolute inset-0 pointer-events-none opacity-30">

        {[...Array(12)].map((_, i) =>
        <div
          key={i}
          className="absolute rounded-lg border border-white/10 bg-white/5 backdrop-blur-md"
          style={{
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transformStyle: "preserve-3d"
          }} />

        )}
      </div>

      {/* Radiant Glow Layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[160px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-maritime-accent/10 blur-[130px]" />
      </div>

      {/* Grid Floor with Perspective */}
      <div
        className="absolute bottom-0 w-[200%] h-[100%] left-[-50%] opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, hsl(205,85%,50%)), 
                            linear-gradient(90deg, hsl(205,85%,50%) 1px, transparent 1px),
                            linear-gradient(0deg, hsl(205,85%,50%) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 60px 60px, 60px 60px",
          transform: "rotateX(75deg) translateY(50%)",
          transformOrigin: "bottom center"
        }} />


      {/* Main Content Scrollable Area */}
      <div
        className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl text-center px-0 py-[109px]"
        style={{ transformStyle: "preserve-3d" }}>

        {/* Animated Logo Container */}
        <div
          ref={logoRef}
          className="mb-12 relative group"
          style={{ transformStyle: "preserve-3d" }}>

          <div
            className="relative w-32 h-32 md:w-44 md:h-44 transform-gpu transition-transform duration-500 group-hover:scale-110"
            style={{ transformStyle: "preserve-3d" }}>

            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-maritime-accent to-blue-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center shadow-3xl border border-white/20 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <span className="text-7xl md:text-8xl select-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                🦅
              </span>
            </div>
            {/* Spinning Ring */}
            <div className="absolute -inset-4 rounded-full border-2 border-white/5 border-t-white/20 animate-[spin_8s_linear_infinite]" />
            <div className="absolute -inset-8 rounded-full border border-white/5 border-b-white/10 animate-[spin_12s_linear_infinite_reverse]" />
          </div>
        </div>

        {/* Hero Content */}
        <div ref={heroRef} style={{ transformStyle: "preserve-3d" }}>
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tighter"
            style={{ transform: "translateZ(100px)" }}>

            <span className="inline-block bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent italic">
              EAGLE
            </span>
            <span className="inline-block px-4 bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              PLATFORM
            </span>
          </h1>

          <h2
            ref={subtitleRef}
            className="text-2xl md:text-3xl lg:text-4xl font-light text-maritime-accent mb-8 tracking-[0.2em] uppercase"
            style={{ transform: "translateZ(60px)" }}>

            Evolution of Vessel Governance
          </h2>

          <p
            ref={descRef}
            className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed font-light text-neutral-100"
            style={{ transform: "translateZ(40px)" }}>

            A high-performance maritime ecosystem integrating real-time
            intelligence, absolute compliance, and automated fleet excellence.
          </p>
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} style={{ transform: "translateZ(80px)" }}>
          <Button
            onClick={onEnterDashboard}
            size="xl"
            className="group relative px-12 py-8 text-xl font-bold rounded-full bg-white text-slate-950 hover:bg-primary hover:text-white transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-primary/40 overflow-hidden">

            <span className="relative z-10 flex items-center gap-4">
              LAUNCH SYSTEM
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Button>
        </div>

        {/* Enhanced Features Grid */}
        <div
          ref={featuresRef}
          className="mt-24 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full"
          style={{ transformStyle: "preserve-3d" }}>

          {features.map((feature, index) =>
          <div
            key={index}
            className="group relative p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-primary/50 transition-all duration-500 flex flex-col items-center hover:-translate-y-4"
            style={{ transformStyle: "preserve-3d" }}>

              <div className="absolute inset-0 bg-primary/5 transition-opacity rounded-3xl opacity-70" />
              <div
              className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary shadow-xl transition-all duration-500"
              style={{ transform: "translateZ(30px)" }}>

                <feature.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-white mb-2 text-base md:text-lg group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 leading-tight text-center group-hover:text-slate-300">
                {feature.desc}
              </p>
            </div>
          )}
        </div>

        {/* Signature Footer */}
        <div className="mt-20 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-6 mx-[24px] my-0">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-xs tracking-[0.3em] font-medium uppercase">
              Maritime Authority 2026
            </span>
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-white/40" />
          </div>
          <p className="text-lg text-[#f7f8f8] font-bold">
            © Eagle Tech Systems • Chief Architect Elhamy Sobhy
          </p>
        </div>
      </div>

      {/* Decorative Wave System */}
      <div
        ref={wavesRef}
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">

        {[...Array(3)].map((_, i) =>
        <svg
          key={i}
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-full h-full preserve-3d">

            <path
            fill={
            i === 0 ?
            "hsl(205,85%,45%)" :
            i === 1 ?
            "hsl(185,80%,40%)" :
            "hsl(210,90%,15%)"
            }
            fillOpacity={0.1 + i * 0.1}
            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />

          </svg>
        )}
      </div>
    </div>);

};

export default FrontPage;