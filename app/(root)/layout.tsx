import { RootNav } from "@/components/root/RootNav";
import { Footer } from "@/components/root/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <RootNav />
            <main>
                {children}
            </main>
            <Footer/>
        </>
    );
}