import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { RequireAuth } from './component/Authorization/RequireAuth';

import { Login } from './component/Authorization/Login';
import { Register } from './component/Authorization/Register';
import { Main } from './component/Layout/Main/Main';
import { Layout } from './component/Page/Layout';
import { Profile } from './component/Layout/PersonalAccount/Profile';
import { EditProfile } from './component/Layout/PersonalAccount/EditProfile';
import { PlaylistPage } from './component/Page/PlaylistPage/PlaylistPage';

import { AdminPanel } from './component/Admin/AdminPanel/AdminPanel';
import { TracksPage } from './component/Admin/Pages/Tracks/TracksPage';
import { AddTrackPage } from './component/Admin/Pages/AddTrack/AddTrackPage';

import './scss/style.scss';

const ROLES = {
  User: 'user',
  Admin: 'admin',
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Основная часть сайта */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Main />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="playlist/:id" element={<PlaylistPage />} />

            {/* Защищённые маршруты для обычных пользователей */}
            <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
              <Route path="profile" element={<Profile />} />
              <Route path="profile/edit" element={<EditProfile />} />
            </Route>

            {/* Админская часть */}
            <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
              <Route path="admin" element={<AdminPanel />}>
                {/* при заходе на /admin или /admin/tracks показываем список треков */}
                <Route index element={<TracksPage />} />
                <Route path="tracks" element={<TracksPage />} />

                <Route path="tracks/new" element={<AddTrackPage />} />
                {/* в будущем: 
                  <Route path="tracks/new" element={<AddTrackPage />} />
                  <Route path="users" element={<UsersPage />} />
                */}
              </Route>
            </Route>

            <Route path="*" element={<h2>Страница не найдена</h2>} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
