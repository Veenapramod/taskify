import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'sent' | 'error'

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('loading');

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('sent');

      // Wait a few seconds before attempting to insert (client won't be logged in yet)
      setTimeout(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Insert or update full name in the users table
          await supabase.from('users').upsert({
            id: user.id,
            full_name: fullName,
          });
        }
      }, 5000); // Wait for magic link login to complete (you can adjust this)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow max-w-sm w-full space-y-4">
        <h2 className="text-xl font-bold text-center">Sign In to Taskify</h2>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your Full Name"
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
        </button>

        {status === 'sent' && (
          <p className="text-green-600 text-sm text-center">Magic link sent. Check your email!</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-sm text-center">Something went wrong. Try again.</p>
        )}
      </form>
    </div>
  );
}

export default Login;
