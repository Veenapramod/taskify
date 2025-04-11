import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Layout from './Layout';
import TaskModal from '../components/TaskModal';

function TaskBoard() {
  const { id: teamId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statuses = ['pending', 'in progress', 'done'];

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: roleData } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    setUserRole(roleData?.role);

    const { data: taskData } = await supabase
  .from('tasks')
  .select(`
    *,
    assigned_to ( full_name )
  `)
  .eq('team_id', teamId);

    setTasks(taskData || []);
  };

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const handleStatusChange = async (taskId, newStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    }
  };

  const renderPriorityTag = (priority) => {
    const base = "inline-block text-xs font-semibold px-2 py-1 rounded-full";
    switch (priority) {
      case 'high':
        return <span className={`${base} bg-red-100 text-red-600`}>High</span>;
      case 'medium':
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>Medium</span>;
      case 'low':
        return <span className={`${base} bg-green-100 text-green-700`}>Low</span>;
      default:
        return null;
    }
  };

  const renderTasks = (status) =>
    tasks
      .filter((t) => t.status === status)
      .map((task) => (
        <div
          key={task.id}
          className="bg-white p-4 rounded-xl shadow hover:shadow-md mb-4"
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-800">{task.title}</h3>
            {renderPriorityTag(task.priority)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          <p className="text-xs text-gray-400">
  Assigned to: {task.assigned_to?.full_name || 'Unassigned'}
</p>


          {userRole !== 'viewer' && (
            <div className="mt-3 flex gap-2 text-sm">
              {statuses.map((s) =>
                s !== task.status ? (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(task.id, s)}
                    className="text-blue-600 hover:underline"
                  >
                    Move to {s}
                  </button>
                ) : null
              )}
            </div>
          )}
        </div>
      ));

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🗂️ Task Board</h1>
        {userRole !== 'viewer' && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            onClick={() => setShowModal(true)}
          >
            + New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statuses.map((status) => (
          <div key={status} className="bg-gray-100 p-4 rounded-xl">
            <h2 className="text-lg font-semibold capitalize mb-4">{status}</h2>
            {renderTasks(status)}
          </div>
        ))}
      </div>

      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        teamId={teamId}
        onTaskCreated={fetchData}
      />
    </Layout>
  );
}

export default TaskBoard;
