import { useEffect, Suspense } from 'react';
import { DesktopPlayer } from './components/player/DesktopPlayer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Loading component
const Loading = () => {
  console.log('App: Rendering Loading component');
  return (
  <div className="flex justify-center items-center bg-neutral-900 h-screen text-white">
    <div className="border-primary-500 border-t-2 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
  </div>
)};

function App() {
  console.log('App: Render Cycle Start');
  useKeyboardShortcuts();


  useEffect(() => {
    console.log('App: useEffect - Component Mounted');
    import('./services/remote').then(({ remoteService }) => {
      remoteService.connect();
    });
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <DesktopPlayer />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
