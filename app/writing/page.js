import PageShell from '@/components/PageShell';
import { PostList } from '@/components/Writing';

export const metadata = {
  title: 'Writing · Manas Dasari',
  description: 'Notes on developer tools, open source and machine learning.',
  alternates: { canonical: '/writing/' },
};

export default function WritingIndex() {
  return (
    <PageShell scene="rain" title="Writing" intro="Notes on developer tools, open source and machine learning, as I go.">
      <PostList />
    </PageShell>
  );
}
