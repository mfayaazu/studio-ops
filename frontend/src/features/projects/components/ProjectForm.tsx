import React, { useState, useEffect } from 'react';
import type { Project, ProjectCreateRequest, ProjectStatus, BookingStatus, PaymentStatus } from '../types';
import type { ClientResponse } from '../../clients/types';
import { AlertTriangle } from 'lucide-react';
import { projectsApi } from '../api/projectsApi';

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

  // New states
  const [projectSubtype, setProjectSubtype] = useState('Hindu Wedding');
  const [customProjectSubtype, setCustomProjectSubtype] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [customEvent, setCustomEvent] = useState('');

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

  const [createDefaultDeliverables, setCreateDefaultDeliverables] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fetchNextCode = async (year: number) => {
    try {
      const res = await projectsApi.getNextProjectCode(year);
      setProjectCode(res.projectCode);
    } catch (err) {
      console.error('Failed to fetch next project code:', err);
    }
  };

  useEffect(() => {
    if (!initialData) {
      const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
      fetchNextCode(year);
    }
  }, [startDate, initialData]);

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

      setCreateDefaultDeliverables(false);
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
      setCreateDefaultDeliverables(false);
    }
    setValidationError(null);
  }, [initialData, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!clientId) {
      setValidationError('Client Link is required.');
      return;
    }
    if (!projectCode.trim()) {
      setValidationError('Project Code is required.');
      return;
    }
    if (!title.trim()) {
      setValidationError('Project Title is required.');
      return;
    }

    const typeStr = selectedProjectType === 'Other' ? customProjectType.trim() : selectedProjectType;
    if (!typeStr) {
      setValidationError('Please specify project type.');
      return;
    }

    let subtypeStr = undefined;
    if (selectedProjectType === 'Wedding Photography') {
      subtypeStr = projectSubtype === 'Other' ? customProjectSubtype.trim() : projectSubtype;
      if (!subtypeStr) {
        setValidationError('Please specify wedding subcategory.');
        return;
      }
    }

    let eventsStr = undefined;
    if (selectedProjectType === 'Wedding Photography' && selectedEvents.length > 0) {
      try {
        const parts = selectedEvents.map(e => {
          if (e === 'Other') {
            if (!customEvent.trim()) {
              throw new Error('Please specify event type.');
            }
            return `Other: ${customEvent.trim()}`;
          }
          return e;
        });
        eventsStr = parts.join(', ');
      } catch (err: any) {
        setValidationError(err.message);
        return;
      }
    }

    // Validate that startDate is not after endDate
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setValidationError('Start Date cannot be after End Date.');
      return;
    }

    if (projectBudget && isNaN(Number(projectBudget))) {
      setValidationError('Project Budget must be a numeric value.');
      return;
    }
    if (amountPaid && isNaN(Number(amountPaid))) {
      setValidationError('Amount Paid must be a numeric value.');
      return;
    }

    const defaultDelivList = (createDefaultDeliverables && selectedProjectType === 'Wedding Photography')
      ? ['PHOTOS', 'TEASER', 'FULL_VIDEO', 'ALBUM_SELECTION', 'ALBUM_DESIGN', 'ALBUM_PRINT', 'HARD_DISK']
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-220px)] space-y-4 pr-1">
        {displayedError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        <fieldset disabled={isSubmitting || isReadOnly} className="space-y-4 border-0 p-0 m-0">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Project Code (Read-Only) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled
              value={projectCode}
              placeholder={initialData ? "" : "Generating sequential code..."}
              className="w-full bg-[#0d1424] border border-slate-900 rounded-lg px-3 py-2 text-sm text-slate-400 focus:outline-none transition-colors font-mono cursor-not-allowed opacity-75"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Client Link <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={isSubmitting || clients.length === 0}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              {clients.length === 0 && (
                <option value="">No clients available</option>
              )}
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.email || c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Project Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={isSubmitting}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fayaaz & Fatima - Destination Wedding"
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Project Type <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={isSubmitting}
              value={selectedProjectType}
              onChange={(e) => setSelectedProjectType(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Assigned PM (Read-Only)
            </label>
            <input
              type="text"
              disabled
              value="Project Manager allocation disabled (will be enabled after User/Auth)"
              className="w-full bg-[#0d1424] border border-slate-900 rounded-lg px-3 py-2 text-[11px] text-slate-500 focus:outline-none cursor-not-allowed font-medium"
            />
          </div>
        </div>

        {selectedProjectType === 'Other' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Please specify project type <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={customProjectType}
              onChange={(e) => setCustomProjectType(e.target.value)}
              placeholder="Please specify project type"
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        )}

        {selectedProjectType === 'Wedding Photography' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Wedding Subcategory <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={isSubmitting}
                value={projectSubtype}
                onChange={(e) => setProjectSubtype(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
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
                  Please specify subcategory <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={customProjectSubtype}
                  onChange={(e) => setCustomProjectSubtype(e.target.value)}
                  placeholder="Please specify subcategory"
                  className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                />
              </div>
            )}

            <div className="space-y-2 border border-slate-800/80 p-3 rounded-lg bg-[#070b12]">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Wedding Events (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Haldi', 'Mehendi', 'Sangeet', 'Ring Ceremony', 'Wedding Ceremony', 'Reception', 'Nikah', 'Bride/Groom Prep', 'Couple Shoot', 'Other'].map(ev => {
                  const isChecked = selectedEvents.includes(ev);
                  return (
                    <label key={ev} className="flex items-center gap-2 text-xs text-slate-350 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isSubmitting}
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
                    Please specify event type <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={customEvent}
                    onChange={(e) => setCustomEvent(e.target.value)}
                    placeholder="Please specify event type"
                    className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Booking Status
            </label>
            <select
              disabled={isSubmitting}
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
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
              disabled={isSubmitting}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            >
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="FULLY_PAID">Fully Paid</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Pipeline Status
            </label>
            <select
              disabled={isSubmitting}
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Start Date
            </label>
            <input
              type="date"
              disabled={isSubmitting}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              End Date
            </label>
            <input
              type="date"
              disabled={isSubmitting}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Project Budget (INR)
            </label>
            <input
              type="text"
              placeholder="e.g. 150000"
              disabled={isSubmitting}
              value={projectBudget}
              onChange={(e) => setProjectBudget(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Amount Paid (INR)
            </label>
            <input
              type="text"
              placeholder="e.g. 50000"
              disabled={isSubmitting}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
            />
            {showPaymentWarning && (
              <div className="text-amber-500 text-xs flex items-center gap-1.5 mt-1 font-medium bg-amber-500/10 border border-amber-500/20 p-2 rounded">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Amount Paid is greater than the Project Budget.</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Shoot Location
            </label>
            <input
              type="text"
              placeholder="e.g. Taj Mahal Hotel, Mumbai"
              disabled={isSubmitting}
              value={shootLocation}
              onChange={(e) => setShootLocation(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Google Maps Link
            </label>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              disabled={isSubmitting}
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Shoot Date
            </label>
            <input
              type="date"
              disabled={isSubmitting}
              value={shootDate}
              onChange={(e) => setShootDate(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Shoot Start Time
            </label>
            <input
              type="time"
              disabled={isSubmitting}
              value={shootStartTime}
              onChange={(e) => setShootStartTime(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Shoot End Time
            </label>
            <input
              type="time"
              disabled={isSubmitting}
              value={shootEndTime}
              onChange={(e) => setShootEndTime(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Priority
            </label>
            <select
              disabled={isSubmitting}
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
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
              disabled={isSubmitting}
              value={selectedLeadSource}
              onChange={(e) => setSelectedLeadSource(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
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
              Please specify source <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={customLeadSource}
              onChange={(e) => setCustomLeadSource(e.target.value)}
              placeholder="Please specify lead source"
              className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Internal Notes
          </label>
          <textarea
            disabled={isSubmitting}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Details on requirements, package details, gear restrictions..."
            rows={3}
            className="w-full bg-[#090d16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
          />
        </div>

        {!initialData && selectedProjectType === 'Wedding Photography' && (
          <div className="space-y-1 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-350 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={createDefaultDeliverables}
                disabled={isSubmitting}
                onChange={(e) => setCreateDefaultDeliverables(e.target.checked)}
                className="rounded border-slate-800 bg-[#090d16] text-violet-600 focus:ring-violet-500 h-4 w-4"
              />
              <span className="font-medium text-slate-300">Create default deliverables for this project type</span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              Automatically creates PHOTOS, TEASER, FULL_VIDEO, ALBUM_SELECTION, ALBUM_DESIGN, ALBUM_PRINT, and HARD_DISK deliverables.
            </p>
          </div>
        )}

        </fieldset>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-850 flex-none mt-4">
        {initialData && onDelete && !isReadOnly && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onDelete(initialData.id, initialData.projectCode)}
            className="mr-auto px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/20 text-rose-350 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          {isReadOnly ? 'Close' : 'Cancel'}
        </button>
        {!isReadOnly && (
          <button
            type="submit"
            disabled={isSubmitting || clients.length === 0}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-lg hover:shadow-violet-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Project'}
          </button>
        )}
      </div>
    </form>
  );
};
