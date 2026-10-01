import { redirect } from "next/navigation";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function LegacyVolunteerRedirect({ params }: Props) {
    const { slug } = await params;
    redirect(`/${slug}/volunteer`);
}
