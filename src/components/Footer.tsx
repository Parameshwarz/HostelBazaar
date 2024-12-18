import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Send,
  Home,
  Tags,
  FileText,
  Shield,
  Lock,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-2xl font-bold text-white">HostelBazaar</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              HostelBazaar is your trusted platform for buying, selling, and exchanging essentials within your hostel community. From books to furniture, we connect students to make campus life easier.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { icon: Home, text: 'Home', to: '/' },
                { icon: Tags, text: 'Browse Categories', to: '/categories' },
                { icon: FileText, text: 'Post Your Ad', to: '/items/new' },
                { icon: Shield, text: 'Terms & Conditions', to: '/terms' },
                { icon: Lock, text: 'Privacy Policy', to: '/privacy' },
                { icon: HelpCircle, text: 'Contact Support', to: '/support' },
                { icon: Briefcase, text: 'Careers', to: '/careers' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 mr-3 text-indigo-500" />
                <a href="mailto:support@hostelbazaar.com" className="hover:text-indigo-400 transition-colors">
                  support@hostelbazaar.com
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 mr-3 text-indigo-500" />
                <span>+91 123 456 7890</span>
              </li>
              <li className="flex items-start text-gray-400">
                <MapPin className="h-5 w-5 mr-3 text-indigo-500 mt-1" />
                <span>123 Hostel Avenue,<br />Bengaluru, India</span>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Stay Connected</h3>
            <div className="flex space-x-4 mb-6">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="bg-gray-800 p-2 rounded-full hover:bg-indigo-500 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-gray-400 mb-4">
              Coming soon to Android and iOS! Be the first to download our app.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} HostelBazaar. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 