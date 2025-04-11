import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function JoinTeam() {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setStatus('');
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User:', user);
      if (!user) return setStatus('Please sign in first.');
  
      const { data: invites, error: inviteError } = await supabase
        .from('pending_invites')
        .select('*')
        .eq('email', email.toLowerCase());
  
      if (inviteError) throw inviteError;
  
      const invite = invites?.[0];
      console.log('Invite:', invite);
      if (!invite) return setStatus('No invite found for this email.');
  
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', invite.team_id)
        .single();
  
      if (teamError) throw teamError;
      console.log('Team:', team);
  
      if (team.passcode !== passcode) {
        return setStatus('Incorrect team passcode.');
      }
  
      const { error: addError } = await supabase.from('team_members').insert([
        {
          team_id: invite.team_id,
          user_id: user.id,
          role: invite.role,
        },
      ]);
  
      if (addError) throw addError;
      console.log('Member inserted!');
  
      await supabase
        .from('pending_invites')
        .delete()
        .eq('id', invite.id);
  
      setStatus('Successfully joined! Redirecting...');
      setTimeout(() => {
        navigate(`/team/${invite.team_id}`);
      }, 1500);
    } catch (err) {
      console.error('Join error (RAW):', err);
      try {
        const readableError = JSON.stringify(err, null, 2);
        setStatus(readableError);
      } catch (jsonErr) {
        setStatus(String(err));
      }
    }
  };
  
}
