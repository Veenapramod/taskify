import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TaskModal({ isOpen, onClose, teamId, onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      const userIds = data?.map((m) => m.user_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      setMembers(users || []);
    };

    if (isOpen) fetchMembers();
  }, [isOpen, teamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { data: { user } } = await supabase.auth.getUser();
  
    const { error } = await supabase.from('tasks').insert([
      {
        team_id: teamId,
        title,
        description,
        priority,
        assigned_to: assignee || null,
        assigned_by: user.id,        // ✅ This is the fix
        status: 'pending',
      },
    ]);
  
    if (error) {
      console.error('Task creation error:', error.message);
      alert('Error creating task: ' + error.message);
    } else {
      onTaskCreated(); // refresh board
      onClose();       // close modal
    }
  };
  
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">📝 Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border px-4 py-2 rounded-xl"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full border px-4 py-2 rounded-xl"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="w-full border px-4 py-2 rounded-xl"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
          <select
  className="w-full border px-4 py-2 rounded-xl"
  value={assignee}
  onChange={(e) => setAssignee(e.target.value)}
  required
>
  <option value="">Assign to...</option>
  {members.map((m) => (
    <option key={m.id} value={m.id}>
      {m.full_name}
    </option>
  ))}
</select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-black rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
