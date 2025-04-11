import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';
import CreateTeamModal from '../components/CreateTeamModal';
import { Link } from 'react-router-dom';
import Chat from '../components/Chat';

function Dashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeams = async (userId) => {
    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const teamIds = memberships?.map((m) => m.team_id) || [];

    const { data } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    setTeams(data || []);
  };

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email);
      await fetchTeams(user.id);
    };
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Taskify</h1>
          <span className="text-sm text-gray-600">{userEmail}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Your Teams</h2>
          <Button onClick={() => setIsModalOpen(true)}>+ Create Team</Button>
        </div>

        {teams.length === 0 ? (
          <p className="text-gray-500">You're not part of any teams yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-4 border bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                <Link to={`/team/${team.id}`}>
                  <h2 className="text-lg font-semibold text-blue-700">{team.name}</h2>
                  <p className="text-sm text-gray-500">Team ID: {team.id}</p>
                </Link>
                <Chat teamId={team.id} />
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeamCreated={fetchTeams}
      />
    </div>
  );
}

export default Dashboard;
