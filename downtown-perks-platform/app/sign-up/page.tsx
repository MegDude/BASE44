
import { AuthForm } from '@/components/AuthForm';

export default function SignUpPage() {
  return (
    <main className="section">
      <div className="container" style={{maxWidth: 560}}>
        <div className="card" style={{padding: 24}}>
          <div className="kicker">Auth</div>
          <h1 className="h2">Create account</h1>
          <p className="copy">Create resident or partner access with one email link.</p>
          <AuthForm mode="signup" />
        </div>
      </div>
    </main>
  );
}
