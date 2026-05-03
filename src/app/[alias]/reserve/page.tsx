import { redirect } from 'next/navigation';

export default async function ReservePage({ params }: { params: { alias: string } }) {
    const alias = params?.alias;
    if (alias) {
        redirect(`/${alias}/reserve-new`);
    } else {
        redirect('/');
    }
}