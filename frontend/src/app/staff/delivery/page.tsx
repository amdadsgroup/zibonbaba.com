'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  MapPin,
  ClipboardList,
  FileText,
  UserPlus,
  Circle,
  Building2,
  Package,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Bike,
  Car,
  Navigation,
  DollarSign,
  AlertTriangle,
  Send,
  Printer,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Plus,
  Check,
  X,
  ExternalLink,
  SlidersHorizontal,
  Compass,
  Calendar,
  Eye,
  Info
} from 'lucide-react';
import { useStore } from '@/store/useStore';

type HubTab = 'dispatch' | 'fleet' | 'inbound' | 'hubs';

export default function DeliveryHubPage() {
  const { isLoggedIn, role, username, logout } = useStore();

  const [activeTab, setActiveTab] = useState<HubTab>('dispatch');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hubs List & Selected Hub
  const [hubs, setHubs] = useState<any[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>('ALL');

  // Orders in Dispatch Queue
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilterTab, setOrderFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Stationed Riders at Hub
  const [riders, setRiders] = useState<any[]>([]);
  const [riderFilterOnline, setRiderFilterOnline] = useState(false);

  // Selection for Bulk Dispatch & Manifest
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<any | null>(null);
  const [assignRiderId, setAssignRiderId] = useState('');
  const [assignDeliveryFee, setAssignDeliveryFee] = useState('120');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignEstHours, setAssignEstHours] = useState('24');

  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [manifestData, setManifestData] = useState<any | null>(null);

  const [isCreateHubModalOpen, setIsCreateHubModalOpen] = useState(false);
  const [newHubName, setNewHubName] = useState('');
  const [newHubCode, setNewHubCode] = useState('');
  const [newHubDivision, setNewHubDivision] = useState('Dhaka');
  const [newHubDistrict, setNewHubDistrict] = useState('Dhaka');
  const [newHubAddress, setNewHubAddress] = useState('');
  const [newHubContact, setNewHubContact] = useState('');
  const [newHubCapacity, setNewHubCapacity] = useState('800');
  const [newHubCoverage, setNewHubCoverage] = useState('Tejgaon, Gulshan, Banani');

  const [isStationRiderModalOpen, setIsStationRiderModalOpen] = useState(false);
  const [stationRiderUserId, setStationRiderUserId] = useState('');
  const [stationRiderVehicle, setStationRiderVehicle] = useState('MOTORCYCLE');
  const [stationRiderZone, setStationRiderZone] = useState('');

  // Inbound Parcel Scan Form
  const [inboundOrderId, setInboundOrderId] = useState('');
  const [inboundNotes, setInboundNotes] = useState('');
  const [inboundSuccess, setInboundSuccess] = useState<any | null>(null);

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // 1. Fetch All Delivery Hubs
  const fetchHubs = useCallback(async () => {
    try {
      const res = await fetch('/api/hubs', { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setHubs(data.hubs || []);
      }
    } catch (_) {}
  }, []);

  // 2. Fetch Dispatch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const hubParam = selectedHubId !== 'ALL' ? `&hubId=${selectedHubId}` : '';
      const statusParam = orderFilterTab !== 'ALL' ? `&status=${orderFilterTab}` : '';
      const res = await fetch(`/api/admin/delivery/unassigned-orders?${hubParam}${statusParam}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (_) {}
  }, [selectedHubId, orderFilterTab]);

  // 3. Fetch Stationed Riders
  const fetchRiders = useCallback(async () => {
    try {
      if (selectedHubId !== 'ALL') {
        const res = await fetch(`/api/hubs/${selectedHubId}/riders`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) {
          setRiders(data.riders || []);
        }
      } else {
        const res = await fetch('/api/admin/delivery-men', { headers: getAuthHeaders() });
        const data = await res.json();
        if (res.ok) {
          setRiders(data.deliveryMen || []);
        }
      }
    } catch (_) {}
  }, [selectedHubId]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchHubs(), fetchOrders(), fetchRiders()]);
    setLoading(false);
  }, [fetchHubs, fetchOrders, fetchRiders]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Active selected hub details
  const activeHubDetails = useMemo(() => {
    if (selectedHubId === 'ALL') return null;
    return hubs.find((h) => h.id === selectedHubId) || null;
  }, [selectedHubId, hubs]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.address && o.address.toLowerCase().includes(q)) ||
        (o.district && o.district.toLowerCase().includes(q))
      );
    });
  }, [orders, searchQuery]);

  // Filtered Riders
  const filteredRiders = useMemo(() => {
    return riders.filter((r) => {
      if (riderFilterOnline && !r.isOnline) return false;
      return true;
    });
  }, [riders, riderFilterOnline]);

  // Aggregate Stats across current Hub or System
  const stats = useMemo(() => {
    if (activeHubDetails) {
      return {
        totalParcels: orders.length,
        activeRiders: riders.filter((r) => r.isOnline).length,
        totalRiders: riders.length,
        deliveredToday: activeHubDetails.stats?.deliveredCount || 0,
        codInTransit: activeHubDetails.stats?.totalCodInTransit || 0,
        capacityUsage: activeHubDetails.stats?.capacityUtilization || 0
      };
    }
    const totalOnlineRiders = hubs.reduce((sum, h) => sum + (h.stats?.onlineRiders || 0), 0);
    const totalCapacityUsage =
      hubs.length > 0
        ? Math.round(
            hubs.reduce((sum, h) => sum + (h.stats?.capacityUtilization || 0), 0) / hubs.length
          )
        : 0;

    return {
      totalParcels: orders.length,
      activeRiders: totalOnlineRiders || riders.filter((r) => r.isOnline).length,
      totalRiders: riders.length,
      deliveredToday: hubs.reduce((sum, h) => sum + (h.stats?.deliveredCount || 0), 0),
      codInTransit: hubs.reduce((sum, h) => sum + (h.stats?.totalCodInTransit || 0), 0),
      capacityUsage: totalCapacityUsage
    };
  }, [activeHubDetails, orders, riders, hubs]);

  // Handlers
  const handleOpenAssignModal = (order: any) => {
    setSelectedOrderForAssign(order);
    setAssignDeliveryFee('120');
    setAssignInstructions('');
    // Auto suggest first available online rider
    const availableOnlineRider = riders.find((r) => r.isOnline && (r.activeTasksCount || 0) < 3);
    if (availableOnlineRider) {
      setAssignRiderId(availableOnlineRider.userId || availableOnlineRider.id);
    } else if (riders.length > 0) {
      setAssignRiderId(riders[0].userId || riders[0].id);
    }
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedOrderForAssign || !assignRiderId) {
      showNotification('Please select a delivery rider.', true);
      return;
    }

    setActionLoading(true);
    try {
      const hubTarget =
        selectedHubId !== 'ALL'
          ? selectedHubId
          : selectedOrderForAssign.hub?.id || hubs[0]?.id;

      const res = await fetch(`/api/hubs/${hubTarget}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          orderId: selectedOrderForAssign.id,
          deliveryManId: assignRiderId,
          deliveryFee: assignDeliveryFee,
          specialInstructions: assignInstructions,
          estimatedDeliveryHours: assignEstHours
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch rider');

      showNotification(data.message || 'Rider dispatched successfully!');
      setIsAssignModalOpen(false);
      setSelectedOrderForAssign(null);
      await Promise.all([fetchOrders(), fetchRiders(), fetchHubs()]);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDispatch = async () => {
    if (selectedOrderIds.length === 0 || !assignRiderId) {
      showNotification('Select at least one order and a delivery rider.', true);
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/hubs/bulk-assign', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          hubId: selectedHubId !== 'ALL' ? selectedHubId : null,
          orderIds: selectedOrderIds,
          deliveryManId: assignRiderId,
          deliveryFee: assignDeliveryFee,
          specialInstructions: assignInstructions
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk dispatch failed');

      showNotification(data.message || `Dispatched ${selectedOrderIds.length} orders successfully!`);
      setSelectedOrderIds([]);
      setIsBulkAssignModalOpen(false);
      await Promise.all([fetchOrders(), fetchRiders(), fetchHubs()]);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInboundIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboundOrderId.trim()) {
      showNotification('Please enter or scan an Order ID.', true);
      return;
    }

    const hubTarget = selectedHubId !== 'ALL' ? selectedHubId : hubs[0]?.id;
    if (!hubTarget) {
      showNotification('Please select a target Delivery Hub.', true);
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/hubs/receive', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          hubId: hubTarget,
          orderId: inboundOrderId.trim(),
          notes: inboundNotes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Inbound intake failed');

      setInboundSuccess(data.order);
      setInboundOrderId('');
      setInboundNotes('');
      showNotification(data.message || 'Parcel successfully received into Hub!');
      await Promise.all([fetchOrders(), fetchHubs()]);
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName.trim() || !newHubAddress.trim() || !newHubDistrict.trim()) {
      showNotification('Hub Name, Address, and District are required.', true);
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/hubs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newHubName.trim(),
          code: newHubCode.trim().toUpperCase() || undefined,
          division: newHubDivision.trim(),
          district: newHubDistrict.trim(),
          address: newHubAddress.trim(),
          contactNumber: newHubContact.trim() || undefined,
          capacity: newHubCapacity ? parseInt(newHubCapacity, 10) : 500,
          coverageAreas: newHubCoverage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Delivery Hub');

      showNotification(data.message || 'Delivery Hub created successfully!');
      setIsCreateHubModalOpen(false);
      setNewHubName('');
      setNewHubCode('');
      setNewHubAddress('');
      setNewHubContact('');
      await fetchHubs();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenManifest = () => {
    const assignedOrdersList = selectedOrderIds.length > 0
      ? orders.filter((o) => selectedOrderIds.includes(o.id))
      : orders.slice(0, 15);

    const selectedRiderObj = riders.find(
      (r) => (r.userId || r.id) === assignRiderId
    ) || riders[0];

    setManifestData({
      hubName: activeHubDetails?.name || 'Dhaka Central Hub',
      hubCode: activeHubDetails?.code || 'HUB-DHK-01',
      hubAddress: activeHubDetails?.address || 'Plot 14, Road 5, Tejgaon, Dhaka',
      hubContact: activeHubDetails?.contactNumber || '+8801700000009',
      riderName: selectedRiderObj?.fullName || 'Stationed Fleet Agent',
      riderPhone: selectedRiderObj?.phone || '+8801777777777',
      vehicle: selectedRiderObj?.vehicleType || 'MOTORCYCLE',
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      orders: assignedOrdersList,
      totalCOD: assignedOrdersList.reduce((sum, o) => sum + (o.total || 0), 0)
    });
    setIsManifestModalOpen(true);
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOrders = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden pb-16">
      {/* Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#FFC107]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[300px] right-[-100px] w-[450px] h-[450px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Notifications */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500/90 backdrop-blur-md text-slate-950 font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-emerald-400">
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-5 right-5 z-50 bg-red-500/90 backdrop-blur-md text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in border border-red-400">
          <XCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFC107] text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Logistics OS
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {activeHubDetails ? activeHubDetails.code : 'ENTERPRISE HUB NETWORK'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
              <Building2 className="text-[#FFC107]" size={28} />
              Delivery Hub & Rider Dispatch Station
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Intake parcels, station delivery fleet, and assign riders for fast last-mile fulfillment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Hub Selector Switcher */}
            <div className="relative">
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="bg-slate-900 border border-white/15 text-white font-bold text-xs rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-[#FFC107] appearance-none cursor-pointer shadow-lg"
              >
                <option value="ALL">🏢 All Delivery Hubs ({hubs.length})</option>
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    📍 {h.name} ({h.code}) — {h.district}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => setIsCreateHubModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/10 transition cursor-pointer shadow"
            >
              <Plus size={15} /> Add Hub
            </button>

            <button
              onClick={handleOpenManifest}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/10 transition cursor-pointer shadow"
            >
              <Printer size={15} /> Manifest
            </button>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* Active Hub Banner (if a specific hub is selected) */}
        {activeHubDetails && (
          <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-[#FFC107]/20 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFC107]/20 text-[#FFC107] font-black text-xs px-2.5 py-0.5 rounded-lg border border-[#FFC107]/30">
                  {activeHubDetails.code}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Circle size={8} fill="currentColor" /> {activeHubDetails.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  🕒 {activeHubDetails.operatingHours}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{activeHubDetails.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#FFC107]" />
                {activeHubDetails.address}, {activeHubDetails.district}, {activeHubDetails.division}
              </p>
              {activeHubDetails.coverageAreas?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Coverage:</span>
                  {activeHubDetails.coverageAreas.map((zone: string) => (
                    <span
                      key={zone}
                      className="bg-white/5 border border-white/10 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Station Manager
                </span>
                <span className="text-xs font-bold text-white block">
                  {activeHubDetails.manager?.name || 'Unassigned Manager'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeHubDetails.contactNumber || activeHubDetails.manager?.phone || 'N/A'}
                </span>
              </div>
              <button
                onClick={() => setSelectedHubId('ALL')}
                className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold px-3 py-2.5 rounded-xl border border-white/10 transition cursor-pointer"
              >
                View All Hubs
              </button>
            </div>
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">In Hub Queue</span>
              <Package size={16} className="text-amber-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">{stats.totalParcels}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Parcels to dispatch</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Online Riders</span>
              <Bike size={16} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-400">{stats.activeRiders}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                of {stats.totalRiders} Stationed
              </span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
              <CheckCircle2 size={16} className="text-blue-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">{stats.deliveredToday}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Completed drops</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">COD In Transit</span>
              <DollarSign size={16} className="text-[#FFC107]" />
            </div>
            <div>
              <span className="text-2xl font-black text-[#FFC107]">
                ৳{stats.codInTransit.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Total cash to collect</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Capacity Load</span>
              <Layers size={16} className="text-purple-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">{stats.capacityUsage}%</span>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.capacityUsage > 85 ? 'bg-red-500' : 'bg-[#FFC107]'
                  }`}
                  style={{ width: `${Math.min(100, stats.capacityUsage)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Hub Network</span>
              <Building2 size={16} className="text-cyan-400" />
            </div>
            <div>
              <span className="text-2xl font-black text-cyan-400">{hubs.length}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Active regional hubs</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'dispatch'
                  ? 'bg-[#FFC107] text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Truck size={15} />
              Dispatch Queue ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'fleet'
                  ? 'bg-[#FFC107] text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bike size={15} />
              Stationed Fleet ({riders.length})
            </button>

            <button
              onClick={() => setActiveTab('inbound')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'inbound'
                  ? 'bg-[#FFC107] text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package size={15} />
              Inbound Intake
            </button>

            <button
              onClick={() => setActiveTab('hubs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'hubs'
                  ? 'bg-[#FFC107] text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 size={15} />
              Hub Directory ({hubs.length})
            </button>
          </div>

          {/* Bulk Actions if Orders Selected */}
          {selectedOrderIds.length > 0 && activeTab === 'dispatch' && (
            <div className="flex items-center gap-2 animate-fade-in bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-amber-400">
                {selectedOrderIds.length} orders selected
              </span>
              <button
                onClick={() => setIsBulkAssignModalOpen(true)}
                className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow"
              >
                Bulk Dispatch to Rider
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DISPATCH QUEUE & RIDER ASSIGNMENT CONSOLE */}
        {/* ========================================================================= */}
        {activeTab === 'dispatch' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter Bar */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {['ALL', 'PENDING', 'PROCESSING', 'READY_FOR_DELIVERY'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterTab(st)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                      orderFilterTab === st
                        ? 'bg-white/20 text-white border border-white/20'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All Unassigned'
                      : st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Order, Phone, Area..."
                    className="bg-slate-950 border border-white/10 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#FFC107] w-64 placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table / Cards */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrderIds.length === filteredOrders.length
                    }
                    onChange={toggleSelectAllOrders}
                    className="rounded text-[#FFC107] focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    Parcels Ready For Rider Dispatch ({filteredOrders.length})
                  </span>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {filteredOrders.map((ord) => {
                  const isSelected = selectedOrderIds.includes(ord.id);
                  return (
                    <div
                      key={ord.id}
                      className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                        isSelected ? 'bg-amber-500/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(ord.id)}
                          className="rounded text-[#FFC107] focus:ring-0 cursor-pointer w-4 h-4 mt-1"
                        />
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              #{ord.id.slice(0, 8).toUpperCase()}
                            </span>
                            {ord.isResellerOrder && (
                              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                Reseller Order
                              </span>
                            )}
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              {ord.status}
                            </span>
                            {ord.hub && (
                              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Building2 size={10} /> {ord.hub.name}
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <span>{ord.customerName}</span>
                            <span className="text-slate-400 font-mono font-normal">
                              ({ord.customerPhone})
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#FFC107] shrink-0" />
                            <span>
                              {ord.address}, {ord.district} {ord.upazila ? `(${ord.upazila})` : ''}
                            </span>
                          </p>

                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="text-slate-500">Items:</span>
                            <span>{ord.itemsSummary || `${ord.itemsCount} products`}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500">Store:</span>
                            <span className="text-slate-300 font-medium">{ord.storeName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions & Value */}
                      <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/5">
                        <div className="text-left lg:text-right font-mono">
                          <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">
                            Total COD Amount
                          </span>
                          <span className="text-base font-black text-[#FFC107]">
                            ৳{ord.total.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenAssignModal(ord)}
                          className="flex items-center gap-2 bg-[#FFC107] hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition shadow-glow cursor-pointer"
                        >
                          <Send size={14} />
                          Assign Rider
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <div className="py-16 text-center text-slate-500 space-y-3">
                    <CheckCircle2 size={40} className="mx-auto text-emerald-500/60" />
                    <p className="text-sm font-bold text-slate-300">
                      All orders in this queue have been dispatched to riders!
                    </p>
                    <p className="text-xs text-slate-500">
                      New unassigned customer orders will appear here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STATIONED RIDER FLEET COMMAND */}
        {/* ========================================================================= */}
        {activeTab === 'fleet' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Stationed Fleet ({filteredRiders.length} Riders)
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riderFilterOnline}
                    onChange={(e) => setRiderFilterOnline(e.target.checked)}
                    className="rounded text-[#FFC107] focus:ring-0"
                  />
                  <span>Show Online Only</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStationRiderModalOpen(true)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/10 transition cursor-pointer"
                >
                  <UserPlus size={15} /> Station New Rider
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRiders.map((r) => {
                const isOnline = r.isOnline;
                const activeTasks = r.activeTasksCount ?? r.activeAssignments ?? 0;
                return (
                  <div
                    key={r.id}
                    className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{r.fullName}</h3>
                            <span
                              className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                isOnline
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : 'bg-white/5 border-white/5 text-slate-500'
                              }`}
                            >
                              {isOnline ? '🟢 ONLINE' : '⚪ OFFLINE'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {r.phone || r.email}
                          </p>
                          <span className="text-[10px] text-[#FFC107] font-semibold block mt-0.5">
                            Zone: {r.preferredZone || 'Station Radius'}
                          </span>
                        </div>

                        <div className="p-2 bg-white/5 rounded-xl text-slate-300">
                          {r.vehicleType === 'MOTORCYCLE' || r.vehicleType === 'BIKE' ? (
                            <Bike size={20} />
                          ) : (
                            <Car size={20} />
                          )}
                        </div>
                      </div>

                      {/* Performance Specs */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 text-center font-mono">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">
                            Active
                          </span>
                          <span className="text-xs font-bold text-white">{activeTasks}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">
                            Drops
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            {r.completedDeliveries || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase font-sans font-bold">
                            COD In Hand
                          </span>
                          <span className="text-xs font-bold text-[#FFC107]">
                            ৳{(r.cashInHand || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Vehicle Reg:</span>
                          <span className="text-slate-200 font-mono">{r.vehicleNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Driving License:</span>
                          <span className="text-slate-200 font-mono">{r.drivingLicense || 'Verified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex gap-2">
                      <button
                        onClick={() => {
                          setAssignRiderId(r.userId || r.id);
                          if (orders.length > 0) {
                            handleOpenAssignModal(orders[0]);
                          } else {
                            showNotification('No pending parcels in queue.', true);
                          }
                        }}
                        className="flex-1 bg-[#FFC107]/20 hover:bg-[#FFC107]/30 text-[#FFC107] border border-[#FFC107]/30 text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send size={13} />
                        Dispatch Parcel
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredRiders.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 space-y-2">
                  <Bike size={36} className="mx-auto text-slate-600" />
                  <p className="text-sm font-bold text-slate-400">
                    No riders found matching the current criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INBOUND PARCEL INTAKE */}
        {/* ========================================================================= */}
        {activeTab === 'inbound' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <span className="bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Intake Scanner
                </span>
                <h2 className="text-xl font-bold text-white mt-1.5">
                  Receive Inbound Package into Delivery Hub
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Scan the parcel barcode or enter Order ID to check it into this hub station before assigning to a courier.
                </p>
              </div>

              <form onSubmit={handleInboundIntake} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Target Hub Location
                  </label>
                  <select
                    value={selectedHubId !== 'ALL' ? selectedHubId : hubs[0]?.id || ''}
                    onChange={(e) => setSelectedHubId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 text-white text-xs font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFC107]"
                  >
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.code}) — {h.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Order ID / Barcode Tracking # *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inboundOrderId}
                      onChange={(e) => setInboundOrderId(e.target.value)}
                      placeholder="e.g. 5401 or ORD-5401 or full UUID"
                      className="w-full bg-slate-950 border border-white/15 text-white font-mono text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFC107] placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Package Condition & Inbound Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={inboundNotes}
                    onChange={(e) => setInboundNotes(e.target.value)}
                    placeholder="e.g. Received from Tejgaon Central Warehouse in good condition."
                    className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#FFC107] placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading || !inboundOrderId.trim()}
                  className="w-full bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-sm py-3.5 rounded-xl transition shadow-glow cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Package size={18} />
                  {actionLoading ? 'Checking In...' : 'Receive & Check In to Hub'}
                </button>
              </form>

              {/* Inbound Success Feedback Card */}
              {inboundSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Package Successfully Received & Checked In</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>
                      <strong>Order:</strong> #{inboundSuccess.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p>
                      <strong>Customer:</strong> {inboundSuccess.customerName}
                    </p>
                    <p>
                      <strong>Hub Station:</strong> {inboundSuccess.hubName} ({inboundSuccess.hubCode})
                    </p>
                    <p>
                      <strong>COD Amount:</strong> ৳{inboundSuccess.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DELIVERY HUBS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === 'hubs' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Registered Regional Delivery Hubs</h2>
                <p className="text-xs text-slate-400">
                  Manage hubs, station capacity, and regional coverage lines.
                </p>
              </div>

              <button
                onClick={() => setIsCreateHubModalOpen(true)}
                className="flex items-center gap-2 bg-[#FFC107] hover:bg-yellow-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-glow transition cursor-pointer"
              >
                <Plus size={16} /> Create Delivery Hub
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hubs.map((h) => (
                <div
                  key={h.id}
                  className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="bg-[#FFC107]/20 text-[#FFC107] font-black text-[10px] px-2 py-0.5 rounded-md border border-[#FFC107]/30">
                          {h.code}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{h.name}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-[#FFC107]" />
                          {h.district}, {h.division}
                        </p>
                      </div>

                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {h.status}
                      </span>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Address:</span>
                        <span className="text-slate-200 text-right max-w-[180px] truncate">
                          {h.address}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contact:</span>
                        <span className="text-slate-200 font-mono">{h.contactNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Operating Hours:</span>
                        <span className="text-slate-200">{h.operatingHours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Stationed Fleet:</span>
                        <span className="text-emerald-400 font-bold">
                          {h.stats?.totalRiders || 0} Riders ({h.stats?.onlineRiders || 0} Online)
                        </span>
                      </div>
                    </div>

                    {/* Capacity Utilization Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                        <span>Capacity Utilization</span>
                        <span className="text-white">{h.stats?.capacityUtilization || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#FFC107] h-full rounded-full"
                          style={{ width: `${Math.min(100, h.stats?.capacityUtilization || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedHubId(h.id);
                        setActiveTab('dispatch');
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer text-center"
                    >
                      Open Station
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN RIDER TO ORDER */}
      {/* ========================================================================= */}
      {isAssignModalOpen && selectedOrderForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#FFC107] uppercase tracking-wider">
                  Dispatch Assignment
                </span>
                <h3 className="text-lg font-bold text-white">
                  Assign Rider to #{selectedOrderForAssign.id.slice(0, 8).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Order Brief */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-white">{selectedOrderForAssign.customerName}</span>
                <span className="text-[#FFC107] font-mono">
                  COD: ৳{selectedOrderForAssign.total.toLocaleString()}
                </span>
              </div>
              <p className="text-slate-400 flex items-center gap-1">
                <MapPin size={12} className="text-[#FFC107]" />
                {selectedOrderForAssign.address}, {selectedOrderForAssign.district}
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                Phone: {selectedOrderForAssign.customerPhone}
              </p>
            </div>

            {/* Select Delivery Rider */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Select Stationed Delivery Rider *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {riders.map((r) => {
                  const riderId = r.userId || r.id;
                  const isSelected = assignRiderId === riderId;
                  return (
                    <div
                      key={riderId}
                      onClick={() => setAssignRiderId(riderId)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#FFC107]/10 border-[#FFC107] text-white'
                          : 'bg-slate-950/60 border-white/5 hover:border-white/15 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          {r.vehicleType === 'MOTORCYCLE' || r.vehicleType === 'BIKE' ? (
                            <Bike size={16} className="text-[#FFC107]" />
                          ) : (
                            <Car size={16} className="text-blue-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{r.fullName}</span>
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                                r.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
                              }`}
                            >
                              {r.isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {r.phone || r.email} • {r.preferredZone || 'Central Zone'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px]">
                        <span className="text-slate-400 block text-[9px] font-sans uppercase">
                          Active Load
                        </span>
                        <span className="text-white font-bold">
                          {r.activeTasksCount || r.activeAssignments || 0} Tasks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Delivery Fee & SLA */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Delivery Fee (BDT)
                </label>
                <input
                  type="number"
                  value={assignDeliveryFee}
                  onChange={(e) => setAssignDeliveryFee(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 text-white font-mono text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#FFC107]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Est. Delivery Time
                </label>
                <select
                  value={assignEstHours}
                  onChange={(e) => setAssignEstHours(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#FFC107]"
                >
                  <option value="2">⚡ Express (2 Hours)</option>
                  <option value="6">🚀 Same Day (6 Hours)</option>
                  <option value="24">📦 Standard (24 Hours)</option>
                  <option value="48">🚚 Regional (48 Hours)</option>
                </select>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={assignInstructions}
                onChange={(e) => setAssignInstructions(e.target.value)}
                placeholder="e.g. Call customer before arrival. Handle fragile package with care."
                className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#FFC107]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !assignRiderId}
                onClick={handleConfirmAssignment}
                className="flex-1 bg-[#FFC107] hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 rounded-xl transition shadow-glow cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                {actionLoading ? 'Dispatching...' : 'Dispatch Rider & Generate OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK DISPATCH ORDERS */}
      {/* ========================================================================= */}
      {isBulkAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#FFC107] uppercase tracking-wider">
                  Bulk Batch Dispatch
                </span>
                <h3 className="text-lg font-bold text-white">
                  Dispatch {selectedOrderIds.length} Selected Orders
                </h3>
              </div>
              <button
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              All {selectedOrderIds.length} selected orders will be assigned to the selected courier with automatically generated delivery OTPs.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Select Dispatch Rider *
              </label>
              <select
                value={assignRiderId}
                onChange={(e) => setAssignRiderId(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 text-white text-xs font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFC107]"
              >
                <option value="">-- Choose Rider --</option>
                {riders.map((r) => (
                  <option key={r.userId || r.id} value={r.userId || r.id}>
                    {r.fullName} ({r.vehicleType} - {r.isOnline ? '🟢 Online' : '⚪ Offline'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !assignRiderId}
                onClick={handleBulkDispatch}
                className="flex-1 bg-[#FFC107] hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 rounded-xl transition shadow-glow cursor-pointer disabled:opacity-40"
              >
                {actionLoading ? 'Dispatching Batch...' : 'Confirm Bulk Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE DELIVERY HUB */}
      {/* ========================================================================= */}
      {isCreateHubModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#FFC107] uppercase tracking-wider">
                  Hub Network Provisioning
                </span>
                <h3 className="text-lg font-bold text-white">Create New Delivery Hub</h3>
              </div>
              <button
                onClick={() => setIsCreateHubModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateHub} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Hub Name *</label>
                <input
                  type="text"
                  required
                  value={newHubName}
                  onChange={(e) => setNewHubName(e.target.value)}
                  placeholder="e.g. Mirpur Logistics Hub"
                  className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Hub Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={newHubCode}
                    onChange={(e) => setNewHubCode(e.target.value)}
                    placeholder="e.g. HUB-MIR-01"
                    className="w-full bg-slate-950 border border-white/15 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Division</label>
                  <input
                    type="text"
                    value={newHubDivision}
                    onChange={(e) => setNewHubDivision(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={newHubDistrict}
                    onChange={(e) => setNewHubDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Daily Capacity (Parcels)
                  </label>
                  <input
                    type="number"
                    value={newHubCapacity}
                    onChange={(e) => setNewHubCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={newHubAddress}
                  onChange={(e) => setNewHubAddress(e.target.value)}
                  placeholder="e.g. House 42, Road 11, Mirpur-10, Dhaka"
                  className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Contact Number (Helpline)
                </label>
                <input
                  type="text"
                  value={newHubContact}
                  onChange={(e) => setNewHubContact(e.target.value)}
                  placeholder="+8801700000000"
                  className="w-full bg-slate-950 border border-white/15 text-white font-mono text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Coverage Zones (Comma Separated)
                </label>
                <input
                  type="text"
                  value={newHubCoverage}
                  onChange={(e) => setNewHubCoverage(e.target.value)}
                  placeholder="Mirpur 1, Mirpur 2, Mirpur 10, Pallabi, Kazipara"
                  className="w-full bg-slate-950 border border-white/15 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#FFC107]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateHubModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-[#FFC107] hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 rounded-xl transition shadow-glow cursor-pointer disabled:opacity-40"
                >
                  {actionLoading ? 'Creating...' : 'Create Delivery Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISPATCH MANIFEST (PRINTABLE) */}
      {/* ========================================================================= */}
      {isManifestModalOpen && manifestData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none">
            {/* Manifest Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  ZIBONBABA COURIER MANIFEST
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {manifestData.hubName} ({manifestData.hubCode}) • {manifestData.hubAddress}
                </p>
              </div>
              <button
                onClick={() => setIsManifestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 print:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Courier & Shift Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Courier</span>
                <span className="font-bold text-slate-900">{manifestData.riderName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Vehicle</span>
                <span className="font-bold text-slate-900">{manifestData.vehicle}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Date</span>
                <span className="font-bold text-slate-900">{manifestData.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Total Collectible
                </span>
                <span className="font-black text-amber-600">
                  ৳{manifestData.totalCOD.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3"># Order ID</th>
                    <th className="py-2.5 px-3">Customer & Phone</th>
                    <th className="py-2.5 px-3">Destination Address</th>
                    <th className="py-2.5 px-3">COD Amount</th>
                    <th className="py-2.5 px-3 text-center">Sig / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {manifestData.orders.map((o: any, idx: number) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold block">{o.customerName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{o.customerPhone}</span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] max-w-[160px] truncate">
                        {o.address}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        ৳{o.total.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[10px] text-slate-400">
                        [ _________ ]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Manifest Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs text-slate-500 text-center">
              <div>
                <div className="border-b border-slate-300 pb-8 mb-1" />
                <span>Hub Dispatch Officer Signature</span>
              </div>
              <div>
                <div className="border-b border-slate-300 pb-8 mb-1" />
                <span>Courier Rider Signature</span>
              </div>
            </div>

            {/* Print Button */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setIsManifestModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow flex items-center gap-2"
              >
                <Printer size={15} /> Print Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
