import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated }) {
  const [teamName, setTeamName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!teamName || !passcode) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: newTeam, error } = await supabase
      .from('teams')
      .insert([{ name: teamName, passcode }])
      .select()
      .single();

    if (!error) {
      await supabase.from('team_members').insert([
        {
          team_id: newTeam.id,
          user_id: user.id,
          role: 'admin',
        },
      ]);

      setTeamName('');
      setPasscode('');
      onClose();
      if (onTeamCreated) onTeamCreated(user.id); // 🔁 refresh list
    } else {
      console.error('Error creating team:', error);
    }

    setLoading(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Create a New Team</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            className="w-full border px-4 py-2 rounded-xl"
            placeholder="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <input
            className="w-full border px-4 py-2 rounded-xl"
            placeholder="4-digit Passcode"
            maxLength={4}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
