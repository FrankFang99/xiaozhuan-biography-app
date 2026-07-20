import { useAppStore } from './stores/useAppStore';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LetterBoxPage } from './pages/LetterBoxPage';
import { ChatPage } from './pages/ChatPage';
import { BiographyPage } from './pages/BiographyPage';
import { ShowcasePage } from './pages/ShowcasePage';
import { MyPage } from './pages/MyPage';
import { FeedbackPage } from './pages/FeedbackPage';
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

  if (currentPage === 'showcase') {
    return <ShowcasePage />;
  }

  if (currentPage === 'biography') {
    return <BiographyPage />;
  }

  if (currentPage === 'feedback') {
    return <FeedbackPage />;
  }

  const handleTabChange = (tab: string) => {
    setCurrentPage(tab as 'chat' | 'letterbox' | 'my');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage />;
      case 'letterbox':
        return <LetterBoxPage />;
      case 'my':
        return <MyPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030512]">
      {renderContent()}
      <TabBar activeTab={currentPage} onTabChange={handleTabChange} />
    </div>
  );
}