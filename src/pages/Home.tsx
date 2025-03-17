import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  ShoppingBag,
  Briefcase,
  Store,
  Users,
  Star,
  TrendingUp,
  Shield,
  MessageCircle,
  Sparkles,
  Zap,
  GraduationCap,
  BookOpen,
  MapPin,
  Heart,
  Clock,
  BadgeCheck,
  Share2,
  Building2,
  Scale,
  Award,
  Check,
  Lock,
  BookMarked,
  Trophy,
  History,
  Laptop
} from 'lucide-react';
import ThreeDCampus from '../components/ThreeDCampus';
import { useAuthStore } from '../store/authStore';

const rotatingWords = [
  "Student Hub",
  "Community",
  "Marketplace",
  "Network"
];

const testimonials = [
  {
    name: "Alex Thompson",
    role: "Student",
    content: "HostelBazaar made it super easy to find and buy used textbooks. Saved me a ton of money!",
    image: "https://ui-avatars.com/api/?name=Alex+Thompson&background=random",
  },
  {
    name: "Sarah Chen",
    role: "Graduate Student",
    content: "I love how I can both buy and sell items. The community is really helpful and trustworthy.",
    image: "https://ui-avatars.com/api/?name=Sarah+Chen&background=random",
  },
  {
    name: "Mike Patel",
    role: "Student",
    content: "Found my dorm essentials at great prices. The request feature is genius!",
    image: "https://ui-avatars.com/api/?name=Mike+Patel&background=random",
  },
];

export default function Home() {
  const { user } = useAuthStore();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % rotatingWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderActionButtons = () => {
    if (!user) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 rounded-full bg-white text-indigo-600 
                font-medium hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 rounded-full bg-indigo-500 text-white 
                font-medium hover:bg-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 flex flex-wrap justify-center gap-4"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/trade"
            className="inline-flex items-center px-8 py-4 rounded-full bg-white text-indigo-600 
              font-medium hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Trading Hub
            <ShoppingBag className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/services"
            className="inline-flex items-center px-8 py-4 rounded-full bg-indigo-500 text-white 
              font-medium hover:bg-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Services Hub
            <Briefcase className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-600 via-indigo-700 to-purple-800 pt-24 pb-48">
        {/* Add ThreeDCampus */}
        <ThreeDCampus />
        
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 100%)',
              backgroundSize: '200% 200%'
            }}
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                <span className="block mb-4">Your Complete</span>
                <div className="h-[1.2em] overflow-hidden relative w-[400px] mx-auto">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={wordIndex}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -40 }}
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text whitespace-nowrap"
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-8 max-w-3xl mx-auto text-xl text-white/90 leading-relaxed"
            >
              Connect, trade, and thrive in your campus community. Access everything you need, from textbooks to services, all in one place.
            </motion.p>

            {/* Action Buttons */}
            {renderActionButtons()}

            {/* Trust Badges */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12 flex flex-wrap justify-center gap-6"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Student Verified</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">5000+ Active Users</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">4.8/5 Rating</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Enhanced curved bottom edge with gradient */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-24 bg-gradient-to-b from-transparent to-gray-50/20" />
          <div className="h-24 bg-gray-50" style={{
            clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 100%, 0 0)'
          }} />
        </div>
      </div>

      {/* Main Features Section with increased spacing */}
      <div className="relative -mt-20 mb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Trading Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              <Link
                to="/trade"
                className="block bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-200"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                      <ShoppingBag className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">Trading Hub</h3>
                  <p className="mt-2 text-gray-600">
                    Buy, sell, or exchange items with verified students
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <BookOpen className="w-3 h-3 mr-1" /> Textbooks
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Building2 className="w-3 h-3 mr-1" /> Dorm Items
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                      <Scale className="w-3 h-3 mr-1" /> Electronics
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            </motion.div>

            {/* Services Hub */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              <Link
                to="/services"
                className="block bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-200"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-emerald-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">Services Hub</h3>
                  <p className="mt-2 text-gray-600">
                    Connect with skilled students offering various services
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <GraduationCap className="w-3 h-3 mr-1" /> Tutoring
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      <Share2 className="w-3 h-3 mr-1" /> Skill Share
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                      <Award className="w-3 h-3 mr-1" /> Projects
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            </motion.div>

            {/* Merch Store */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              <Link
                to="/merch"
                className="block bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-200"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-rose-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">Merch Store</h3>
                  <p className="mt-2 text-gray-600">
                    Shop official college merchandise and branded items
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                      <Heart className="w-3 h-3 mr-1" /> New Arrivals
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                      <BadgeCheck className="w-3 h-3 mr-1" /> Official
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <Zap className="w-3 h-3 mr-1" /> Trending
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Categories Section - Update to include all types */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2"
            >
              <BookOpen className="h-8 w-8 text-indigo-600" />
              Popular Categories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              Discover what's trending across all categories
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              // Trading Categories
              {
                name: "Textbooks",
                icon: BookOpen,
                count: "500+",
                gradient: "from-blue-500 to-indigo-500",
                type: "trade"
              },
              {
                name: "Electronics",
                icon: Laptop,
                count: "300+",
                gradient: "from-purple-500 to-pink-500",
                type: "trade"
              },
              // Service Categories
              {
                name: "Tutoring",
                icon: GraduationCap,
                count: "200+",
                gradient: "from-emerald-500 to-teal-500",
                type: "service"
              },
              {
                name: "Skill Share",
                icon: Share2,
                count: "150+",
                gradient: "from-teal-500 to-cyan-500",
                type: "service"
              },
              // Merch Categories
              {
                name: "College Wear",
                icon: Trophy,
                count: "400+",
                gradient: "from-rose-500 to-pink-500",
                type: "merch"
              },
              {
                name: "Accessories",
                icon: BadgeCheck,
                count: "250+",
                gradient: "from-amber-500 to-orange-500",
                type: "merch"
              },
              {
                name: "Study Tools",
                icon: BookMarked,
                count: "350+",
                gradient: "from-violet-500 to-purple-500",
                type: "trade"
              },
              {
                name: "Lab Equipment",
                icon: Scale,
                count: "180+",
                gradient: "from-cyan-500 to-blue-500",
                type: "trade"
              }
            ].map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <Link
                  to={category.type === 'service' 
                    ? `/services?category=${encodeURIComponent(category.name.toLowerCase())}`
                    : `/${category.type}?category=${encodeURIComponent(category.name.toLowerCase())}`}
                  className="block"
                >
                  <div className="relative bg-white rounded-xl p-6 shadow-lg transition-all duration-300
                    group-hover:shadow-xl border border-gray-100"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient} mb-4`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count} items</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-8 w-8 text-indigo-600" />
              Smart Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              Powered by AI and built for the modern campus
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Recommendations",
                description: "Get personalized suggestions based on your interests and course",
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                icon: Shield,
                title: "Student Verification",
                description: "Trade safely with verified campus members",
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                icon: MapPin,
                title: "Safe Meetup Spots",
                description: "Designated safe spots around campus for exchanges",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: MessageCircle,
                title: "Real-time Chat",
                description: "Instant messaging with built-in translation",
                gradient: "from-amber-500 to-orange-500"
              },
              {
                icon: TrendingUp,
                title: "Price Analysis",
                description: "Track price trends and get the best deals",
                gradient: "from-rose-500 to-red-500"
              },
              {
                icon: Clock,
                title: "Smart Timing",
                description: "Best times to buy or sell based on demand",
                gradient: "from-violet-500 to-purple-500"
              },
              {
                icon: Users,
                title: "Study Groups",
                description: "Form groups for bulk trading and sharing",
                gradient: "from-cyan-500 to-blue-500"
              },
              {
                icon: BadgeCheck,
                title: "Trust Score",
                description: "Build reputation through successful trades",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': `var(--tw-${feature.gradient.split(' ')[0]})`,
                    '--tw-gradient-to': `var(--tw-${feature.gradient.split(' ')[2]})`
                  } as React.CSSProperties}
                />
                <div className="relative bg-white rounded-xl p-6 shadow-lg transition-all duration-300
                  group-hover:shadow-xl border border-gray-100"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Stats Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900"
            >
              Growing Campus Community
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              Join thousands of students making campus life better
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                value: "5,000+",
                label: "Active Students",
                icon: Users,
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                value: "₹50L+",
                label: "Items Traded",
                icon: TrendingUp,
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                value: "4.8/5",
                label: "User Rating",
                icon: Star,
                gradient: "from-amber-500 to-orange-500"
              },
              {
                value: "15+",
                label: "Categories",
                icon: BookOpen,
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': `var(--tw-${stat.gradient.split(' ')[0]})`,
                    '--tw-gradient-to': `var(--tw-${stat.gradient.split(' ')[2]})`
                  } as React.CSSProperties}
                />
                <div className="relative bg-white rounded-xl p-6 shadow-lg transition-all duration-300
                  group-hover:shadow-xl border border-gray-100"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} mb-4`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900"
            >
              Why Choose HostelBazaar?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              Your all-in-one platform for campus needs
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Student-First Approach",
                description: "Built specifically for college students, understanding your unique needs and challenges",
                icon: GraduationCap,
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                title: "Safe & Secure",
                description: "Verified student accounts, secure payments, and designated campus meetup spots",
                icon: Shield,
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                title: "Complete Ecosystem",
                description: "From trading and services to official merch - everything you need in one place",
                icon: Share2,
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': `var(--tw-${feature.gradient.split(' ')[0]})`,
                    '--tw-gradient-to': `var(--tw-${feature.gradient.split(' ')[2]})`
                  } as React.CSSProperties}
                />
                <div className="relative bg-white rounded-xl p-8 shadow-lg transition-all duration-300
                  group-hover:shadow-xl border border-gray-100 h-full"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 inline-block`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2"
            >
              <History className="h-8 w-8 text-indigo-600" />
              Recent Activity
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              See what's happening in your campus community
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                type: "trade",
                user: "Alex",
                action: "sold",
                item: "Physics Textbook",
                time: "2 hours ago",
                price: "₹800",
                icon: ShoppingBag,
                gradient: "from-blue-500 to-indigo-500"
              },
              {
                type: "service",
                user: "Sarah",
                action: "offered",
                item: "Python Tutoring",
                time: "3 hours ago",
                price: "₹500/hr",
                icon: GraduationCap,
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                type: "trade",
                user: "Mike",
                action: "listed",
                item: "Scientific Calculator",
                time: "4 hours ago",
                price: "₹1200",
                icon: Scale,
                gradient: "from-purple-500 to-pink-500"
              },
              {
                type: "service",
                user: "Emma",
                action: "completed",
                item: "Essay Review",
                time: "5 hours ago",
                price: "₹300",
                icon: BookOpen,
                gradient: "from-amber-500 to-orange-500"
              }
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="relative bg-white rounded-xl p-6 shadow-lg transition-all duration-300
                  group-hover:shadow-xl border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${activity.gradient}`}>
                      <activity.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activity.user} {activity.action} {activity.item}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600">{activity.time}</p>
                        <p className="text-sm font-medium text-indigo-600">{activity.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                to="/browse"
                className="inline-flex items-center px-6 py-3 rounded-full bg-indigo-600 text-white 
                  font-medium hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View All Activity
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Student Success Stories */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2"
            >
              <Star className="h-8 w-8 text-amber-500" />
              Student Success Stories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              See how students are benefiting from our platform
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="relative bg-white rounded-xl p-8 shadow-lg transition-all duration-300
                  group-hover:shadow-xl border border-gray-100"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{story.name}</h3>
                      <p className="text-sm text-gray-600">{story.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">{story.content}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus Safety Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2"
            >
              <Shield className="h-8 w-8 text-emerald-500" />
              Safe Campus Trading
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-xl text-gray-600"
            >
              Your safety is our top priority
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Students",
                description: "Trade only with verified campus members",
                icon: BadgeCheck,
                gradient: "from-emerald-500 to-teal-500",
                features: [
                  "Student email verification",
                  "Profile verification",
                  "Trust score system"
                ]
              },
              {
                title: "Safe Meetup Spots",
                description: "Designated safe spots around campus",
                icon: MapPin,
                gradient: "from-blue-500 to-indigo-500",
                features: [
                  "Library entrance",
                  "Student center",
                  "Department offices"
                ]
              },
              {
                title: "Secure Platform",
                description: "Built with security in mind",
                icon: Lock,
                gradient: "from-purple-500 to-pink-500",
                features: [
                  "Secure messaging",
                  "Report system",
                  "24/7 support"
                ]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="relative bg-white rounded-xl p-8 shadow-lg transition-all duration-300
                  group-hover:shadow-xl border border-gray-100 h-full"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 inline-block`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <Check className="h-5 w-5 text-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 opacity-90" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to Join Your Campus Community?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 mb-12 max-w-2xl mx-auto"
          >
            Start trading, accessing services, and connecting with fellow students today
          </motion.p>

          {/* Main Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          >
            {/* Trading Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mb-4">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Trading Hub</h3>
              <p className="text-white/80 mb-4">Buy, sell, or exchange items with verified students</p>
              <Link
                to="/trade"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-indigo-600 
                  font-medium hover:bg-opacity-90 transition-all duration-200"
              >
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>

            {/* Services Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mb-4">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Services Hub</h3>
              <p className="text-white/80 mb-4">Connect with skilled students offering various services</p>
              <Link
                to="/services"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-emerald-600 
                  font-medium hover:bg-opacity-90 transition-all duration-200"
              >
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>

            {/* Merch Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl mb-4">
                <Store className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Merch Store</h3>
              <p className="text-white/80 mb-4">Shop official college merchandise and branded items</p>
              <Link
                to="/merch"
                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-rose-600 
                  font-medium hover:bg-opacity-90 transition-all duration-200"
              >
                Visit Store
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Sign Up Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white 
                  font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-5 w-5" />
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-5 w-5" />
              <span>Student Community</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <MessageCircle className="h-5 w-5" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}