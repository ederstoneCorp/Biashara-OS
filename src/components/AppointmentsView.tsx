import React, { useState, useEffect } from 'react';
import { AppointmentItem } from '../types/index.ts';
import { formatKES } from '../utils/businessMath.ts';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);

  // Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceName, setServiceName] = useState('Solar Backup Installation & Inspection');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [staffUserId, setStaffUserId] = useState<number | ''>('');
  const [price, setPrice] = useState('5000');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [apptRes, staffRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/employees'),
      ]);
      const [apptData, staffData] = await Promise.all([apptRes.json(), staffRes.json()]);
      setAppointments(apptData);
      setStaffList(staffData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !serviceName) return;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          serviceName,
          appointmentDate,
          startTime,
          endTime,
          staffUserId: staffUserId || null,
          price: parseInt(price, 10) || 0,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to book appointment');
      setShowBookModal(false);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Appointments & Client Bookings</h1>
          <p className="text-xs text-slate-400">Schedule technical consultations, service repairs, and specialist on-site visits</p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appt: any) => (
          <div key={appt.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {appt.appointmentDate}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    appt.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                      : appt.status === 'confirmed'
                      ? 'bg-teal-950 text-teal-400 border border-teal-800/40'
                      : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                  }`}
                >
                  {appt.status}
                </span>
              </div>

              <h2 className="font-bold text-sm text-white">{appt.serviceName}</h2>

              <div className="space-y-1.5 text-xs text-slate-400 mt-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-200">
                    {appt.startTime} – {appt.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-white font-medium">{appt.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-300">{appt.customerPhone}</span>
                </div>
                {appt.staffName && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    Specialist: <strong className="text-slate-200">{appt.staffName}</strong>
                  </div>
                )}
              </div>

              {appt.notes && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 mt-3">
                  {appt.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-white text-sm">{formatKES(appt.price || 0)}</span>

              <div className="flex items-center gap-1.5">
                {appt.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusChange(appt.id, 'completed')}
                    className="px-2 py-1 rounded bg-emerald-950 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/60 font-medium text-[11px] transition-colors"
                  >
                    Mark Done
                  </button>
                )}
                {appt.status !== 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange(appt.id, 'cancelled')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 font-medium text-[11px] transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white">Schedule Appointment</h2>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Karanja"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0722123456"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Service Required *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Inverter Installation & Commissioning"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Date *</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Assign Specialist</label>
                  <select
                    value={staffUserId}
                    onChange={(e) => setStaffUserId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Unassigned</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Service Fee (KES)</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Appointment Location / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Customer premises in Runda, gate pass required"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
