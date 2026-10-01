import HeroSection from "@/components/root/HeroSection";
import { Partners } from "@/components/root/Partners";
import { About } from "@/components/root/About";
import { PastEvents } from "@/components/root/PastEvents";
import { UpcomingEvents } from "@/components/root/UpcomingEvents";
import { BecomeSponsor } from "@/components/root/BecomeSponsor";
import { Contact } from "@/components/root/Contact";
import { WhatsAppButton } from "@/components/root/WhatsAppButton";
import { WHATSAPP_URL } from "@/components/root/site-contact";

const HomePage = () => {
    return (
        <>
            <HeroSection/>
            <Partners/>
            <UpcomingEvents/>
            <About/>
            <BecomeSponsor/>
            <Contact/>
            <WhatsAppButton
                url={WHATSAPP_URL}
                variant="floating"
                message="Chat with us"
            />
        </>
    );
};

export default HomePage;