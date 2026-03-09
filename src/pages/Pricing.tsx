import PricingSection from "@/components/landing/PricingSection";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <PricingSection showTitle={true} />
      </main>
      <Footer />
    </div>
  );
}
