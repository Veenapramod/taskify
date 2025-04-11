import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Layout from './Layout';
import AdminPanel from '../components/AdminPanel';

function TeamPage() {
  const { id } = useParams(); // team ID from URL
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch team info
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

      setTeam(teamData);

      // Fetch team members and role
      const { data: memberData } = await supabase
        .from('team_members')
        .select('user_id, role')
        .eq('team_id', id);

      setMembers(memberData || []);

      const currentUser = memberData?.find(m => m.user_id === user.id);
      setUserRole(currentUser?.role || null);

      if (!currentUser) {
        navigate('/dashboard'); // if user isn't in the team
      }
    };

    fetchData();
  }, [id, navigate]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600">
          {team?.name || 'Loading...'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Team ID: {id}
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Link to={`/team/${id}/tasks`} className="text-blue-500 hover:underline">Tasks</Link>
        <Link to={`/team/${id}/chat`} className="text-blue-500 hover:underline">Chat</Link>
        {userRole === 'admin' && (
          <Link to={`/team/${id}/settings`} className="text-blue-500 hover:underline">Admin Settings</Link>
        )}
      </div>
      <AdminPanel teamId={id} />

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Team Members</h2>
        {members.length === 0 ? (
          <p className="text-gray-500">No members found.</p>
        ) : (
          <ul className="list-disc pl-5 text-gray-700">
            {members.map((m, idx) => (
              <li key={idx}>{m.user_id} — <span className="text-sm italic">{m.role}</span></li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}

export default TeamPage;
