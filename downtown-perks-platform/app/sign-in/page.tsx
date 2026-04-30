
import { AuthForm } from '@/components/AuthForm';

export default function SignInPage() {
  return (
    <main className="section">
      <div className="container" style={{maxWidth: 560}}>
        <div className="card" style={{padding: 24}}>
          <div className="kicker">Auth</div>
          <h1 className="h2">Sign in</h1>
          <p className="copy">Use a magic link. Keep access light.</p>
          <AuthForm mode="signin" />
        </div>
      </div>
    </main>
  );
}
