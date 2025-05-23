import { Outlet } from 'react-router-dom';
import { Header } from '../Layout/Header';
import { Footer } from '../Layout/Footer';

export function Layout() {
  return (
    <div>
      <Header />
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
