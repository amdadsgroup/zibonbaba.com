'use client';

import { useState } from 'react';
import {
  Building2,
  FileText,
  Landmark,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Upload,
  ChevronRight,
  AlertCircle,
  Shield,
} from 'lucide-react';

const steps = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Tax & Legal', icon: FileText },
  { id: 3, label: 'Bank Account', icon: Landmark },
  { id: 4, label: 'Final Review', icon: ClipboardCheck },
];

const businessTypes = ['Sole Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'NGO'];

export default function SellerKYCPage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [completedSteps] = useState([1]);

  // Step 1 data (pre-filled / completed)
  const step1Data = {
    tradeLicense: 'TL-BD-2024-098374',
    businessType: 'Private Limited',
    registrationNumber: 'RJSC-2021-CLT-00882',
    tin: 'TIN-1234567890',
  };

  // Step 3 form state
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    routing: '',
  });

  // File upload states
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent, setter: (f: File) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setter(file);
  };

  const overallStatus = 'Under Review';

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Store Verification</h1>
          <p className="text-gray-500 mt-1">Complete KYC verification to unlock full seller privileges.</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-xl">
          <Clock size={16} className="text-yellow-600" />
          <span className="font-semibold text-sm">{overallStatus}</span>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-[#FFC107] text-gray-900' : 'bg-gray-100 text-gray-400'}`}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className={`text-xs font-semibold transition ${isCurrent ? 'text-gray-800' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 ${completedSteps.includes(step.id) ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">

        {/* Step 1: Business Info (completed) */}
        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={20} className="text-green-500" />
              <h2 className="text-lg font-bold text-gray-800">Business Information</h2>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">Completed</span>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: 'Trade License Number', value: step1Data.tradeLicense },
                { label: 'Business Type', value: step1Data.businessType },
                { label: 'Registration Number', value: step1Data.registrationNumber },
                { label: 'TIN Number', value: step1Data.tin },
              ].map((f) => (
                <div key={f.label} className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs font-semibold text-green-700 mb-1">{f.label}</p>
                  <p className="text-sm font-medium text-gray-800">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Tax & Legal — File Uploads */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FileText size={20} className="text-[#FFC107]" /> Tax & Legal Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* National ID Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload National ID (NID)</label>
                <div
                  onDrop={(e) => handleDrop(e, setNidFile)}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition ${nidFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50'}`}
                  onClick={() => document.getElementById('nid-upload')?.click()}
                >
                  {nidFile ? (
                    <>
                      <CheckCircle2 size={32} className="text-green-500" />
                      <p className="text-sm font-medium text-green-700">{nidFile.name}</p>
                      <p className="text-xs text-green-600">File ready for upload</p>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Drag & drop or click to browse</p>
                      <p className="text-xs text-gray-400">Supports JPG, PNG, PDF (max 5MB)</p>
                    </>
                  )}
                  <input id="nid-upload" type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => e.target.files?.[0] && setNidFile(e.target.files[0])} />
                </div>
              </div>

              {/* Trade License Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Trade License</label>
                <div
                  onDrop={(e) => handleDrop(e, setLicenseFile)}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition ${licenseFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50'}`}
                  onClick={() => document.getElementById('license-upload')?.click()}
                >
                  {licenseFile ? (
                    <>
                      <CheckCircle2 size={32} className="text-green-500" />
                      <p className="text-sm font-medium text-green-700">{licenseFile.name}</p>
                      <p className="text-xs text-green-600">File ready for upload</p>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Drag & drop or click to browse</p>
                      <p className="text-xs text-gray-400">Supports JPG, PNG, PDF (max 5MB)</p>
                    </>
                  )}
                  <input id="license-upload" type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => e.target.files?.[0] && setLicenseFile(e.target.files[0])} />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 bg-[#FFC107] text-gray-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bank Account */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Landmark size={20} className="text-[#FFC107]" /> Bank Account Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. Dutch-Bangla Bank' },
                { key: 'accountName', label: 'Account Name', placeholder: 'e.g. ABC Store Ltd.' },
                { key: 'accountNumber', label: 'Account Number', placeholder: 'Enter account number' },
                { key: 'branch', label: 'Branch Name', placeholder: 'e.g. Gulshan Branch' },
                { key: 'routing', label: 'Routing Number', placeholder: 'Enter routing number' },
              ].map((f) => (
                <div key={f.key} className={f.key === 'routing' ? 'col-span-2 md:col-span-1' : ''}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={(bankForm as Record<string, string>)[f.key]}
                    onChange={(e) => setBankForm({ ...bankForm, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 bg-[#FFC107] text-gray-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-400 transition"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final Review */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <ClipboardCheck size={20} className="text-[#FFC107]" /> Final Review & Submission
            </h2>

            {/* Review Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Business Info</p>
                <p className="text-sm text-gray-700">Trade License: {step1Data.tradeLicense}</p>
                <p className="text-sm text-gray-700">Type: {step1Data.businessType}</p>
                <p className="text-sm text-gray-700">TIN: {step1Data.tin}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Documents</p>
                <div className="flex items-center gap-2 text-sm">
                  {nidFile ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-orange-500" />}
                  <span className="text-gray-700">National ID: {nidFile ? nidFile.name : 'Not uploaded'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  {licenseFile ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-orange-500" />}
                  <span className="text-gray-700">Trade License: {licenseFile ? licenseFile.name : 'Not uploaded'}</span>
                </div>
              </div>
            </div>

            {/* Submission Status */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 flex items-start gap-3">
              <Shield size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Application Status: Under Review</p>
                <p className="text-sm text-yellow-700 mt-1">Your KYC application is currently under review by our admin team. You will be notified via email once the verification is complete.</p>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-gray-400" /> Admin Notes
              </p>
              <p className="text-sm text-gray-400 italic">No notes from admin yet. Check back later.</p>
            </div>

            <div className="mt-5 flex justify-end">
              <button className="flex items-center gap-2 bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-700 transition">
                <CheckCircle2 size={16} /> Submit for Approval
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <div className="flex gap-2">
          {steps.map(s => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={`w-2.5 h-2.5 rounded-full transition ${currentStep === s.id ? 'bg-[#FFC107]' : completedSteps.includes(s.id) ? 'bg-green-400' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
          disabled={currentStep === 4}
          className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
