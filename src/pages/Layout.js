import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const [userInfo, setUserInfo] = useState({ name: '', avatar: '', email: '' });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      setUserInfo({
        name: profile?.full_name || user.email,
        email: user.email,
        avatar: profile?.avatar_url || '',
      });
    };

    fetchUserInfo();

    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-10">Taskify</h1>
        <nav className="flex flex-col space-y-4 text-gray-700 font-medium">
          <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
          <a href="/profile" className="hover:text-blue-600">My Profile</a>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-4 py-3 flex justify-end items-center relative">
          {/* Avatar + dropdown */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} className="w-9 h-9 rounded-full object-cover" alt="avatar" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold uppercase">
                  {userInfo.name?.[0]}
                </div>
              )}
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-10">
                <div className="p-3 border-b">
                  <p className="font-semibold text-sm">{userInfo.name}</p>
                  <p className="text-xs text-gray-500">{userInfo.email}</p>
                </div>
                <a href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">My Profile</a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
