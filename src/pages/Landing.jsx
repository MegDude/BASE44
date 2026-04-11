import HeroSection from "../components/landing/HeroSection";
import ProblemSection from "../components/landing/ProblemSection";
import SystemSection from "../components/landing/SystemSection";
import ExperienceGrid from "../components/landing/ExperienceGrid";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import CTASection from "../components/landing/CTASection";

const HERO_IMAGE = "/__generating__/img_7532b37baee0.png";

const EXPERIENCE_IMAGES = [
  { src: "/__generating__/img_260f44b95425.png", alt: "Rooftop social in Austin", label: "Rooftop Socials" },
  { src: "/__generating__/img_c600082a9b17.png", alt: "Wellness cold plunge experience", label: "Wellness & Recovery" },
  { src: "/__generating__/img_15202024938a.png", alt: "Downtown Austin run club", label: "Run Clubs" },
  { src: "/__generating__/img_491daf807d40.png", alt: "Local dining experience", label: "Local Dining" },
  { src: "/__generating__/img_ed2608cf52f4.png", alt: "Yoga class with skyline view", label: "Yoga & Movement" },
  { src: "/__generating__/img_260f44b95425.png", alt: "Community gathering", label: "Community Events" },
];

export default function Landing() {
  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />
      <ProblemSection />
      <SystemSection />
      <ExperienceGrid images={EXPERIENCE_IMAGES} />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}