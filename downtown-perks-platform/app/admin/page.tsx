
import { getServerSupabase, isAdminEmail } from '@/lib/supabase';
import { redirect } from 'next/navigation';

async function getRows(table: string) {
  const supabase = await getServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(10);
  return data || [];
}

export default async function AdminPage() {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return <main className="section"><div className="container"><div className="card" style={{padding:24}}>Missing Supabase env vars.</div></div></main>;
  }
  const { data: authData } = await supabase.auth.getUser();
  const email = authData.user?.email || null;
  if (!isAdminEmail(email)) redirect('/sign-in');

  const [rsvps, redemptions, textLinks, checkouts] = await Promise.all([
    getRows('rsvps'),
    getRows('redemptions'),
    getRows('text_links'),
    getRows('checkouts')
  ]);

  return (
    <main className="section">
      <div className="container">
        <div className="kicker">Admin dashboard</div>
        <h1 className="h1" style={{fontSize: 'clamp(40px,6vw,72px)'}}>Operational activity</h1>
        <p className="copy">Signed in as {email}</p>
        <div className="proof-strip">
          <div className="card" style={{padding:18}}><strong>RSVPs</strong><div className="copy">{rsvps.length} recent</div></div>
          <div className="card" style={{padding:18}}><strong>Redemptions</strong><div className="copy">{redemptions.length} recent</div></div>
          <div className="card" style={{padding:18}}><strong>Text links</strong><div className="copy">{textLinks.length} recent</div></div>
          <div className="card" style={{padding:18}}><strong>Checkouts</strong><div className="copy">{checkouts.length} recent</div></div>
        </div>
        <div className="grid-three" style={{marginTop: 18}}>
          <section className="card" style={{padding:18}}>
            <div className="kicker">RSVPs</div>
            {rsvps.map((row: any) => <p className="copy" key={row.id}>{row.item_title} · {row.mode}</p>)}
          </section>
          <section className="card" style={{padding:18}}>
            <div className="kicker">Redemptions</div>
            {redemptions.map((row: any) => <p className="copy" key={row.id}>{row.item_title} · {row.mode}</p>)}
          </section>
          <section className="card" style={{padding:18}}>
            <div className="kicker">Text links + checkouts</div>
            {textLinks.map((row: any) => <p className="copy" key={row.id}>{row.phone} · {row.source || 'site'}</p>)}
            {checkouts.map((row: any) => <p className="copy" key={row.id}>{row.plan} · {row.status || 'created'}</p>)}
          </section>
        </div>
      </div>
    </main>
  );
}
