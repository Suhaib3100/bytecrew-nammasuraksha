import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <HeroSection />
      <StatsSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;