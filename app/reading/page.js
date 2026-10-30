import PageShell from '@/components/PageShell';
import { ReadingGroups } from '@/components/Reading';

export const metadata = {
  title: 'Reading · Manas Dasari',
  description: 'Books I’ve finished this year, and papers worth your time.',
  alternates: { canonical: '/reading/' },
};

export default function ReadingIndex() {
  return (
    <PageShell scene="books" title="Reading" intro="Books I’ve finished this year, and papers worth your time.">
      <ReadingGroups />
    </PageShell>
  );
}
