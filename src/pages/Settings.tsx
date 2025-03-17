import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  CreditCard,
  Brain,
  Mail
} from 'lucide-react';
import AIPreferences from '../components/services/AIPreferences';

export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <SettingsIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <nav className="space-y-2">
                {[
                  { icon: User, label: 'Profile', href: '#profile' },
                  { icon: Bell, label: 'Notifications', href: '#notifications' },
                  { icon: Brain, label: 'AI Preferences', href: '#ai-preferences' },
                  { icon: Shield, label: 'Privacy & Security', href: '#privacy' },
                  { icon: CreditCard, label: 'Billing', href: '#billing' },
                  { icon: Mail, label: 'Communication', href: '#communication' },
                ].map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50
                      hover:text-gray-900 transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </motion.a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            {/* Profile Section */}
            <section id="profile" className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
              {/* Add profile settings content */}
            </section>

            {/* Notifications Section */}
            <section id="notifications" className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              {/* Add notification settings content */}
            </section>

            {/* AI Preferences Section */}
            <section id="ai-preferences">
              <AIPreferences />
            </section>

            {/* Privacy Section */}
            <section id="privacy" className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Security</h2>
              {/* Add privacy settings content */}
            </section>

            {/* Billing Section */}
            <section id="billing" className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Settings</h2>
              {/* Add billing settings content */}
            </section>

            {/* Communication Section */}
            <section id="communication" className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Communication Preferences</h2>
              {/* Add communication settings content */}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 