import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDevice } from './hooks/useDevice';

import DesktopHome from './pages/DesktopHome';
import MobileHome from './pages/MobileHome';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const isMobile = useDevice();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route 
          path="/" 
          element={isMobile ? <MobileHome /> : <DesktopHome />} 
        />
        <Route path="/categoria/:categoryId" element={<CategoryPage />} />
        <Route path="/categoria/:categoryId/:subId" element={<CategoryPage />} />
        <Route path="/produto/:productId" element={<ProductPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
