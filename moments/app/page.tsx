"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import SlideSection from "./components/SlideSection";

// Dynamic import — Three.js needs browser APIs
const PhoneScene = dynamic(() => import("./components/PhoneScene"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          border: "3px solid #333",
          borderTopColor: "#888",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

// Slide filenames in order
const SLIDES = [
  "Slide 16_9 - 1.png",
  "Slide 16_9 - 2.png",
  "Slide 16_9 - 3.png",
  "Slide 16_9 - 4.png",
  "Slide 16_9 - 5.png",
  "Slide 16_9 - 6.png",
  "Slide 16_9 - 7.png",
  "Slide 16_9 - 9.png",
  "Slide 16_9 - 10.png",
  "Slide 16_9 - 12.png",
  "Slide 16_9 - 13.png",
  "Slide 16_9 - 14.png",
  "Slide 16_9 - 15.png",
  "Slide 16_9 - 16.png",
  "Slide 16_9 - 17.png",
  "Slide 16_9 - 18.png",
  "Slide 16_9 - 19.png",
  "Slide 16_9 - 20.png",
  "Slide 16_9 - 21.png",
  "Slide 16_9 - 22.png",
  "Slide 16_9 - 23.png",
  "Slide 16_9 - 24.png",
  "Slide 16_9 - 25.png",
  "Slide 16_9 - 26.png",
  "Slide 16_9 - 27.png",
];

/** Hook: read a MotionValue as React state */
function useMotionValueState(mv: MotionValue<number>): number {
  const [val, setVal] = useState<number>(mv.get());
  useEffect(() => {
    const unsub = mv.on("change", setVal);
    return unsub;
  }, [mv]);
  return val;
}

/** Hook: detect mobile viewport */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });

  // Phone rotation: 0 (back/camera side) → π (front/screen side)
  const phoneRotation = useTransform(
    scrollYProgress,
    [0, 0.04, 0.15, 1],
    [0, 0, Math.PI, Math.PI]
  );

  // Header fade-out
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.05], [1, 0.95]);

  return (
    <div ref={pageRef} style={{ background: "#000", minHeight: "100vh" }}>
      {/* ============= HEADER SECTION ============= */}
      <motion.section
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          opacity: headerOpacity,
          scale: headerScale,
        }}
      >
        <Image
          src="/Team_1_Header.png"
          alt="Instagram Moments — A collaborative video gallery and editor"
          fill
          priority
          style={{ objectFit: "contain" }}
        />
      </motion.section>

      {/* ============= MOBILE LAYOUT ============= */}
      {isMobile ? (
        <MobileLayout
          scrollYProgress={scrollYProgress}
          phoneRotation={phoneRotation}
        />
      ) : (
        <DesktopLayout
          scrollYProgress={scrollYProgress}
          phoneRotation={phoneRotation}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────
   DESKTOP — two-column: slides left, sticky phone right
   ────────────────────────────────────────────────── */
function DesktopLayout({
  scrollYProgress,
  phoneRotation,
}: {
  scrollYProgress: MotionValue<number>;
  phoneRotation: MotionValue<number>;
}) {
  return (
    <section
      style={{
        display: "flex",
        width: "100%",
        maxWidth: "1800px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* LEFT — Slides */}
      <div
        style={{
          flex: "0 0 58%",
          width: "58%",
          padding: "4vh 3vw 12vh 3vw",
          display: "flex",
          flexDirection: "column",
          gap: "4vh",
        }}
      >
        {SLIDES.map((f, i) => (
          <SlideSection key={f} src={`/Slides/${f}`} index={i} />
        ))}
      </div>

      {/* RIGHT — Sticky 3D Phone */}
      <div
        style={{
          flex: "0 0 42%",
          width: "42%",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DesktopPhoneWrapper phoneRotation={phoneRotation} />
        </div>
      </div>
    </section>
  );
}

function DesktopPhoneWrapper({
  phoneRotation,
}: {
  phoneRotation: MotionValue<number>;
}) {
  const rotation = useMotionValueState(phoneRotation);

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <PhoneScene rotationY={rotation} interactive={false} />
    </div>
  );
}

/* ──────────────────────────────────────────────────
   MOBILE — stacked: phone (interactive) then slides
   ────────────────────────────────────────────────── */
function MobileLayout({
  scrollYProgress,
  phoneRotation,
}: {
  scrollYProgress: MotionValue<number>;
  phoneRotation: MotionValue<number>;
}) {
  return (
    <>
      {/* 3D Phone — interactive / draggable */}
      <section
        style={{
          width: "100%",
          height: "70vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Drag hint */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: "3vh",
            color: "#666",
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          ↔ Drag to rotate
        </motion.p>

        <div style={{ width: "100%", height: "100%" }}>
          <MobilePhoneWrapper phoneRotation={phoneRotation} />
        </div>
      </section>

      {/* Slides — full width, stacked */}
      <section
        style={{
          width: "100%",
          padding: "4vh 4vw 12vh 4vw",
          display: "flex",
          flexDirection: "column",
          gap: "3vh",
        }}
      >
        {SLIDES.map((f, i) => (
          <SlideSection key={f} src={`/Slides/${f}`} index={i} />
        ))}
      </section>
    </>
  );
}

function MobilePhoneWrapper({
  phoneRotation,
}: {
  phoneRotation: MotionValue<number>;
}) {
  const rotation = useMotionValueState(phoneRotation);

  return (
    <PhoneScene rotationY={rotation} interactive={true} />
  );
}
