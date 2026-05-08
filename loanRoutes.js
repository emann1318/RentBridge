import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const features = [
    { 
      icon: <Shield className="text-blue-600" />, 
      title: "Secure Finance", 
      description: "Low-interest loans for your security deposits, verified for your peace of mind." 
    },
    { 
      icon: <Zap className="text-yellow-600" />, 
      title: "Instant Verification", 
      description: "Get approved in minutes based on your employment details and salary slip." 
    },
    { 
      icon: <TrendingUp className="text-green-600" />, 
      title: "Flexible Repayment", 
      description: "Amortize your lump sum deposit over your 11-month lease term easily." 
    }
  ];

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-100 uppercase tracking-widest mb-8">
            NBFC Licensed Platform
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto">
            Bridge the Gap to Your <span className="text-blue-600">Dream Home.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Finance your "3 months advance + 1 month security" deposit in Karachi, Lahore, or Islamabad. Amortized over your lease term.
          </p>
          <Link 
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg text-lg font-bold hover:bg-slate-800 transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            Start Application <ArrowRight size={20} />
          </Link>
        </motion.div>

        <div className="mt-32 grid md:grid-cols-3 gap-8 text-left">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i, duration: 0.6 }}
              className="card-high-density p-8 group hover:border-slate-300 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-6 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white py-32 mt-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <h2 className="text-4xl font-bold mb-6 tracking-tight text-slate-900">Partnered with Karachi's finest real estate agents.</h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              We work directly with Zameen.com agents to simplify your moving process. No more lump sum burdens, just smooth urban mobility.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">12.5%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Fixed Markup</div>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold text-slate-900">Karachi</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Core Market</div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
             <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
               Verified Partner Network
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
