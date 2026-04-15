import HeroSection from "../../components/downtown-perks/landing/HeroSection";
import ProblemSection from "../../components/downtown-perks/landing/ProblemSection";
import SystemSection from "../../components/downtown-perks/landing/SystemSection";
import ExperienceGrid from "../../components/downtown-perks/landing/ExperienceGrid";
import HowItWorksSection from "../../components/downtown-perks/landing/HowItWorksSection";
import CTASection from "../../components/downtown-perks/landing/CTASection";
import FAQAccordionBlock from "@/components/ui/FAQAccordionBlock";
import { FAQ_HOMEPAGE } from "@/lib/faq-partner-data";

const HERO_IMAGE = "https://media.base44.com/images/public/69da00318449b692572744f2/010c4f66b_generated_7a2820f8.png";

const EXPERIENCE_IMAGES = [
  { src: "https://media.base44.com/images/public/69da00318449b692572744f2/52842f078_generated_09e0a551.png", alt: "Rooftop social in Austin", label: "Rooftop Socials" },
  { src: "https://media.base44.com/images/public/69da00318449b692572744f2/6852cd7a6_generated_ef9262dd.png", alt: "Wellness cold plunge experience", label: "Wellness & Recovery" },
  { src: "https://media.base44.com/images/public/69da00318449b692572744f2/cfce8a43d_generated_49045bf8.png", alt: "Downtown Austin run club", label: "Run Clubs" },
  { src: "https://media.base44.com/images/public/69da00318449b692572744f2/44a9a98fc_generated_8d4c27ec.png", alt: "Local dining experience", label: "Local Dining" },
  { src: "https://media.base44.com/images/public/69da00318449b692572744f2/eed33e441_generated_36cd1dbb.png", alt: "Yoga class with skyline view", label: "Yoga & Movement" },
  { src: "https://media.base44.com/images/public/69da00318449b692572744f2/52842f078_generated_09e0a551.png", alt: "Community gathering", label: "Community Events" },
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
      <FAQAccordionBlock
        sectionEyebrow="FAQs"
        sectionTitle="Questions, answered clearly"
        sectionIntro="Downtown Perks is built to make downtown easier to use. These are the questions people usually ask first."
        items={FAQ_HOMEPAGE}
        styleVariant="split"
        showNumbers={false}
        allowMultipleOpen={false}
        defaultOpenIndex={0}
        pageType="homepage"
        backgroundVariant="light"
        ctaLabel="Learn more about Downtown Perks"
        ctaHref="/downtown-perks/about"
      />
    </div>
  );
}