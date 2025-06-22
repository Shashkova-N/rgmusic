import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Layout/Header';
import { Footer } from '../Layout/Footer';

import '../../scss/style.scss'

export function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="app-wrapper">
      {!isAdmin && <Header />}
      <main className="main-content">
        {!isAdmin ? (
          <div className="container">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}