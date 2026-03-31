import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Upload, BarChart3, Users, Calculator, Shield, Zap, CheckCircle, ArrowRight, Star, TrendingUp } from 'lucide-react';
import EnhancedCard from './EnhancedCard';
import AnimatedCounter from './AnimatedCounter';
import EnhancedPrice from './EnhancedPrice';
import logoImage from '/logo.jpg';

// Lazy load 3D component for performance
const Hero3DBackground = lazy(() => import('./Hero3DBackground'));

const EnhancedModernLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Disable 3D on mobile for performance
    const isMobile = window.innerWidth < 768;
    setShow3D(!isMobile);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden font-['Inter']">
      {/* Animated Background Blobs - Enhanced */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-yellow-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-yellow-500/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-blue-800/20 to-yellow-600/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navbar - Enhanced with backdrop blur */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <motion.img 
                whileHover={{ rotate: 5 }}
                src={logoImage} 
                alt="Dire Dawa Customs" 
                className="w-12 h-12 rounded-xl shadow-lg" 
              />
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                  Dire Dawa Customs Commission
                </span>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-800 transition font-medium">Features</a>
              <a href="#stats" className="text-gray-700 hover:text-blue-800 transition font-medium">Stats</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-800 transition font-medium">Contact</a>
            </div>

            <div className="flex items-center space-x-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="text-gray-700 hover:text-blue-800 transition font-semibold"
              >
                Login
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(30, 64, 175, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="bg-gradient-to-r from-blue-800 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Get Started
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section - Enhanced with 3D Background */}
      <section className="relative pt-32 pb-20 px-6">
        {show3D && (
          <Suspense fallback={null}>
            <Hero3DBackground>
              <div className="container mx-auto">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="max-w-5xl mx-auto text-center"
                >
                  <motion.div variants={fadeInUp} className="inline-block mb-6">
                    <span className="px-4 py-2 bg-yellow-100/80 backdrop-blur-sm text-blue-800 rounded-full text-sm font-semibold border border-yellow-200/50">
                      🚀 Modern Tender Management
                    </span>
                  </motion.div>

                  <motion.h1
                    variants={fadeInUp}
                    className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight mb-6"
                  >
                    Smart Tender
                    <br />
                    <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-yellow-500 bg-clip-text text-transparent">
                      Management System
                    </span>
                  </motion.h1>

                  <motion.p
                    variants={fadeInUp}
                    className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto"
                  >
                    Streamline your procurement process with automation, intelligence, and transparency. 
                    Manage tenders, bidders, and winners in one powerful platform.
                  </motion.p>

                  <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <motion.a
                      whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(30, 64, 175, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      href="/login"
                      className="group bg-gradient-to-r from-blue-800 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-800/50 transition-all flex items-center justify-center gap-2"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="#features"
                      className="bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all border border-gray-200/50"
                    >
                      Learn More
                    </motion.a>
                  </motion.div>

                  {/* Hero Image/Mockup */}
                  <motion.div
                    variants={fadeInUp}
                    className="mt-16 relative"
                  >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/50 backdrop-blur-sm p-2">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                        <motion.img 
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{ duration: 5, repeat: Infinity }}
                          src={logoImage} 
                          alt="Logo" 
                          className="w-32 h-32 object-contain" 
                        />
                      </div>
                    </div>
                    {/* Floating Elements - Enhanced */}
                    <motion.div
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute -top-10 -left-10 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center"
                        >
                          <CheckCircle className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Winner Selected</p>
                          <p className="text-xs text-gray-500">Automated Process</p>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="absolute -bottom-10 -right-10 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center"
                        >
                          <TrendingUp className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <EnhancedPrice isHighlighted>
                            <p className="text-sm font-semibold text-gray-900">$2.5M Total Value</p>
                          </EnhancedPrice>
                          <p className="text-xs text-gray-500">Active Tenders</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </Hero3DBackground>
          </Suspense>
        )}

        {/* Fallback for mobile or when 3D is disabled */}
        {!show3D && (
          <div className="container mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-5xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp} className="inline-block mb-6">
                <span className="px-4 py-2 bg-yellow-100/80 backdrop-blur-sm text-blue-800 rounded-full text-sm font-semibold border border-yellow-200/50">
                  🚀 Modern Tender Management
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight mb-6"
              >
                Smart Tender
                <br />
                <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-yellow-500 bg-clip-text text-transparent">
                  Management System
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-600 leading-relaxed mb-10 max-w-3xl mx-auto"
              >
                Streamline your procurement process with automation, intelligence, and transparency. 
                Manage tenders, bidders, and winners in one powerful platform.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.a
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(30, 64, 175, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  href="/login"
                  className="group bg-gradient-to-r from-blue-800 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-800/50 transition-all flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#features"
                  className="bg-white/80 backdrop-blur-sm text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all border border-gray-200/50"
                >
                  Learn More
                </motion.a>
              </motion.div>

              {/* Hero Image/Mockup */}
              <motion.div
                variants={fadeInUp}
                className="mt-16 relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/50 backdrop-blur-sm p-2">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                    <img src={logoImage} alt="Logo" className="w-32 h-32 object-contain" />
                  </div>
                </div>
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-10 -left-10 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Winner Selected</p>
                      <p className="text-xs text-gray-500">Automated Process</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-10 -right-10 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">$2.5M Total Value</p>
                      <p className="text-xs text-gray-500">Active Tenders</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Stats Section - Enhanced with Animated Counters and 3D Cards */}
      <section id="stats" className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { number: '500+', label: 'Active Tenders', icon: BarChart3 },
              { number: '1,200+', label: 'Registered Bidders', icon: Users },
              { number: '98%', label: 'Success Rate', icon: CheckCircle },
              { number: '$50M+', label: 'Total Value', icon: TrendingUp }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <EnhancedCard>
                  <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 text-center group hover:shadow-2xl transition-all">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      <AnimatedCounter value={stat.number} suffix={stat.number.includes('+') ? '+' : stat.number.includes('%') ? '%' : stat.number.includes('M') ? 'M+' : ''} />
                    </h3>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}</motion.div>
        </div>
      </section>

      {/* Features Section - Enhanced with 3D Cards */}
      <section id="features" className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-5xl font-bold text-gray-900 mb-4"
            >
              Powerful Features
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Everything you need to manage tenders efficiently
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: BarChart3,
                title: 'Tender Management',
                description: 'Create, track, and manage all tenders with an intuitive interface',
                gradient: 'from-blue-500 to-indigo-500'
              },
              {
                icon: Users,
                title: 'Bidder Management',
                description: 'Register bidders and manage their information seamlessly',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Calculator,
                title: 'Auto Winner Selection',
                description: 'Automatic selection of highest bidder with zero errors',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Upload,
                title: 'Excel Integration',
                description: 'Upload and export data with full Excel compatibility',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                description: 'Bank-level security with complete audit trails',
                gradient: 'from-cyan-500 to-blue-500'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Process tenders in minutes, not hours',
                gradient: 'from-yellow-500 to-orange-500'
              }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeInUp}>
                <EnhancedCard>
                  <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 hover:shadow-2xl transition-all overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Section - Enhanced */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <EnhancedCard>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[3rem] p-12 md:p-16 shadow-2xl relative overflow-hidden">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 10, repeat: Infinity, delay: 2 }}
                  className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                />

                <div className="relative z-10 text-center text-white">
                  <motion.div variants={fadeInUp} className="flex justify-center gap-2 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, type: 'spring' }}
                      >
                        <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
                    Trusted by Leading Organizations
                  </motion.h2>
                  <motion.p variants={fadeInUp} className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join hundreds of organizations streamlining their procurement process with our platform
                  </motion.p>
                  <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="/login"
                      className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
                    >
                      Start Free Trial
                    </motion.a>
                  </motion.div>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>
        </div>
      </section>

      {/* Footer - Original Preserved */}
      <footer id="contact" className="py-12 px-6 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={logoImage} alt="Logo" className="w-10 h-10 rounded-xl" />
                <span className="text-xl font-bold text-gray-900">Dire Dawa Customs Commission</span>
              </div>
              <p className="text-gray-600">
                Modern tender management for customs procurement
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 hover:text-blue-600 transition">Features</a></li>
                <li><a href="#stats" className="text-gray-600 hover:text-blue-600 transition">Stats</a></li>
                <li><a href="/login" className="text-gray-600 hover:text-blue-600 transition">Login</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Dire Dawa, Ethiopia</li>
                <li>info@tendersys.com</li>
                <li>+251 11 123 4567</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2025 DireDawa Customs Commission. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedModernLanding;
