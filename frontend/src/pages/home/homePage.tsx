import HeroSection from '../../components/organisms/heroSection'
import AboutSection from '../../components/organisms/aboutSection'
import BentoGrid from '../../components/organisms/bentoGrid'
import HowItWorks from '../../components/organisms/howItWorks'
import Testimonials from '../../components/organisms/testimonials'
import Faq from '../../components/organisms/faq'
import Footer from '../../components/organisms/footer'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <BentoGrid />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <Footer />
    </main>
  )
}
