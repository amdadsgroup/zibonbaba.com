'use strict';
'use client';

import React, { useState } from 'react';
import { 
  Sliders, 
  CreditCard, 
  Truck, 
  Percent, 
  Bell, 
  Globe, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface SettingsModuleProps {
  onSaveSettings?: (settings: any) => Promise<void>;
}

export function SettingsModule({ onSaveSettings }: SettingsModuleProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'shipping' | 'commission' | 'notifications'>('general');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Platform General Settings
  const [platformName, setPlatformName] = useState('Zibonbaba.com');
  const [supportEmail, setSupportEmail] = useState('support@zibonbaba.com');
  const [supportPhone, setSupportPhone] = useState('+880 1700-000000');
  const [currencySymbol, setCurrencySymbol] = useState('৳');
  const [currencyCode, setCurrencyCode] = useState('BDT');
  const [timezone, setTimezone] = useState('Asia/Dhaka (GMT+6)');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Payment Gateways Settings
  const [codEnabled, setCodEnabled] = useState(true);
  const [codMaxLimit, setCodMaxLimit] = useState('20000');
  const [sslcommerzEnabled, setSslcommerzEnabled] = useState(true);
  const [sslcommerzSandbox, setSslcommerzSandbox] = useState(true);
  const [sslStoreId, setSslStoreId] = useState('zibonbaba_sandbox');
  const [sslStorePass, setSslStorePass] = useState('••••••••••••');
  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [bkashSandbox, setBkashSandbox] = useState(true);

  // Shipping & Logistics Settings
  const [insideDhakaFee, setInsideDhakaFee] = useState('60');
  const [outsideDhakaFee, setOutsideDhakaFee] = useState('120');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('5000');
  const [courierPartner, setCourierPartner] = useState('PATHAO');

  // Commission & Financial Settings
  const [globalCommission, setGlobalCommission] = useState('8.5');
  const [globalVat, setGlobalVat] = useState('5.0');
  const [minVendorPayout, setMinVendorPayout] = useState('1000');
  const [payoutSchedule, setPayoutSchedule] = useState('WEEKLY');

  // Notification Settings
  const [smsGatewayEnabled, setSmsGatewayEnabled] = useState(true);
  const [smsProvider, setSmsProvider] = useState('GREENWEB');
  const [emailNotificationEnabled, setEmailNotificationEnabled] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      general: { platformName, supportEmail, supportPhone, currencyCode, maintenanceMode },
      payments: { codEnabled, codMaxLimit, sslcommerzEnabled, sslcommerzSandbox, bkashEnabled, bkashSandbox },
      shipping: { insideDhakaFee, outsideDhakaFee, freeShippingThreshold, courierPartner },
      commission: { globalCommission, globalVat, minVendorPayout, payoutSchedule },
      notifications: { smsGatewayEnabled, smsProvider, emailNotificationEnabled }
    };

    try {
      if (onSaveSettings) {
        await onSaveSettings(payload);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save platform settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#FFC107]" /> Platform Settings & Configuration
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage global marketplace controls, payment gateways, delivery pricing, and fee structures
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC107] hover:bg-[#FFB800] text-slate-900 font-semibold text-xs rounded-xl shadow-sm transition-all focus:outline-none disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Applying Changes...' : 'Save All Settings'}
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Platform configuration updated successfully. Cached endpoints will refresh across all nodes.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'general', label: 'General & Storefront', icon: Globe },
          { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
          { id: 'shipping', label: 'Delivery & Shipping', icon: Truck },
          { id: 'commission', label: 'Commissions & VAT', icon: Percent },
          { id: 'notifications', label: 'SMS & Email Alerts', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#FFC107]" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">General Platform Identity</h3>
              <p className="text-xs text-slate-500">Core marketplace naming, contact emails, and regional locale</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Platform Brand Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Official Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Customer Hotline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Primary Currency</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="Symbol (৳)"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                  <input
                    type="text"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    placeholder="Code (BDT)"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Default Timezone</label>
                <input
                  type="text"
                  disabled
                  value={timezone}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-900">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-500">Temporarily display maintenance screen to public shoppers</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-5 h-5 accent-[#FFC107] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Payment Gateways & Disbursals</h3>
              <p className="text-xs text-slate-500">Configure Cash on Delivery, SSLCommerz, and bKash Direct API</p>
            </div>

            {/* COD */}
            <div className="p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-slate-500">Allow customers to pay physical cash upon package handover</p>
                </div>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#FFC107] rounded cursor-pointer"
                />
              </div>

              {codEnabled && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-700">Maximum COD Order Threshold (৳):</label>
                  <input
                    type="number"
                    value={codMaxLimit}
                    onChange={(e) => setCodMaxLimit(e.target.value)}
                    className="w-40 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                </div>
              )}
            </div>

            {/* SSLCommerz */}
            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">SSLCommerz Payment Gateway</h4>
                  <p className="text-xs text-slate-500">Accept Visa, Mastercard, AMEX, Nagad, Rocket, Upay, and Net Banking</p>
                </div>
                <input
                  type="checkbox"
                  checked={sslcommerzEnabled}
                  onChange={(e) => setSslcommerzEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#FFC107] rounded cursor-pointer"
                />
              </div>

              {sslcommerzEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Store ID</label>
                    <input
                      type="text"
                      value={sslStoreId}
                      onChange={(e) => setSslStoreId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Store Password / Secret</label>
                    <input
                      type="password"
                      value={sslStorePass}
                      onChange={(e) => setSslStorePass(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sslSandbox"
                      checked={sslcommerzSandbox}
                      onChange={(e) => setSslcommerzSandbox(e.target.checked)}
                      className="w-4 h-4 accent-[#FFC107] rounded"
                    />
                    <label htmlFor="sslSandbox" className="text-xs text-slate-700 cursor-pointer">
                      Enable Sandbox Test Mode (Use sandbox.sslcommerz.com instead of live gateway)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* bKash */}
            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">bKash Direct Merchant Checkout</h4>
                  <p className="text-xs text-slate-500">1-click tokenized bKash wallet payments for Bangladesh customers</p>
                </div>
                <input
                  type="checkbox"
                  checked={bkashEnabled}
                  onChange={(e) => setBkashEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#FFC107] rounded cursor-pointer"
                />
              </div>

              {bkashEnabled && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="bkashSandbox"
                    checked={bkashSandbox}
                    onChange={(e) => setBkashSandbox(e.target.checked)}
                    className="w-4 h-4 accent-[#FFC107] rounded"
                  />
                  <label htmlFor="bkashSandbox" className="text-xs text-slate-700 cursor-pointer">
                    Enable bKash Sandbox Mode
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SHIPPING TAB */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Nationwide Delivery & Logistics</h3>
              <p className="text-xs text-slate-500">Configure delivery charges, free delivery perks, and 3PL courier integrations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Inside Dhaka City Fee</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={insideDhakaFee}
                    onChange={(e) => setInsideDhakaFee(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Standard 24-48h Dhaka Metro rate</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Outside Dhaka Nationwide</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={outsideDhakaFee}
                    onChange={(e) => setOutsideDhakaFee(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">All 64 districts 48-72h rate</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Free Delivery Cart Value</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Orders above this qualify for free shipping</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Default 3PL Logistics Partner</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'PATHAO', name: 'Pathao Courier', desc: 'Fastest urban delivery' },
                  { id: 'REDX', name: 'RedX Logistics', desc: 'Broad rural coverage' },
                  { id: 'STEADFAST', name: 'Steadfast Courier', desc: 'Highest success rate' },
                ].map((partner) => (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => setCourierPartner(partner.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      courierPartner === partner.id
                        ? 'border-[#FFC107] bg-[#FFC107]/10'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold text-slate-900 text-xs">{partner.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{partner.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. COMMISSION & VAT TAB */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Commission Structure & Tax Compliance</h3>
              <p className="text-xs text-slate-500">Define marketplace take rate, automated NBR VAT deduction, and settlement rules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Default Platform Commission Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={globalCommission}
                    onChange={(e) => setGlobalCommission(e.target.value)}
                    className="w-full pr-8 pl-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Applies globally unless overridden in Category Management</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Bangladesh NBR VAT Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={globalVat}
                    onChange={(e) => setGlobalVat(e.target.value)}
                    className="w-full pr-8 pl-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Deducted from gross invoice for automated Mushak-6.3 reporting</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Minimum Merchant Payout Threshold (৳)</label>
                <input
                  type="number"
                  value={minVendorPayout}
                  onChange={(e) => setMinVendorPayout(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Automated Settlement Cycle</label>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                >
                  <option value="DAILY">Daily Automatic Disbursal</option>
                  <option value="WEEKLY">Weekly Batch on Sundays</option>
                  <option value="BIWEEKLY">Bi-Weekly (1st & 15th)</option>
                  <option value="MONTHLY">Monthly Settlement</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 5. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Transactional Notifications & Gateways</h3>
              <p className="text-xs text-slate-500">Configure outbound SMS gateways for OTPs and SMTP mail servers</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Transactional SMS Alerts</h4>
                  <p className="text-xs text-slate-500">Send instant order confirmation SMS & delivery courier OTPs</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsGatewayEnabled}
                  onChange={(e) => setSmsGatewayEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#FFC107] rounded cursor-pointer"
                />
              </div>

              {smsGatewayEnabled && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-700">SMS Gateway Provider:</label>
                  <select
                    value={smsProvider}
                    onChange={(e) => setSmsProvider(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                  >
                    <option value="GREENWEB">Greenweb Bangladesh</option>
                    <option value="BULKSMSBD">BulkSMS BD</option>
                    <option value="TWILIO">Twilio International</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Customer Email Invoices</h4>
                  <p className="text-xs text-slate-500">Send HTML branded PDF invoices upon successful checkout</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotificationEnabled}
                  onChange={(e) => setEmailNotificationEnabled(e.target.checked)}
                  className="w-5 h-5 accent-[#FFC107] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
