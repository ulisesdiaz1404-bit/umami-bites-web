import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { AboutSection } from "@/components/home/about-section";
import { FeaturedDishes } from "@/components/home/featured-dishes";
import { PackagesSection } from "@/components/home/packages-section";

// ISR: los destacados reflejan ediciones del admin.
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <AboutSection />
      <PackagesSection />
      <FeaturedDishes />
    </>
  );
}
