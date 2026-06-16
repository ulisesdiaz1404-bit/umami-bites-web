import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { FeaturedDishes } from "@/components/home/featured-dishes";
import { PackagesSection } from "@/components/home/packages-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <PackagesSection />
      <FeaturedDishes />
    </>
  );
}
