import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDevice } from './hooks/useDevice';

// Vamos importar nossas Páginas Dinâmicas aqui
import DesktopHome from './pages/DesktopHome';
import MobileHome from './pages/MobileHome';

function App() {
  const isMobile = useDevice();

  return (
    <BrowserRouter>
      {/* Botão Global WhatsApp Injection poderia ficar aqui */}
      <Routes>
        <Route 
          path="/" 
          element={isMobile ? <MobileHome /> : <DesktopHome />} 
        />
        {/* <Route path="/admin" element={<AdminPanel />} /> */}
      </Routes>
    </BrowserRouter>
  );
}


export default App;
