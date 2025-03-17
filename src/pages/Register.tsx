import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { signUp, signIn } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First sign up
      const { user } = await signUp(email, password);

      if (user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              username,
              email: user.email,
            },
          ]);

        if (profileError) throw profileError;

        // Then sign in
        const { user: signInUser } = await signIn(email, password);

        if (signInUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInUser.id)
            .single();

          setUser({
            id: signInUser.id,
            email: signInUser.email!,
            username: profile.username,
            avatar_url: profile.avatar_url,
          });

          toast.success('Welcome to Hostel Bazaar!');
          navigate('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserCreation = async () => {
    setLoading(true);
    try {
      // First sign up
      const { user } = await signUp('abhi@gmail.com', 'abhi123');

      if (user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              username: 'Abhinav',
              email: user.email,
            },
          ]);

        if (profileError) throw profileError;

        // Then sign in
        const { user: signInUser } = await signIn('abhi@gmail.com', 'abhi123');

        if (signInUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInUser.id)
            .single();

          setUser({
            id: signInUser.id,
            email: signInUser.email!,
            username: profile.username,
            avatar_url: profile.avatar_url,
          });

          toast.success('Test user created and logged in!');
          navigate('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleTestUserCreation}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Test User (Abhinav)
          </button>
        </div>
      </div>
    </div>
  );
}