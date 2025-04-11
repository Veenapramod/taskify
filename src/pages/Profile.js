import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from './Layout';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const userId = sessionData.user.id;

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      setUser(sessionData.user);
      setFullName(profile?.full_name || '');
      setAvatarUrl(profile?.avatar_url || '');
    };

    loadProfile();
  }, []);

  const handleUpdate = async () => {
    setStatus('Updating...');
    const updates = { full_name: fullName };
  
    if (newAvatar) {
      const fileName = `${user.id}-${newAvatar.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, newAvatar, { upsert: true });
  
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
  
        updates.avatar_url = publicUrlData.publicUrl;
        setAvatarUrl(publicUrlData.publicUrl); // update state so preview updates too
      }
    }
  
    await supabase.from('users').upsert({
      id: user.id,
      ...updates,
    });
  
    setStatus('Profile updated!');
    setTimeout(() => window.location.reload(), 1000); // force refresh layout header
  };
  

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">👤 My Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-xl bg-gray-100 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            {avatarUrl && <img src={avatarUrl} alt="avatar" className="h-16 w-16 rounded-full mb-2" />}
            <input type="file" onChange={(e) => setNewAvatar(e.target.files[0])} />
          </div>
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            Save Changes
          </button>
          {status && <p className="text-green-600 text-sm mt-2">{status}</p>}
        </div>
      </div>
    </Layout>
  );
}
