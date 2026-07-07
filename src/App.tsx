import { useAppStore } from './stores/useAppStore';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LetterBoxPage } from './pages/LetterBoxPage';
import { ChatPage } from './pages/ChatPage';
import { BookPage } from './pages/BookPage';
import { StarsPage } from './pages/StarsPage';
import { TabBar } from './components/TabBar';

export default function App() {
  const currentUser = useAppStore((state) => state.currentUser);
  const currentPage = useAppStore((state) => state.currentPage);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  if (!currentUser) {
    return <LoginPage />;
  }

  if (currentPage === 'onboarding') {
    return <OnboardingPage />;
  }

  const handleTabChange = (tab: string) => {
    setCurrentPage(tab as 'letterbox' | 'chat' | 'book' | 'stars');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'letterbox':
        return <LetterBoxPage />;
      case 'chat':
        return <ChatPage />;
      case 'book':
        return <BookPage />;
      case 'stars':
        return <StarsPage />;
      default:
        return <LetterBoxPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E6C8]">
      {renderContent()}
      <TabBar activeTab={currentPage} onTabChange={handleTabChange} />
    </div>
  );
}
