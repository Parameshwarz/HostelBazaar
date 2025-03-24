import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { createSampleNotification } from '../services/notificationService';
import { Bell, Moon, Sun, Volume2, VolumeX, Shield, User, Key } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        {/* Account Settings */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account preferences
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Profile Information</p>
                  <p className="text-xs text-gray-500">Update your profile details</p>
                </div>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Edit
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Key className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Password</p>
                  <p className="text-xs text-gray-500">Change your password</p>
                </div>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Change
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Privacy</p>
                  <p className="text-xs text-gray-500">Manage your privacy settings</p>
                </div>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Manage
              </button>
            </div>
          </div>
        </div>
        
        {/* Preferences */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mt-6">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
            <p className="text-sm text-gray-500 mt-1">
              Customize your experience
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-500">Toggle dark theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">Enable or disable notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sound</p>
                  <p className="text-xs text-gray-500">Enable or disable sound effects</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={soundEnabled}
                  onChange={() => setSoundEnabled(!soundEnabled)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Developer Tools Section (Only visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden mt-6">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Developer Tools</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tools to help with development and testing
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <button
                  onClick={async () => {
                    if (user) {
                      // Create sample notification
                      const result = await createSampleNotification(user.id);
                      if (result.success) {
                        toast.success("Sample notification created");
                      }
                    } else {
                      toast.error("You must be logged in");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Sample Notification
                </button>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Database Migrations</p>
                <div className="space-y-2">
                  <button
                    onClick={async () => {
                      try {
                        // Read SQL migration file
                        const response = await fetch('/migrations/create_notifications_table.sql');
                        if (!response.ok) {
                          throw new Error('Failed to load migration file');
                        }
                        
                        const sqlContent = await response.text();
                        
                        // Execute SQL as Supabase admin
                        const { error } = await supabase.rpc('run_migration', {
                          sql_content: sqlContent
                        });
                        
                        if (error) throw error;
                        toast.success('Notification system setup complete!');
                      } catch (err: any) {
                        console.error('Migration error:', err);
                        toast.error(`Migration failed: ${err.message}`);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Setup Notification System
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 