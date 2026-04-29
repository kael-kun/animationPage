import { useState, useEffect } from 'react';
import Header from './components/Header';
import NodeNetwork from './components/NodeNetwork';
import DetailPanel from './components/DetailPanel';
import Legend from './components/Legend';
import MobileCardGrid from './components/MobileCardGrid';
import useStore from './stores/useStore';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { reducedMotion } = useStore();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      useStore.getState().toggleReducedMotion();
    }
  }, []);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {isMobile ? <MobileCardGrid /> : <NodeNetwork />}
        {!isMobile && <Legend />}
      </main>
      <DetailPanel />
    </div>
  );
}

export default App;