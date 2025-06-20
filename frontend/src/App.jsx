import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { RequireAuth } from './component/Authorization/RequireAuth';

// Компоненты
// import { Login } from './component/Authorization/Login';
// import { Register } from './component/Authorization/Register';
import { Main } from './component/Layout/Main/Main';
import { Layout } from './component/Page/Layout';
import { Profile } from './component/Layout/PersonalAccount/Profile';
import { EditProfile } from './component/Layout/PersonalAccount/EditProfile';
import { PlaylistPage } from './component/Page/PlaylistPage/PlaylistPage';
import { CartPage } from './component/Page/CartPage/CartPage';
import { AdminPanel } from './component/Admin/AdminPanel/AdminPanel';
import { TracksPage } from './component/Admin/Pages/Tracks/TracksPage';
import { AddTrackPage } from './component/Admin/Pages/AddTrack/AddTrackPage';
import { EditTrackPage } from './component/Admin/Pages/EditTrack/EditTrackPage';
import { PriceUpdate } from './component/Admin/Pages/PriceUpdate/PriceUpdate';
import { PlaylistsPage } from './component/Admin/Pages/PlaylistsPage/PlaylistsPage';
import { AddPlaylist } from './component/Admin/Pages/AddPlaylist/AddPlaylist';
import { ServicePage } from './component/Page/ServicePage/ServicePage';

import './scss/style.scss';

// Импортируем uuid для session_id
import { v4 as uuidv4 } from 'uuid';

const ROLES = {
  User: 'user',
  Admin: 'admin'
};

function App() {
  const [sessionId, setSessionId] = useState(null);

  // Генерируем session_id при первом заходе
  useEffect(() => {
    const generateSessionId = () => {
      const storedSessionId = localStorage.getItem('session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = uuidv4();
        localStorage.setItem('session_id', newSessionId);
        setSessionId(newSessionId);
      }
    };

    generateSessionId();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Основная часть сайта */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Main />} />
            {/* <Route path="login" element={<Login />} /> */}
            {/* <Route path="register" element={<Register />} /> */}
            <Route path="playlist/:id" element={<PlaylistPage />} />

            {/* Корзина — передаём session_id */}
            <Route path="/cart" element={<CartPage session_id={sessionId} />} />

            {/* Защищённые маршруты для пользователей */}
            <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
              <Route path="profile" element={<Profile />} />
              <Route path="profile/edit" element={<EditProfile />} />
            </Route>

            {/* Админка */}
            <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
              <Route path="admin" element={<AdminPanel />}>
                <Route index element={<TracksPage />} />
                <Route path="tracks" element={<TracksPage />} />
                <Route path="tracks/new" element={<AddTrackPage />} />
                <Route path="tracks/:id/edit" element={<EditTrackPage />} />
                <Route path="tracks/price-update" element={<PriceUpdate />} />
                <Route path="playlists">
                  <Route index element={<PlaylistsPage />} />
                  <Route path="new" element={<AddPlaylist />} />
                </Route>
              </Route>
            </Route>

            {/* Просто страницы */}
            <Route path="/services" element={<ServicePage />} />

            <Route path="*" element={<h2>Страница не найдена</h2>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;