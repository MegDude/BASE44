import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Home from './pages/Home';
// Downtown Perks pages
import Landing from './pages/downtown-perks/Landing';
import Explore from './pages/downtown-perks/Explore';
import Events from './pages/downtown-perks/Events';
import PerksPage from './pages/downtown-perks/PerksPage';
import PerksCard from './pages/downtown-perks/PerksCard';
import ForBuildings from './pages/downtown-perks/ForBuildings';
import About from './pages/downtown-perks/About';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/* Downtown Perks routes */}
        <Route path="/downtown-perks" element={<Landing />} />
        <Route path="/downtown-perks/explore" element={<Explore />} />
        <Route path="/downtown-perks/events" element={<Events />} />
        <Route path="/downtown-perks/perks" element={<PerksPage />} />
        <Route path="/downtown-perks/card" element={<PerksCard />} />
        <Route path="/downtown-perks/for-buildings" element={<ForBuildings />} />
        <Route path="/downtown-perks/about" element={<About />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App