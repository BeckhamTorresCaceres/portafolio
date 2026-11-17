"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { scrollState } from "@/shared/lib/scrollState";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function usePortfolioAnimations() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.085 });
    (window as any).lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Sincronización del progreso global con la escena 3D
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (s) => {
          scrollState.progress = s.progress;
        },
      });

      // Animación de caracteres del Hero
      gsap.from(".hero-char", {
        yPercent: 110,
        opacity: 0,
        rotateX: -60,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.04,
        delay: 0.2,
      });

      // Elementos con entrada suave en el Hero
      gsap.from(".hero-fade", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.9,
      });

      // Salida en perspectiva del contenido del Hero
      gsap.to(".hero-content", {
        yPercent: -25,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Revelación genérica de bloques
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Contadores numéricos
      gsap.utils.toArray<HTMLElement>(".count").forEach((el) => {
        const end = Number(el.dataset.to);
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => {
            el.textContent = String(Math.round(o.v));
          },
        });
      });

      // Tarjetas de Skills escalonadas
      gsap.from(".skill-card", {
        y: 100,
        opacity: 0,
        rotateX: -25,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "#skills", start: "top 65%" },
      });

      // Scroll horizontal fijado (pinning) para Proyectos
      const track = trackRef.current;
      if (track) {
        const dist = () => track.scrollWidth - window.innerWidth;
        const mainTween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: "#projects",
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>(".project-card").forEach((c) => {
          gsap.fromTo(
            c,
            { rotateY: 18, scale: 0.92 },
            {
              rotateY: -18,
              scale: 0.92,
              ease: "none",
              scrollTrigger: {
                trigger: c,
                containerAnimation: mainTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
      }

      // Línea de la trayectoria temporal
      gsap.from(".tl-line", {
        scaleY: 0,
        transformOrigin: "top",
        ease: "none",
        scrollTrigger: {
          trigger: "#experience",
          start: "top 60%",
          end: "bottom 70%",
          scrub: true,
        },
      });

      // Carrusel infinito de Marquee
      gsap.to(".marquee-inner", {
        xPercent: -50,
        repeat: -1,
        duration: 30,
        ease: "none",
      });
    }, rootRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return { rootRef, trackRef };
}
