import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Layout/Header';
import { Footer } from '../Layout/Footer';

export function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="app-wrapper">
      {!isAdmin && <Header />}
      <main className="main-content">
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}