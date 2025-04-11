import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import emailjs from 'emailjs-com';

export default function AdminPanel({ teamId }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('member');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: roleData } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      setIsAdmin(roleData?.role === 'admin');
    };

    checkAdmin();
  }, [teamId]);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email || !fullName) {
      setStatus('Please fill in both name and email');
      return;
    }

    const { error } = await supabase.from('pending_invites').insert([
      {
        team_id: teamId,
        email,
        role,
      },
    ]);
    const { data: teamData } = await supabase
  .from('teams')
  .select('name')
  .eq('id', teamId)
  .single();

const teamName = teamData?.name || 'Taskify';
console.log('Sending EmailJS with:', JSON.stringify({
    email,
    name: fullName,
    team_name: teamName || 'Taskify'
  }, null, 2));
  await emailjs.send(
    'service_u9rv9cd',
    'template_s1dbaqe',
    {
      email: email,
      name: fullName,
      team_name: teamName || 'Taskify',
    },
    'NugM2gO43ro5W4p2Y'
  );
  
  
  
    if (error) {
      console.error(error);
      setStatus('Error sending invite');
    } else {
      setStatus('Invite sent!');
      setEmail('');
      setFullName('');
      setRole('member');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-white border p-6 rounded-xl shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">👑 Admin Controls</h2>

      <form onSubmit={handleInvite} className="space-y-3">
        <input
          className="w-full border px-4 py-2 rounded-xl"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full border px-4 py-2 rounded-xl"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="w-full border px-4 py-2 rounded-xl"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="member">Team Member</option>
          <option value="viewer">Viewer</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          Send Invite
        </button>

        {status && <p className="text-sm text-gray-600 mt-2">{status}</p>}
      </form>
    </div>
  );
}
