import HeroSection from "@/components/root/HeroSection";
import { Partners } from "@/components/root/Partners";
import { About } from "@/components/root/About";
import { PastEvents } from "@/components/root/PastEvents";
import { UpcomingEvents } from "@/components/root/UpcomingEvents"
import { Contact } from "@/components/root/Contact";

const HomePage = () => {
    return (
        <>
            <HeroSection/>
            <Partners/>
            <About/>
            <PastEvents/>
            <UpcomingEvents/>
            <Contact/>
        </>
    )
}

export default HomePage;