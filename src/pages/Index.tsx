import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import ModulesSection from "@/components/landing/ModulesSection";
import VideosSection from "@/components/landing/VideosSection";
import AudienceSection from "@/components/landing/AudienceSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <ModulesSection />
        <VideosSection />
        <AudienceSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
