import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDevice } from './hooks/useDevice';

import DesktopHome from './pages/DesktopHome';
import MobileHome from './pages/MobileHome';
import CategoryPage from './pages/CategoryPage';

function App() {
  const isMobile = useDevice();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={isMobile ? <MobileHome /> : <DesktopHome />} 
        />
        <Route path="/categoria/:categoryId" element={<CategoryPage />} />
        <Route path="/categoria/:categoryId/:subId" element={<CategoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
