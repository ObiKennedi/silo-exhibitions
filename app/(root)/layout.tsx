import { RootNav } from "@/components/root/RootNav";
import { Footer } from "@/components/root/Footer";
import { BackToTop } from "@/components/root/BackToTop";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <RootNav />
            <main>
                {children}
            </main>
            <Footer/>
            <BackToTop />
        </>
    );
}