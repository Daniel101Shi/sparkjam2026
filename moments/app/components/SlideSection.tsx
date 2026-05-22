"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

interface SlideSectionProps {
  src: string;
  index: number;
  alt?: string;
}

export default function SlideSection({ src, index, alt }: SlideSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.05,
      }}
      style={{
        width: "100%",
        padding: "2vh 0",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Image
          src={src}
          alt={alt || `Slide ${index + 1}`}
          fill
          sizes="60vw"
          style={{ objectFit: "contain" }}
          priority={index < 3}
        />
      </div>
    </motion.div>
  );
}
