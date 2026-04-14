import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ChevronDown } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import WhySection from "../components/home/WhySection";
import MapSection from "../components/home/MapSection";
import PartnerSlides from "../components/home/PartnerSlides";
import PricingSection from "../components/home/PricingSection";
import FAQSection from "../components/home/FAQSection";
import ContactSection from "../components/home/ContactSection";
import HomeFooter from "../components/HomeFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <WhySection />
      <MapSection />
      <PartnerSlides />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <HomeFooter />
    </div>
  );
}