import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoBar } from './components/DemoBar';
import { Navbar } from './components/Navbar';
import { BookExchange } from './components/BookExchange';
import { MyActivityView } from './components/MyActivityView';
import { WalletView } from './components/WalletView';
import { MentoringView } from './components/MentoringView';
import { RewardsView } from './components/RewardsView';
import { ImpactView } from './components/ImpactView';
import { LoopAIView } from './components/LoopAIView';
import { AdminAuditView } from './components/AdminAuditView';
import { CreateListingModal } from './components/CreateListingModal';
import { MilestoneCelebrationModal } from './components/MilestoneCelebrationModal';
import { FloatingLoopAI } from './components/FloatingLoopAI';
import { Heart, Sparkles, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, users, switchUser, showMilestoneModal, setShowMilestoneModal } = useApp();
  const [activeTab, setActiveTab] = useState<string>('books');
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  useEffect(() => {
    setIsListingModalOpen(false);
    if (!currentUser.roles.includes('admin')) {
      setActiveTab((tab) => tab === 'admin' ? 'books' : tab);
    }
  }, [currentUser.id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Explicit Top Demo Mode & Persona Switcher Bar */}
      <DemoBar />

      {/* 2. Responsive CampusLoop Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenListingModal={() => setIsListingModalOpen(true)}
      />

      {/* 3. Main Workspace Container */}
      <main key={`content-${currentUser.id}`} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'books' && (
          <BookExchange onOpenListingModal={() => setIsListingModalOpen(true)} />
        )}

        {activeTab === 'activity' && (
          <MyActivityView
            onOpenListingModal={() => setIsListingModalOpen(true)}
            onNavigateToBooks={() => setActiveTab('books')}
          />
        )}

        {activeTab === 'mentoring' && <MentoringView />}

        {activeTab === 'rewards' && <RewardsView />}

        {activeTab === 'impact' && <ImpactView />}

        {activeTab === 'loop_ai' && (
          <LoopAIView
            onNavigateToBooks={() => setActiveTab('books')}
            onNavigateToMentoring={() => setActiveTab('mentoring')}
            onNavigateToRewards={() => setActiveTab('rewards')}
            onNavigateToWallet={() => setActiveTab('wallet')}
          />
        )}

        {activeTab === 'wallet' && <WalletView />}

        {activeTab === 'admin' && currentUser.roles.includes('admin') && <AdminAuditView />}
      </main>

      {/* Floating Role-Aware LOOP AI Assistant */}
      <FloatingLoopAI key={`chat-${currentUser.id}`} onNavigateTab={setActiveTab} />

      {/* 4. Create Listing Modal */}
      <CreateListingModal
        key={`listing-${currentUser.id}`}
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
      />

      {/* 5. 10,000 Credit Milestone WOW Celebration Modal */}
      <MilestoneCelebrationModal
        isOpen={showMilestoneModal}
        targetUser={users.rohan}
        isOwnMilestone={currentUser.id === 'rohan'}
        onClose={() => setShowMilestoneModal(false)}
        onExploreVault={() => {
          setShowMilestoneModal(false);
          if (currentUser.id !== 'rohan') switchUser('rohan');
          setActiveTab('rewards');
        }}
      />

      {/* 6. CampusLoop Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              CL
            </div>
            <span className="font-bold text-slate-800">CAMPUSLOOP</span>
            <span className="text-slate-400">•</span>
            <span>Learn. Share. Earn. Grow.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified Handover Protocol
            </span>
            <span>CBSE & Campus Curriculum</span>
            <span>Demo Mode (Local Persistence)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ResettableApp: React.FC = () => {
  const { resetGeneration } = useApp();
  // Reset local forms, filters, chats and pending UI callbacks even when the
  // selected persona was already Aarav. The shared provider stays mounted.
  return <MainApp key={resetGeneration} />;
};

export default function App() {
  return (
    <AppProvider>
      <ResettableApp />
    </AppProvider>
  );
}
