import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Chat({ teamId }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Failed to get user:', error.message);
      }
      setUser(user);
    };

    getUser();
  }, []);

  // Fetch all messages for the current team
  const fetchMessages = async () => {
    const { data, error } = await supabase
  .from('messages')
  .select('*, user: user_id (email)')

  .eq('team_id', teamId)
  .order('created_at', { ascending: true });


    if (error) {
      console.error('Fetch messages error:', error.message);
    } else {
      setMessages(data);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Setup real-time subscription
    const channel = supabase
      .channel(`team-messages-${teamId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `team_id=eq.${teamId}`,
      }, (payload) => {
        fetchMessages(); // 👈 ensures we get user.full_name too
      })
      
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  // Handle sending message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;
    if (!user) return alert('User not loaded');

    const { error } = await supabase.from('messages').insert([
      {
        content: message,
        team_id: teamId,
        user_id: user.id,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error.message);
      alert('Message failed: ' + error.message);
    } else {
      setMessage('');
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-xl bg-white shadow">
      <h2 className="font-semibold mb-2">💬 Team Chat</h2>

      <div className="overflow-y-auto h-64 mb-2 bg-gray-50 p-3 rounded text-sm">
  {messages.map((msg) => (
    <div key={msg.id} className="mb-2">
      <strong>{msg.user?.full_name || msg.user?.email || 'User'}:</strong> {msg.content}
    </div>
  ))}
</div>


      <form onSubmit={handleSend} className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-2 border rounded-l-xl"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-xl hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
