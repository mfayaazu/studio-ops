import React, { useState, useEffect } from 'react';
import type { Project, ProjectCreateRequest, ProjectStatus, BookingStatus, PaymentStatus } from '../types';
import type { ClientResponse } from '../../clients/types';
import { AlertTriangle, ChevronLeft, ChevronRight, Save, Trash2, Calendar, Check } from 'lucide-react';
import { projectsApi } from '../api/projectsApi';
import { formatCurrencyINR } from '../../../lib/formatters';

interface ProjectFormProps {
  initialData?: Project | null;
  clients: ClientResponse[];
  onSubmit: (data: ProjectCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDelete?: (id: string, code: string) => void;
  isReadOnly?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  clients,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  onDelete,
  isReadOnly = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [clientId, setClientId] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [title, setTitle] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('Wedding Photography');
  const [customProjectType, setCustomProjectType] = useState('');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('INQUIRY');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [status, setStatus] = useState<ProjectStatus>('LEAD');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Subtypes & events states
  const [projectSubtype, setProjectSubtype] = useState('Hindu Wedding');
  const [customProjectSubtype, setCustomProjectSubtype] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [customEvent, setCustomEvent] = useState('');

  // Schedule, location, and finance
  const [projectBudget, setProjectBudget] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [shootLocation, setShootLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [shootStartTime, setShootStartTime] = useState('');
  const [shootEndTime, setShootEndTime] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'VIP'>('MEDIUM');
  const [selectedLeadSource, setSelectedLeadSource] = useState('Instagram');
  const [customLeadSource, setCustomLeadSource] = useState('');

  // Default deliverables checklist (only for new Wedding bookings)
  const [selectedDefaultDeliverables, setSelectedDefaultDeliverables] = useState<string[]>([
    'PHOTOS', 'TEASER', 'FULL_VIDEO', 'ALBUM_SELECTION', 'ALBUM_DESIGN', 'ALBUM_PRINT', 'HARD_DISK'
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchNextCode = async (year: number) => {
    try {
      const res = await projectsApi.getNextProjectCode(year);
      setProjectCode(res.projectCode);
    } catch (err) {
      console.error('Failed to fetch next project code:', err);
    }
  };

  // Fetch sequential booking code
  useEffect(() => {
    if (!initialData) {
      const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
      fetchNextCode(year);
    }
  }, [startDate, initialData]);

  // Sync shoot date to project start/end dates
  useEffect(() => {
    if (shootDate) {
      setStartDate(shootDate);
      setEndDate(shootDate);
    }
  }, [shootDate]);

  // Auto-generate booking title dynamically for new bookings
  useEffect(() => {
    if (!initialData && !title) {
      const clientName = clients.find(c => c.id === clientId)?.fullName || '';
      const typeStr = selectedProjectType === 'Other' ? customProjectType : selectedProjectType;
      if (clientName && typeStr) {
        setTitle(`${typeStr} - ${clientName}`);
      }
    }
  }, [clientId, selectedProjectType, customProjectType, initialData]);

  // Initialize data on edit or create
  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId || '');
      setProjectCode(initialData.projectCode || '');
      setTitle(initialData.title || '');
      
      const typeOptions = ['Wedding Photography', 'Engagement', 'Birthday', 'Corporate Event', 'Maternity', 'Newborn', 'Product Shoot', 'Portrait'];
      if (typeOptions.includes(initialData.projectType)) {
        setSelectedProjectType(initialData.projectType);
        setCustomProjectType('');
      } else {
        setSelectedProjectType('Other');
        setCustomProjectType(initialData.projectType || '');
      }

      const subtypeOptions = ['Hindu Wedding', 'Muslim Wedding', 'Christian Wedding', 'Reception Only', 'Engagement + Wedding'];
      if (subtypeOptions.includes(initialData.projectSubtype || '')) {
        setProjectSubtype(initialData.projectSubtype || '');
        setCustomProjectSubtype('');
      } else if (initialData.projectSubtype) {
        setProjectSubtype('Other');
        setCustomProjectSubtype(initialData.projectSubtype);
      } else {
        setProjectSubtype('');
        setCustomProjectSubtype('');
      }

      if (initialData.projectEvents) {
        const eventsList = initialData.projectEvents.split(',').map(e => e.trim());
        const selected: string[] = [];
        let customVal = '';
        eventsList.forEach(ev => {
          if (ev.startsWith('Other:')) {
            selected.push('Other');
            customVal = ev.substring(6).trim();
          } else {
            selected.push(ev);
          }
        });
        setSelectedEvents(selected);
        setCustomEvent(customVal);
      } else {
        setSelectedEvents([]);
        setCustomEvent('');
      }

      setBookingStatus(initialData.bookingStatus || 'INQUIRY');
      setPaymentStatus(initialData.paymentStatus || 'UNPAID');
      setStatus(initialData.status || 'LEAD');
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setNotes(initialData.notes || '');

      setProjectBudget(initialData.projectBudget !== undefined && initialData.projectBudget !== null ? String(initialData.projectBudget) : '');
      setAmountPaid(initialData.amountPaid !== undefined && initialData.amountPaid !== null ? String(initialData.amountPaid) : '');
      setShootLocation(initialData.shootLocation || '');
      setGoogleMapsLink(initialData.googleMapsLink || '');
      setShootDate(initialData.shootDate || '');
      setShootStartTime(initialData.shootStartTime ? initialData.shootStartTime.substring(0, 5) : '');
      setShootEndTime(initialData.shootEndTime ? initialData.shootEndTime.substring(0, 5) : '');
      setPriority(initialData.priority || 'MEDIUM');

      const sourceOptions = ['Instagram', 'Referral', 'WhatsApp', 'Website', 'Walk-in', 'Existing Client'];
      if (sourceOptions.includes(initialData.leadSource || '')) {
        setSelectedLeadSource(initialData.leadSource || '');
        setCustomLeadSource('');
      } else if (initialData.leadSource) {
        setSelectedLeadSource('Other');
        setCustomLeadSource(initialData.leadSource);
      } else {
        setSelectedLeadSource('Instagram');
        setCustomLeadSource('');
      }
    } else {
      setClientId(clients[0]?.id || '');
      setProjectCode('');
      setTitle('');
      setSelectedProjectType('Wedding Photography');
      setCustomProjectType('');
      setProjectSubtype('Hindu Wedding');
      setCustomProjectSubtype('');
      setSelectedEvents([]);
      setCustomEvent('');
      setBookingStatus('INQUIRY');
      setPaymentStatus('UNPAID');
      setStatus('LEAD');
      setStartDate('');
      setEndDate('');
      setNotes('');
      setProjectBudget('');
      setAmountPaid('');
      setShootLocation('');
      setGoogleMapsLink('');
      setShootDate('');
      setShootStartTime('');
      setShootEndTime('');
      setPriority('MEDIUM');
      setSelectedLeadSource('Instagram');
      setCustomLeadSource('');
      setSelectedDefaultDeliverables(['PHOTOS', 'TEASER', 'FULL_VIDEO', 'ALBUM_SELECTION', 'ALBUM_DESIGN', 'ALBUM_PRINT', 'HARD_DISK']);
    }
    setValidationError(null);
    setCurrentStep(1);
  }, [initialData, clients]);

  // Step-level validations
  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!projectCode.trim()) {
        setValidationError('Booking Code is required.');
        return false;
      }
      const typeStr = selectedProjectType === 'Other' ? customProjectType.trim() : selectedProjectType;
      if (!typeStr) {
        setValidationError('Please specify the Booking Type.');
        return false;
      }
      if (!title.trim()) {
        setValidationError('Booking Title / Name is required.');
        return false;
      }
    }
    if (step === 2) {
      if (selectedProjectType === 'Wedding Photography') {
        const subtypeStr = projectSubtype === 'Other' ? customProjectSubtype.trim() : projectSubtype;
        if (!subtypeStr) {
          setValidationError('Please specify the wedding subcategory.');
          return false;
        }
        if (selectedEvents.includes('Other') && !customEvent.trim()) {
          setValidationError('Please specify the custom wedding event.');
          return false;
        }
      }
    }
    if (step === 3) {
      if (!clientId) {
        setValidationError('A Client link is required. Please select a client.');
        return false;
      }
    }
    if (step === 4) {
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setValidationError('Start date cannot be after the end date.');
        return false;
      }
    }
    if (step === 5) {
      if (projectBudget && isNaN(Number(projectBudget))) {
        setValidationError('Project Budget must be a number.');
        return false;
      }
      if (amountPaid && isNaN(Number(amountPaid))) {
        setValidationError('Amount Paid must be a number.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5)) {
      return;
    }

    const typeStr = selectedProjectType === 'Other' ? customProjectType.trim() : selectedProjectType;
    let subtypeStr = undefined;
    if (selectedProjectType === 'Wedding Photography') {
      subtypeStr = projectSubtype === 'Other' ? customProjectSubtype.trim() : projectSubtype;
    }

    let eventsStr = undefined;
    if (selectedProjectType === 'Wedding Photography' && selectedEvents.length > 0) {
      const parts = selectedEvents.map(ev => {
        if (ev === 'Other') {
          return `Other: ${customEvent.trim()}`;
        }
        return ev;
      });
      eventsStr = parts.join(', ');
    }

    const defaultDelivList = (!initialData && selectedProjectType === 'Wedding Photography')
      ? selectedDefaultDeliverables
      : undefined;

    const payload: ProjectCreateRequest = {
      clientId,
      assignedProjectManagerId: undefined,
      projectCode: projectCode.trim(),
      title: title.trim(),
      projectType: typeStr,
      bookingStatus,
      paymentStatus,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      
      projectSubtype: subtypeStr || undefined,
      projectEvents: eventsStr || undefined,
      projectBudget: projectBudget ? Number(projectBudget) : undefined,
      amountPaid: amountPaid ? Number(amountPaid) : undefined,
      shootLocation: shootLocation.trim() || undefined,
      googleMapsLink: googleMapsLink.trim() || undefined,
      shootDate: shootDate || undefined,
      shootStartTime: shootStartTime ? `${shootStartTime}:00` : undefined,
      shootEndTime: shootEndTime ? `${shootEndTime}:00` : undefined,
      priority,
      leadSource: selectedLeadSource === 'Other' ? customLeadSource.trim() : selectedLeadSource,
      defaultDeliverables: defaultDelivList,
    };

    await onSubmit(payload);
  };

  const displayedError = validationError || submitError;
  const showPaymentWarning = projectBudget && amountPaid && Number(amountPaid) > Number(projectBudget);
  const clientName = clients.find(c => c.id === clientId)?.fullName || 'Unlinked';

  const stepsList = [
    { number: 1, label: 'Type' },
    { number: 2, label: 'Events' },
    { number: 3, label: 'Client' },
    { number: 4, label: 'Schedule' },
    { number: 5, label: 'Budget' },
    { number: 6, label: 'Review' },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      
      {/* Wizard Header Stepper */}
      <div className="mb-6 flex-none">
        {/* Desktop Stepper */}
        <div className="hidden sm:flex items-center justify-between relative px-2">
          <div className="absolute left-6 right-6 top-1/2 h-[2px] bg-slate-850 -translate-y-1/2 -z-10" />
          <div 
            className="absolute left-6 top-1/2 h-[2px] bg-gradient-to-r from-violet-600 to-fuchsia-600 -translate-y-1/2 -z-10 transition-all duration-350"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          />

          {stepsList.map((s) => {
            const isActive = s.number === currentStep;
            const isCompleted = s.number < currentStep;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < currentStep) {
                    setCurrentStep(s.number);
                  } else if (s.number > currentStep) {
                    let canGo = true;
                    for (let i = currentStep; i < s.number; i++) {
                      if (!validateStep(i)) {
                        canGo = false;
                        break;
                      }
                    }
                    if (canGo) {
                      setCurrentStep(s.number);
                    }
                  }
                }}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                  isActive 
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30 scale-110'
                    : isCompleted
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 border-violet-500 text-white'
                      : 'bg-[#090d16] border-slate-800 text-slate-500 group-hover:border-slate-700'
                }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.number}
                </div>
                <span className={`text-[9px] font-semibold tracking-wider uppercase transition-colors duration-300 ${
                  isActive ? 'text-violet-400 font-bold' : isCompleted ? 'text-slate-350' : 'text-slate-550'
                }`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Stepper */}
        <div className="flex sm:hidden items-center justify-between bg-slate-900/40 border border-slate-850 rounded-xl p-3">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">
              Step {currentStep} of 6
            </span>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {stepsList[currentStep - 1].label}
            </h4>
          </div>
          <div className="flex gap-1.5">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep 
                    ? 'w-4 bg-violet-500' 
                    : i + 1 < currentStep 
                      ? 'w-2 bg-violet-600/60' 
                      : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Display Errors */}
      {displayedError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2 mb-4 flex-none">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      {/* Steps Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-280px)] pr-1">
        <fieldset disabled={isSubmitting || isReadOnly} className="space-y-5 border-0 p-0 m-0">

          {/* STEP 1: Booking Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Booking Code (Read-Only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={projectCode}
                      placeholder="Generating code..."
                      className="w-full bg-[#0d1424] border border-slate-900 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none transition-colors font-mono cursor-not-allowed opacity-75"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Booking Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedProjectType}
                      onChange={(e) => setSelectedProjectType(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      <option value="Wedding Photography">Wedding Photography</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Maternity">Maternity</option>
                      <option value="Newborn">Newborn</option>
                      <option value="Product Shoot">Product Shoot</option>
                      <option value="Portrait">Portrait</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {selectedProjectType === 'Other' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Specify Custom Booking Type <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customProjectType}
                      onChange={(e) => setCustomProjectType(e.target.value)}
                      placeholder="e.g. Fashion Portfolio"
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Booking Title / Folder Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Priya & Rahul Wedding"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500">
                    Give this booking a recognizable title, typically client names and shoot type.
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-slate-900/10 p-3 rounded-lg border border-slate-850">
                💡 **Booking Type**: Choose the kind of shoot or event this booking is for.
              </div>
            </div>
          )}

          {/* STEP 2: Events & Functions */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {selectedProjectType === 'Wedding Photography' ? (
                <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Wedding Subcategory <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={projectSubtype}
                      onChange={(e) => setProjectSubtype(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      <option value="Hindu Wedding">Hindu Wedding</option>
                      <option value="Muslim Wedding">Muslim Wedding</option>
                      <option value="Christian Wedding">Christian Wedding</option>
                      <option value="Reception Only">Reception Only</option>
                      <option value="Engagement + Wedding">Engagement + Wedding</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {projectSubtype === 'Other' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Specify Custom Subcategory <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customProjectSubtype}
                        onChange={(e) => setCustomProjectSubtype(e.target.value)}
                        placeholder="Specify subcategory..."
                        className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  )}

                  <div className="space-y-2 border border-slate-800/80 p-3 rounded-lg bg-[#070b12]">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Include Functions / Event Events
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['Haldi', 'Mehendi', 'Sangeet', 'Ring Ceremony', 'Wedding Ceremony', 'Reception', 'Nikah', 'Bride/Groom Prep', 'Couple Shoot', 'Other'].map(ev => {
                        const isChecked = selectedEvents.includes(ev);
                        return (
                          <label key={ev} className="flex items-center gap-2 text-xs text-slate-350 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEvents([...selectedEvents, ev]);
                                } else {
                                  setSelectedEvents(selectedEvents.filter(x => x !== ev));
                                }
                              }}
                              className="rounded border-slate-800 bg-[#090d16] text-violet-600 focus:ring-violet-500 h-3.5 w-3.5"
                            />
                            <span>{ev}</span>
                          </label>
                        );
                      })}
                    </div>

                    {selectedEvents.includes('Other') && (
                      <div className="space-y-1 mt-2">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Specify Custom Event Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customEvent}
                          onChange={(e) => setCustomEvent(e.target.value)}
                          placeholder="Specify custom event..."
                          className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/10 border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs space-y-2">
                  <Calendar className="h-8 w-8 mx-auto text-slate-655" />
                  <p className="font-semibold">No additional wedding functions needed.</p>
                  <p className="text-[10px] text-slate-500">
                    This step only applies to Wedding Photography shoots. You can safely proceed to the next step.
                  </p>
                </div>
              )}
              <div className="text-xs text-slate-500 bg-slate-900/10 p-3 rounded-lg border border-slate-850">
                💡 **Events & Functions**: Select all functions included in this booking.
              </div>
            </div>
          )}

          {/* STEP 3: Client Selection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Client Link / Lead Contact <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {clients.length === 0 && (
                      <option value="">No clients available</option>
                    )}
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.email || c.phone || 'No Contact Data'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-slate-900/10 p-3 rounded-lg border border-slate-850">
                💡 **Client Selection**: Link this booking to the client who is paying or coordinating.
              </div>
            </div>
          )}

          {/* STEP 4: Shoot Details & Schedule */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Shoot Date
                    </label>
                    <input
                      type="date"
                      value={shootDate}
                      onChange={(e) => setShootDate(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={shootStartTime}
                      onChange={(e) => setShootStartTime(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={shootEndTime}
                      onChange={(e) => setShootEndTime(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Shoot Location
                    </label>
                    <input
                      type="text"
                      value={shootLocation}
                      onChange={(e) => setShootLocation(e.target.value)}
                      placeholder="e.g. Taj Lands End, Mumbai"
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Google Maps Link
                    </label>
                    <input
                      type="url"
                      value={googleMapsLink}
                      onChange={(e) => setGoogleMapsLink(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Source of Lead
                    </label>
                    <select
                      value={selectedLeadSource}
                      onChange={(e) => setSelectedLeadSource(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Referral">Referral</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Website">Website</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Existing Client">Existing Client</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {selectedLeadSource === 'Other' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Specify Custom Source <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customLeadSource}
                      onChange={(e) => setCustomLeadSource(e.target.value)}
                      placeholder="Specify custom source..."
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Booking Funnel Stage
                    </label>
                    <select
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      <option value="INQUIRY">Inquiry</option>
                      <option value="QUOTED">Quoted</option>
                      <option value="CONTRACT_SIGNED">Contract Signed</option>
                      <option value="DEPOSIT_PAID">Deposit Paid</option>
                      <option value="FULLY_BOOKED">Fully Booked</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      <option value="UNPAID">Unpaid</option>
                      <option value="PARTIALLY_PAID">Partially Paid</option>
                      <option value="FULLY_PAID">Fully Paid</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Workflow Pipeline State
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                    >
                      <option value="LEAD">Lead</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="SHOOT_COMPLETED">Shoot Completed</option>
                      <option value="POST_PRODUCTION">Post Production</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="ARCHIVED">Archived</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Internal Studio Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide details on client preferences, shooting style guidelines, gear notes..."
                    rows={3}
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-slate-900/10 p-3 rounded-lg border border-slate-850">
                💡 **Shoot Details**: Add the shoot schedule and location so your team can plan properly.
              </div>
            </div>
          )}

          {/* STEP 5: Budget & Delivery Items */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/20 border border-slate-850 rounded-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Booking Budget (INR)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 180000"
                      value={projectBudget}
                      onChange={(e) => setProjectBudget(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Amount Paid (INR)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 60000"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {showPaymentWarning && (
                  <div className="text-amber-500 text-xs flex items-center gap-1.5 mt-1 font-medium bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Amount paid exceeds booking budget. Please verify values.</span>
                  </div>
                )}

                {/* Pre-production checklists */}
                {!initialData && selectedProjectType === 'Wedding Photography' && (
                  <div className="space-y-3 border border-slate-800/80 p-3 rounded-lg bg-[#070b12] mt-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Select Deliverables to Auto-Create
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { code: 'PHOTOS', label: 'High-Res Photos (Standard Edit)' },
                        { code: 'TEASER', label: 'Wedding Teaser Film (1-3 mins)' },
                        { code: 'FULL_VIDEO', label: 'Full Documentary Film' },
                        { code: 'ALBUM_SELECTION', label: 'Client Photo Album Selection' },
                        { code: 'ALBUM_DESIGN', label: 'Photo Album Layout Design' },
                        { code: 'ALBUM_PRINT', label: 'Printed Premium Album Book' },
                        { code: 'HARD_DISK', label: 'Raw Media Shipment (Hard Drive)' }
                      ].map(item => {
                        const isChecked = selectedDefaultDeliverables.includes(item.code);
                        return (
                          <label key={item.code} className="flex items-center gap-2.5 text-xs text-slate-350 select-none cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDefaultDeliverables([...selectedDefaultDeliverables, item.code]);
                                } else {
                                  setSelectedDefaultDeliverables(selectedDefaultDeliverables.filter(x => x !== item.code));
                                }
                              }}
                              className="rounded border-slate-800 bg-[#090d16] text-violet-600 focus:ring-violet-500 h-3.5 w-3.5"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500 bg-slate-900/10 p-3 rounded-lg border border-slate-850">
                💡 **Budget & Deliverables**: Track payments and select default items to create after the shoot.
              </div>
            </div>
          )}

          {/* STEP 6: Review & Confirmation */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                  Verify Booking Summary
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs leading-relaxed text-slate-300">
                  <div className="flex justify-between border-b border-slate-855 py-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Booking Code:</span>
                    <span className="font-mono text-slate-200">{projectCode}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-855 py-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Booking Type:</span>
                    <span className="text-slate-200">{selectedProjectType === 'Other' ? customProjectType : selectedProjectType}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-855 py-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Client Link:</span>
                    <span className="text-slate-200 truncate max-w-[150px]">{clientName}</span>
                  </div>

                  {selectedProjectType === 'Wedding Photography' && (
                    <div className="flex justify-between border-b border-slate-855 py-1">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Subcategory:</span>
                      <span className="text-slate-200">{projectSubtype === 'Other' ? customProjectSubtype : projectSubtype}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-slate-855 py-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Shoot Date:</span>
                    <span className="text-slate-200">{shootDate || 'Not Scheduled'}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-855 py-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Shoot Hours:</span>
                    <span className="text-slate-200">
                      {shootStartTime && shootEndTime ? `${shootStartTime} - ${shootEndTime}` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-855 py-1 col-span-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Shoot Location:</span>
                    <span className="text-slate-200 truncate">{shootLocation || 'TBD'}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-855 py-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Total Budget:</span>
                    <span className="text-slate-200 font-semibold">{formatCurrencyINR(projectBudget ? Number(projectBudget) : 0)}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-855 py-1">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Amount Paid:</span>
                    <span className="text-emerald-400 font-semibold">{formatCurrencyINR(amountPaid ? Number(amountPaid) : 0)}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-855 py-1 col-span-1 sm:col-span-2">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Balance Due:</span>
                    <span className="text-rose-400 font-bold">
                      {formatCurrencyINR(Math.max(0, (Number(projectBudget || 0) - Number(amountPaid || 0))))}
                    </span>
                  </div>

                  {selectedEvents.length > 0 && selectedProjectType === 'Wedding Photography' && (
                    <div className="col-span-1 sm:col-span-2 py-1 space-y-1">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">Selected Functions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEvents.map(ev => (
                          <span key={ev} className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[10px] text-slate-350">
                            {ev === 'Other' ? `Other: ${customEvent}` : ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!initialData && selectedDefaultDeliverables.length > 0 && selectedProjectType === 'Wedding Photography' && (
                    <div className="col-span-1 sm:col-span-2 py-1 space-y-1">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">Auto-Created Deliverables:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDefaultDeliverables.map(d => (
                          <span key={d} className="bg-violet-950/20 border border-violet-800/20 px-2 py-0.5 rounded text-[9px] text-violet-300">
                            ✓ {d.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500 bg-slate-900/10 p-3 rounded-lg border border-slate-850">
                💡 **Final Step**: Review all details carefully. Click Back to adjust, or Save Booking to create this project.
              </div>
            </div>
          )}

        </fieldset>
      </div>

      {/* Stepper Footer Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-850 flex-none mt-4">
        {initialData && onDelete && !isReadOnly && currentStep === 1 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onDelete(initialData.id, initialData.projectCode)}
            className="px-3 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-350 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>

          {currentStep > 1 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleBack}
              className="bg-[#0f172a] border border-slate-850 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg transition-all cursor-pointer flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            !isReadOnly && (
              <button
                type="submit"
                disabled={isSubmitting || clients.length === 0}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5 animate-pulse" />
                {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Booking'}
              </button>
            )
          )}
        </div>
      </div>
    </form>
  );
};
