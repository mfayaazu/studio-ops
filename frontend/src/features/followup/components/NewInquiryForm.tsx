import React, { useState, useEffect } from 'react';
import type { LeadCreateRequest, LeadPreferredChannel, LeadSource } from '../types';
import { X, Loader2, User, Phone, Mail, MapPin, IndianRupee, Calendar, Clock, Sparkles } from 'lucide-react';

interface CalendarPopoverProps {
  selectedDate: string;
  onChange: (dateStr: string) => void;
  onClose: () => void;
}

const CalendarPopover: React.FC<CalendarPopoverProps> = ({ selectedDate, onChange, onClose }) => {
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstWeekday = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday = getFirstWeekday(viewYear, viewMonth);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [selY, selM, selD] = selectedDate.split('-').map(Number);
    return selY === viewYear && (selM - 1) === viewMonth && selD === day;
  };

  const handleDayClick = (day: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
    onClose();
  };

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div 
      className="absolute right-0 mt-1.5 p-3 bg-slate-905 border border-slate-800 rounded-xl shadow-2xl z-50 w-72 animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="px-2 py-0.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-205 transition-all text-[10px] font-bold font-mono cursor-pointer"
        >
          &lt;
        </button>
        <span className="text-xs font-bold text-slate-200 font-mono">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="px-2 py-0.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-205 transition-all text-[10px] font-bold font-mono cursor-pointer"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekdayHeaders.map((day) => (
          <span key={day} className="text-[9px] font-bold text-slate-500 uppercase font-mono">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dayIsToday = isToday(day);
          const dayIsSelected = isSelected(day);

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={(e) => handleDayClick(day, e)}
              className={`h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer transition-all ${
                dayIsSelected
                  ? 'bg-violet-600 text-white shadow-md'
                  : dayIsToday
                  ? 'border border-violet-500/50 text-violet-400 bg-violet-500/5'
                  : 'text-slate-355 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange('');
            onClose();
          }}
          className="text-[10px] text-rose-400 hover:text-rose-350 font-semibold font-mono cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="text-[10px] text-slate-400 hover:text-slate-300 font-semibold font-mono cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface TimePickerPopoverProps {
  selectedTime: string;
  onChange: (timeStr: string) => void;
  onClose: () => void;
}

const TimePickerPopover: React.FC<TimePickerPopoverProps> = ({ selectedTime, onChange, onClose }) => {
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleSlotClick = (slot: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(slot);
    onClose();
  };

  return (
    <div 
      className="absolute right-0 mt-1.5 p-3 bg-slate-905 border border-slate-800 rounded-xl shadow-2xl z-50 w-48 animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 font-mono">
        Select Time Slot
      </div>
      
      <div className="grid grid-cols-2 gap-1.5">
        {timeSlots.map((slot) => {
          const isSelected = selectedTime === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={(e) => handleSlotClick(slot, e)}
              className={`py-1.5 rounded-lg text-xs font-semibold text-center cursor-pointer transition-all ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-355 bg-slate-850 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              {slot}
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange('');
            onClose();
          }}
          className="text-[10px] text-rose-400 hover:text-rose-355 font-semibold font-mono cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="text-[10px] text-slate-400 hover:text-slate-300 font-semibold font-mono cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

interface NewInquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: LeadCreateRequest) => Promise<void>;
}

export const NewInquiryForm: React.FC<NewInquiryFormProps> = ({ isOpen, onClose, onSubmit }) => {
  // Form field states
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<LeadPreferredChannel>('EMAIL');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [city, setCity] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('WEBSITE');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [activePopover, setActivePopover] = useState<'eventDate' | 'followUpDate' | 'followUpTime' | null>(null);

  useEffect(() => {
    const handleDocumentClick = () => {
      setActivePopover(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!clientName.trim()) {
      errors.clientName = 'Client Name is required';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Enter a valid email address';
      }
    }

    if (estimatedValue.trim()) {
      const parsedVal = parseFloat(estimatedValue);
      if (isNaN(parsedVal) || parsedVal <= 0) {
        errors.estimatedValue = 'Estimated Value must be a positive number';
      }
    }

    if (followUpTime && !followUpDate) {
      errors.followUpDate = 'Please select a follow-up date as well.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: LeadCreateRequest = {
        clientName: clientName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        preferredChannel,
        eventType: eventType.trim() || undefined,
        eventDate: eventDate || undefined,
        city: city.trim() || undefined,
        estimatedValue: estimatedValue.trim() ? parseFloat(estimatedValue) : undefined,
        leadSource,
        nextFollowUpAt: (() => {
          if (followUpDate) {
            const timePart = followUpTime || '10:00';
            return new Date(`${followUpDate}T${timePart}`).toISOString();
          }
          return undefined;
        })(),
        notes: notes.trim() || undefined
      };

      await onSubmit(payload);

      // Reset form fields upon successful create
      setClientName('');
      setPhone('');
      setEmail('');
      setPreferredChannel('EMAIL');
      setEventType('');
      setEventDate('');
      setCity('');
      setEstimatedValue('');
      setLeadSource('WEBSITE');
      setFollowUpDate('');
      setFollowUpTime('');
      setNotes('');
      onClose();
    } catch (err: any) {
      console.error('Failed to submit new inquiry:', err);
      setErrorMessage(
        err?.message || 'Failed to create inquiry. Ensure the backend server is online and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg bg-[#0a0f1d] border-l border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-slideIn">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
              Inquiry Management
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Register New Inquiry</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Error notification banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-mono flex items-start justify-between gap-2">
              <span>{errorMessage}</span>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-[9px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>
          )}

          <form id="new-inquiry-form" onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Client Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                <User className="h-3 w-3 text-slate-500" />
                <span>Client Name *</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Priya Reddy"
                className={`w-full bg-[#0d1222]/40 border ${
                  validationErrors.clientName ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-800 focus:ring-violet-500'
                } text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none transition-all`}
              />
              {validationErrors.clientName && (
                <span className="text-[10px] text-rose-400 block font-mono">{validationErrors.clientName}</span>
              )}
            </div>

            {/* Phone & Email (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className={`w-full bg-[#0d1222]/40 border ${
                    validationErrors.email ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-800 focus:ring-violet-500'
                  } text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none transition-all`}
                />
                {validationErrors.email && (
                  <span className="text-[10px] text-rose-400 block font-mono">{validationErrors.email}</span>
                )}
              </div>
            </div>

            {/* Preferred Channel & Lead Source (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                  Preferred Channel *
                </label>
                <select
                  value={preferredChannel}
                  onChange={(e) => setPreferredChannel(e.target.value as LeadPreferredChannel)}
                  className="w-full bg-[#0d1222]/60 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                >
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="MANUAL">Manual Outbox</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                  Lead Source *
                </label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full bg-[#0d1222]/60 border border-slate-800 text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                >
                  <option value="WEBSITE">Website Form</option>
                  <option value="WHATSAPP">WhatsApp chat</option>
                  <option value="INSTAGRAM">Instagram DM</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="WALK_IN">Walk In</option>
                  <option value="PHONE_CALL">Phone Call</option>
                  <option value="EMAIL">Direct Email</option>
                  <option value="MANUAL">Manual Logging</option>
                  <option value="IMPORT">CSV Import</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Event Type & Event Date (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-slate-500" />
                  <span>Event Type</span>
                </label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="Wedding Photography"
                  className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span>Event Date</span>
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePopover(activePopover === 'eventDate' ? null : 'eventDate');
                  }}
                  className="w-full bg-[#0d1222]/40 border border-slate-800 hover:border-slate-700/80 cursor-pointer text-left text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all flex items-center justify-between"
                >
                  <span className={eventDate ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {eventDate ? formatDateDisplay(eventDate) : 'Select event date'}
                  </span>
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                </button>
                {activePopover === 'eventDate' && (
                  <CalendarPopover
                    selectedDate={eventDate}
                    onChange={setEventDate}
                    onClose={() => setActivePopover(null)}
                  />
                )}
              </div>
            </div>

            {/* City & Estimated Value (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-slate-500" />
                  <span>City / Location</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hyderabad"
                  className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                  <IndianRupee className="h-3 w-3 text-slate-500" />
                  <span>Estimated Value (INR)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-500 text-xs font-semibold select-none">₹</span>
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    placeholder="150000"
                    className={`w-full bg-[#0d1222]/40 border ${
                      validationErrors.estimatedValue ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-800 focus:ring-violet-500'
                    } text-slate-200 rounded-lg py-2.5 pl-7 pr-2.5 text-xs focus:ring-1 focus:outline-none transition-all`}
                  />
                </div>
                {validationErrors.estimatedValue && (
                  <span className="text-[10px] text-rose-400 block font-mono mt-1">{validationErrors.estimatedValue}</span>
                )}
              </div>
            </div>

            {/* Next Follow-up Date & Time fields */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    <span>Next Follow-up Date</span>
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(activePopover === 'followUpDate' ? null : 'followUpDate');
                    }}
                    className={`w-full bg-[#0d1222]/40 border ${
                      validationErrors.followUpDate ? 'border-rose-500/50 focus:ring-rose-500' : 'border-slate-800 hover:border-slate-700/80'
                    } cursor-pointer text-left text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:outline-none transition-all flex items-center justify-between`}
                  >
                    <span className={followUpDate ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                      {followUpDate ? formatDateDisplay(followUpDate) : 'Select follow-up date'}
                    </span>
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                  {validationErrors.followUpDate && (
                    <span className="text-[10px] text-rose-400 block font-mono mt-0.5">{validationErrors.followUpDate}</span>
                  )}
                  {activePopover === 'followUpDate' && (
                    <CalendarPopover
                      selectedDate={followUpDate}
                      onChange={setFollowUpDate}
                      onClose={() => setActivePopover(null)}
                    />
                  )}
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>Next Follow-up Time</span>
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePopover(activePopover === 'followUpTime' ? null : 'followUpTime');
                    }}
                    className="w-full bg-[#0d1222]/40 border border-slate-800 hover:border-slate-700/80 cursor-pointer text-left text-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all flex items-center justify-between"
                  >
                    <span className={followUpTime ? 'text-slate-200 font-medium' : 'text-slate-505'}>
                      {followUpTime || 'Select follow-up time'}
                    </span>
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                  {activePopover === 'followUpTime' && (
                    <TimePickerPopover
                      selectedTime={followUpTime}
                      onChange={setFollowUpTime}
                      onClose={() => setActivePopover(null)}
                    />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Used to remind the team when this lead should be followed up.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                Notes / Requirements
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Requested traditional albums and raw video footages..."
                className="w-full bg-[#0d1222]/40 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all resize-none"
              />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end gap-2.5">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-2 px-4 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="new-inquiry-form"
            disabled={isSubmitting}
            className="py-2 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Inquiry</span>
            )}
          </button>
        </div>

      </div>
    </>
  );
};
