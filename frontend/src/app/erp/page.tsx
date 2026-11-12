'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  Building,
  Users,
  TrendingUp,
  AlertTriangle,
  Send,
  Plus,
  DollarSign,
  Briefcase,
  CheckCircle,
  Truck,
  Sparkles,
  Bot
} from 'lucide-react';

export default function ErpDashboardPage() {
  const {
    products,
    crmCustomers,
    addCustomer,
    warehouses,
    branches,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'crm' | 'suppliers' | 'expenses' | 'ai'>('inventory');

  // CRM input states
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');

  // Expense States
  const [expenses, setExpenses] = useState([
    { id: 'exp-1', desc: 'AWS S3 Cloudinary Storage hosting', category: 'Infrastructure', amount: 350.00, date: '2026-07-10' },
    { id: 'exp-2', desc: 'Gulshan Outlet Office rent', category: 'Operations', amount: 1200.00, date: '2026-07-01' },
    { id: 'exp-3', desc: 'POS thermal receipt rolls purchase', category: 'Supplies', amount: 85.00, date: '2026-07-12' }
  ]);
  const [expDesc, setExpDesc] = useState('');
  const [expCat, setExpCat] = useState('Infrastructure');
  const [expAmt, setExpAmt] = useState('');

  // AI Chat Assistant States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Hello! I am your Zibonbaba AI Business Assistant. Ask me about stock forecasts, fraud indicators, or revenue velocities.' }
  ]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) return;
    addCustomer({
      id: 'cust-' + (crmCustomers.length + 1),
      name: custName,
      email: custEmail,
      phone: custPhone || '+880170000000',
      ordersCount: 0,
      totalSpent: 0.00,
      status: 'New',
    });
    setCustName('');
    setCustEmail('');
    setCustPhone('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expAmt) return;
    const newExp = {
      id: 'exp-' + Math.random().toString(36).substr(2, 9),
      desc: expDesc,
      category: expCat,
      amount: parseFloat(expAmt),
      date: new Date().toISOString().split('T')[0],
    };
    setExpenses([newExp, ...expenses]);
    setExpDesc('');
    setExpAmt('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    const userMsg = chatInput;
    const history = [...chatHistory, { sender: 'user' as const, text: userMsg }];
    setChatHistory(history);
    setChatInput('');

    // Simulated smart AI assistant answers based on keywords
    setTimeout(() => {
      let botResponse = 'I am scanning the Postgres database schema and Prisma models. Could you rephrase your business request?';
      const lowercaseMsg = userMsg.toLowerCase();

      if (lowercaseMsg.includes('forecast') || lowercaseMsg.includes('sales')) {
        botResponse = 'AI FORECAST ENGINE: Based on the past 90 days of e-commerce data and POS logs, sales for the "SoundMax Wireless Headphones Pro" are projected to increase by 14.5% next month. Reorder point suggested at 15 units.';
      } else if (lowercaseMsg.includes('fraud') || lowercaseMsg.includes('security')) {
        botResponse = 'AI SECURITY ANALYTICS: No severe card trials or high-frequency automated checkout anomalies detected in the last 24 hours. Express rate limits are successfully filtering spam vectors.';
      } else if (lowercaseMsg.includes('stock') || lowercaseMsg.includes('inventory') || lowercaseMsg.includes('warehouse')) {
        const lowStockCount = products.filter(p => p.stock <= 10).length;
        botResponse = `AI INVENTORY AUDIT: Central Warehouse is running at 85% capacity. We have ${lowStockCount} items currently below their reorder threshold. I recommend scheduling a restock order with Supplier FashionBox.`;
      } else if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi')) {
        botResponse = 'Hi there! I am ready to evaluate branch metrics, supplier logs, or issue stock recommendation tables. What business unit should we look at?';
      }

      setChatHistory([...history, { sender: 'bot' as const, text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-light pb-6">
        <h1 className="text-3xl font-extrabold text-neutral-dark">SaaS ERP Business Hub</h1>
        <p className="text-xs text-neutral-muted mt-1">
          Manage inventory warehouses, client CRM lists, supplier pipelines, expenses, and AI recommendations.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-neutral-light gap-4 overflow-x-auto pb-1.5">
        {[
          { id: 'inventory', label: 'Inventory & Warehousing', icon: Building },
          { id: 'crm', label: 'CRM & Client Records', icon: Users },
          { id: 'suppliers', label: 'Suppliers & Procurement', icon: Truck },
          { id: 'expenses', label: 'Expense Tracking', icon: DollarSign },
          { id: 'ai', label: 'AI Analytics Assistant', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 text-xs font-bold py-2.5 px-4 border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-primary text-neutral-dark font-extrabold'
                  : 'border-transparent text-neutral-muted hover:text-neutral-dark'
              }`}
            >
              <Icon className="w-4 h-4 text-primary-accent" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Workspaces */}

      {/* 1. INVENTORY & WAREHOUSE */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Warehouses list */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-4 lg:col-span-1 h-fit">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2">
              Warehouse Capacities
            </h2>
            <div className="space-y-4">
              {warehouses.map((wh) => (
                <div key={wh.id} className="p-3 bg-neutral-light/50 border border-neutral-light rounded">
                  <h4 className="text-xs font-bold text-neutral-dark">{wh.name}</h4>
                  <p className="text-[10px] text-neutral-muted">{wh.location}</p>
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-neutral-body">Filled capacity:</span>
                    <span className="font-extrabold text-neutral-dark">{wh.capacities}</span>
                  </div>
                  <div className="w-full bg-neutral-light h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${parseInt(wh.capacities) > 80 ? 'bg-error' : 'bg-success'}`}
                      style={{ width: wh.capacities }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch list */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card lg:col-span-2 space-y-4">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2">
              Multi-Branch Terminals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {branches.map((b) => (
                <div key={b.id} className="p-4 bg-neutral-light/50 border border-neutral-light rounded-md">
                  <h3 className="text-xs font-bold text-neutral-dark">{b.name}</h3>
                  <p className="text-[10px] text-neutral-muted">{b.city} Outlet</p>
                  <div className="mt-3 flex items-center justify-between text-xs border-t border-neutral-light/50 pt-2 font-semibold">
                    <span>Active Cashiers:</span>
                    <span className="bg-success/20 text-success text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {b.activeTerminals} online
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Low stock alerts */}
            <div className="border border-error/30 bg-error/5 p-4 rounded-md space-y-2 mt-4">
              <h4 className="text-xs font-bold text-error flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Critical Low Stock Alerts
              </h4>
              <p className="text-[10px] text-neutral-muted">Below products require restocking to prevent shop order declines.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                {products.filter(p => p.stock <= 10).map(p => (
                  <div key={p.id} className="p-2 bg-white rounded border border-neutral-light flex justify-between">
                    <span className="font-semibold text-neutral-dark">{p.name}</span>
                    <span className="text-error font-bold">Only {p.stock} units!</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CRM CLIENT RECORDS */}
      {activeTab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Add customer */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card h-fit space-y-4">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary-accent" />
              Profile New CRM Client
            </h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Rahman"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+880 1700-000000"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-2 rounded transition-colors"
              >
                Register Customer Profile
              </button>
            </form>
          </div>

          {/* Customer list */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card lg:col-span-2">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2 mb-4">
              CRM Customer Segments
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-light bg-neutral-light/50 text-neutral-muted font-bold">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3 text-center">Orders</th>
                    <th className="py-2 px-3 text-right">Total Spent</th>
                    <th className="py-2 px-3 text-center">Status Segment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {crmCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-light/10">
                      <td className="py-2.5 px-3 font-semibold text-neutral-dark">{c.name}</td>
                      <td className="py-2.5 px-3">{c.email}</td>
                      <td className="py-2.5 px-3 font-mono">{c.phone}</td>
                      <td className="py-2.5 px-3 text-center font-bold">{c.ordersCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳{c.totalSpent.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.status === 'VIP' ? 'bg-success/15 text-success border border-success/30' : c.status === 'Regular' ? 'bg-primary/20 text-primary-dark border border-primary/40' : 'bg-neutral-muted/15 text-neutral-body border border-neutral-muted/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUPPLIER PROCUREMENT */}
      {activeTab === 'suppliers' && (
        <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card animate-slide-up space-y-6">
          <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2">
            Supplier & Procurement Registry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { company: 'FashionBox Logistics', category: 'Apparel & Fabric', contact: 'Kamrul Hasan', rating: '4.8', phone: '+880 1682-192083', leadTime: '3 Days' },
              { company: 'TechHub Components Inc.', category: 'Electronics & Chips', contact: 'Sarah Jenkins', rating: '4.9', phone: '+1 408-9821-209', leadTime: '7 Days' },
              { company: 'Dhaka Paper & Prints', category: 'Supplies & Thermal Rolls', contact: 'Rezaul Karim', rating: '4.6', phone: '+880 1912-381023', leadTime: '1 Day' }
            ].map((sup, index) => (
              <div key={index} className="p-4 bg-neutral-light/50 border border-neutral-light rounded-md space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold text-neutral-dark">{sup.company}</h3>
                  <span className="bg-primary/20 text-neutral-dark text-[9px] font-bold px-2 py-0.5 rounded">
                    ⭐ {sup.rating}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-muted">Category: <span className="font-semibold text-neutral-dark">{sup.category}</span></p>
                <div className="text-[10px] text-neutral-body border-t border-neutral-light/50 pt-2 space-y-1">
                  <p>Contact: {sup.contact}</p>
                  <p>Phone: {sup.phone}</p>
                  <p>Avg Lead Time: <span className="text-success font-bold">{sup.leadTime}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EXPENSE TRACKING */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Add expense */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card h-fit space-y-4">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2 flex items-center gap-1">
              <Plus className="w-4 h-4 text-primary-accent" />
              Record Corporate Expense
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Printer cartridges"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Amount (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 150.00"
                    value={expAmt}
                    onChange={(e) => setExpAmt(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Category</label>
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Operations">Operations</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Salaries">Salaries</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-2 rounded transition-colors"
              >
                Log Expense Entry
              </button>
            </form>
          </div>

          {/* Expense lists */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card lg:col-span-2">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2 mb-4">
              Logged Expenses
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-light bg-neutral-light/50 text-neutral-muted font-bold">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-neutral-light/10">
                      <td className="py-2.5 px-3 font-semibold">{exp.date}</td>
                      <td className="py-2.5 px-3 text-neutral-dark font-medium">{exp.desc}</td>
                      <td className="py-2.5 px-3">
                        <span className="bg-neutral-light border border-neutral-light px-2 py-0.5 rounded text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-error">-${exp.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI ANALYTICS & CHATBOT */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* AI Insights summaries */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-6 lg:col-span-1">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-primary-accent" />
              AI Core Predictions
            </h2>
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-md">
                <h4 className="font-bold text-neutral-dark flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-primary-dark" />
                  Forecasting Runout
                </h4>
                <p className="text-[10px] text-neutral-body mt-1 leading-relaxed">
                  "Zibonbaba Smart Coffee Mug v2" is projected to run out of stock in **12 days** based on high seasonal purchase frequencies. Reorder now.
                </p>
              </div>

              <div className="p-3 bg-success/10 border border-success/30 rounded-md">
                <h4 className="font-bold text-success flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Fraud Audits
                </h4>
                <p className="text-[10px] text-neutral-body mt-1 leading-relaxed">
                  No anomalous bot behaviors or IP credit trial spikes registered today. PCI checkout safety: **100%**.
                </p>
              </div>
            </div>
          </div>

          {/* AI Chatbot Assistant */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card lg:col-span-2 flex flex-col justify-between min-h-[400px]">
            <div>
              <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2 mb-4 flex items-center gap-1.5">
                <Bot className="w-5 h-5 text-primary-accent" />
                AI Business Assistant Chat
              </h2>
              {/* Chat Thread */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
                {chatHistory.map((chat, i) => (
                  <div
                    key={i}
                    className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg text-xs leading-relaxed ${
                        chat.sender === 'user'
                          ? 'bg-neutral-dark text-white rounded-br-none'
                          : 'bg-neutral-light border border-neutral-light text-neutral-dark rounded-bl-none'
                      }`}
                    >
                      <p className="font-bold text-[9px] opacity-75 mb-0.5 uppercase">
                        {chat.sender === 'user' ? 'You (Sarah)' : 'Zibonbaba AI'}
                      </p>
                      <p>{chat.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2 border-t border-neutral-light pt-4">
              <input
                type="text"
                placeholder="Ask e.g. 'Generate sales forecast' or 'Inventory audit'..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full bg-neutral-light border border-neutral-light rounded-md p-2.5 text-xs text-neutral-dark outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
