import { redirect } from 'next/navigation';

export default async function ReservePage({ params }: { params: Promise<{ alias: string }> }) {
    const { alias } = await params;
    if (alias) {
        redirect(`/${alias}/reserve-new`);
    } else {
        redirect('/');
    }
}