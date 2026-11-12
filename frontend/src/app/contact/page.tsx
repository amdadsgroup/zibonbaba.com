'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    // Simulate support ticket intake
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Contact Us</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">24/7 Assistance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact Zibonbaba Support
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Our dedicated team is here to assist customers, merchants, resellers, and delivery partners.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Details Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-sm text-slate-700">
            <h2 className="text-base font-bold text-slate-900">Corporate Headquarters</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Head Office</strong>
                  <span className="text-slate-500">Gulshan 2, Road 45, Dhaka 1212, Bangladesh</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Helpline Number</strong>
                  <span className="text-slate-500">+880 9612-ZIBONBABA</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Direct Email</strong>
                  <span className="text-slate-500">support@zibonbaba.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Operating Hours</strong>
                  <span className="text-slate-500">9:00 AM – 9:00 PM (7 Days a Week)</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Specialized Desks:</span>
              <p className="text-slate-500"><strong className="text-slate-700">Merchant Help:</strong> seller@zibonbaba.com</p>
              <p className="text-slate-500"><strong className="text-slate-700">Courier Fleet:</strong> delivery@zibonbaba.com</p>
              <p className="text-slate-500"><strong className="text-slate-700">Wholesale / Reseller:</strong> reseller@zibonbaba.com</p>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message Dispatched!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out. Our support operations team will review your inquiry and get back to you within 4 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">Send an Inquiry</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. tanvir@example.com"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Topic / Inquiry Type</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none bg-white"
                  >
                    <option>General Support / Customer Service</option>
                    <option>Order Tracking / Delivery Delay</option>
                    <option>Return / Refund Request</option>
                    <option>Merchant / Seller Onboarding</option>
                    <option>Reseller Inquiry</option>
                    <option>Delivery Fleet Application</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your query or order number..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-amber-400 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
