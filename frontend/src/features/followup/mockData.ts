import type { Lead, SequenceStep, MessageTemplate, PendingFollowUp } from './types';

export const mockLeads: Lead[] = [
  {
    id: 'l1',
    clientName: 'Sarah Jenkins',
    projectTitle: 'Jenkins-Miller Wedding',
    estimatedValue: 4200,
    eventDate: '2026-09-12',
    lastContacted: '2026-05-20',
    nextFollowUp: '2026-05-24', // Due today
    channel: 'EMAIL',
    stage: 'QUOTE_SENT',
    priority: 'high',
    urgencyDays: 0,
    sequenceName: 'Standard 10-day Wedding Sequence',
    notes: 'Requested custom destination pricing. Interested in adding a second photographer and engagement shoot package.',
    history: [
      { date: '2026-05-18', event: 'Initial inquiry received', status: 'system' },
      { date: '2026-05-20', event: 'Quotation of $4,200 sent', status: 'sent' }
    ]
  },
  {
    id: 'l2',
    clientName: 'David Chen',
    projectTitle: 'Chen Corporate Portrait',
    estimatedValue: 1500,
    eventDate: '2026-07-05',
    lastContacted: '2026-05-18',
    nextFollowUp: '2026-05-22', // Overdue
    channel: 'WHATSAPP',
    stage: 'WARM',
    priority: 'medium',
    urgencyDays: -2,
    sequenceName: 'Commercial Follow-up Sequence',
    notes: 'Needs headshots for 15 board members. Requested clean solid grey backdrop.',
    history: [
      { date: '2026-05-15', event: 'Inquiry submitted via website form', status: 'system' },
      { date: '2026-05-16', event: 'Commercial packages sent', status: 'sent' },
      { date: '2026-05-18', event: 'Followed up via WhatsApp, client expressed positive interest', status: 'sent' }
    ]
  },
  {
    id: 'l3',
    clientName: 'Rebecca Vance',
    projectTitle: 'Vance Family Reunion',
    estimatedValue: 950,
    eventDate: '2026-08-20',
    lastContacted: '2026-05-22',
    nextFollowUp: '2026-05-25', // Tomorrow
    channel: 'SMS',
    stage: 'NEW_LEAD',
    priority: 'low',
    urgencyDays: 1,
    sequenceName: 'Standard Family Portrait Sequence',
    notes: 'Family reunion event. Total of 12 adults and 4 kids. Looking for relaxed, outdoor aesthetic.',
    history: [
      { date: '2026-05-22', event: 'Inquiry received for family shoot', status: 'system' }
    ]
  },
  {
    id: 'l4',
    clientName: 'Marcus Brodie',
    projectTitle: 'Brodie Engagement Shoot',
    estimatedValue: 1200,
    eventDate: '2026-10-04',
    lastContacted: '2026-05-15',
    nextFollowUp: '2026-05-24', // Due today
    channel: 'MANUAL_CALL',
    stage: 'NEGOTIATION',
    priority: 'high',
    urgencyDays: 0,
    sequenceName: 'Engagement Portrait Sequence',
    notes: 'Negotiating location options. Marcus wants a scenic mountain overlook but concerns about sunset timing.',
    history: [
      { date: '2026-05-10', event: 'Inquiry submitted', status: 'system' },
      { date: '2026-05-12', event: 'Price sheet and location guide sent', status: 'sent' },
      { date: '2026-05-15', event: 'Consultation call completed', status: 'sent' }
    ]
  },
  {
    id: 'l5',
    clientName: 'Laura Henderson',
    projectTitle: 'Henderson Maternity Session',
    estimatedValue: 800,
    eventDate: '2026-06-30',
    lastContacted: '2026-05-23',
    nextFollowUp: '2026-05-27',
    channel: 'EMAIL',
    stage: 'FOLLOW_UP_PENDING',
    priority: 'medium',
    urgencyDays: 3,
    sequenceName: 'Maternity/Newborn Sequence',
    notes: 'Client is currently in her 28th week. Prefers a studio session with soft high-key lighting.',
    history: [
      { date: '2026-05-20', event: 'Inquiry received', status: 'system' },
      { date: '2026-05-21', event: 'Pricing options sent', status: 'sent' },
      { date: '2026-05-23', event: 'Scheduled follow-up email approved & sent', status: 'sent' }
    ]
  },
  {
    id: 'l6',
    clientName: 'Amanda Ross',
    projectTitle: 'Ross 30th Birthday',
    estimatedValue: 1800,
    eventDate: '2026-06-15',
    lastContacted: '2026-05-10',
    nextFollowUp: '2026-05-20', // Overdue
    channel: 'EMAIL',
    stage: 'QUOTE_SENT',
    priority: 'high',
    urgencyDays: -4,
    sequenceName: 'Standard Event Sequence',
    notes: 'Party venue booked in downtown rooftop. Needs coverage for 4 hours including speeches.',
    history: [
      { date: '2026-05-08', event: 'Party inquiry received', status: 'system' },
      { date: '2026-05-10', event: 'Custom quote sent', status: 'sent' }
    ]
  },
  {
    id: 'l7',
    clientName: 'George Sterling',
    projectTitle: 'Sterling Fashion Editorial',
    estimatedValue: 3100,
    eventDate: '2026-08-15',
    lastContacted: '2026-05-22',
    nextFollowUp: 'Completed',
    channel: 'EMAIL',
    stage: 'CONFIRMED',
    priority: 'high',
    urgencyDays: 99,
    sequenceName: 'Commercial Editorial Sequence',
    notes: 'Deposit paid. Contract signed. Moodboard finalized on Pinterest.',
    history: [
      { date: '2026-05-15', event: 'Inquiry received', status: 'system' },
      { date: '2026-05-17', event: 'Quote sent', status: 'sent' },
      { date: '2026-05-20', event: 'Contracts sent for signature', status: 'sent' },
      { date: '2026-05-22', event: 'Deposit paid & contract fully executed', status: 'system' }
    ]
  },
  {
    id: 'l8',
    clientName: 'Elena Rostova',
    projectTitle: 'Rostova Graduation Portrait',
    estimatedValue: 600,
    eventDate: '2026-06-05',
    lastContacted: '2026-05-05',
    nextFollowUp: 'Archived',
    channel: 'SMS',
    stage: 'LOST',
    priority: 'low',
    urgencyDays: 99,
    sequenceName: 'Standard Portrait Sequence',
    notes: 'Lost to competitor offering a lower price point.',
    history: [
      { date: '2026-05-01', event: 'Inquiry received', status: 'system' },
      { date: '2026-05-03', event: 'Pricing brochure sent', status: 'sent' },
      { date: '2026-05-05', event: 'Client responded they chose another provider', status: 'system' }
    ]
  }
];

export const mockSequenceSteps: SequenceStep[] = [
  {
    id: 's1',
    delayDays: 0,
    channel: 'EMAIL',
    templateType: 'QUOTE_SENT',
    goal: 'Deliver Quote & Portfolio Link',
    active: true,
  },
  {
    id: 's2',
    delayDays: 1,
    channel: 'WHATSAPP',
    templateType: 'SOFT_FOLLOW_UP',
    goal: 'Quick Check-in / Question Answer',
    active: true,
  },
  {
    id: 's3',
    delayDays: 3,
    channel: 'EMAIL',
    templateType: 'VALUE_FOLLOW_UP',
    goal: 'Share Planning Tips / Value Guide',
    active: true,
  },
  {
    id: 's4',
    delayDays: 6,
    channel: 'SMS',
    templateType: 'SCARCITY_FOLLOW_UP',
    goal: 'Urgency Warning on Limited Slots',
    active: true,
  },
  {
    id: 's5',
    delayDays: 10,
    channel: 'MANUAL_CALL',
    templateType: 'FINAL_FOLLOW_UP',
    goal: 'Final Polite Closure Check-in',
    active: true,
  }
];

export const mockTemplates: MessageTemplate[] = [
  {
    id: 't1',
    name: 'Quote Sent Email Template',
    channel: 'EMAIL',
    templateType: 'QUOTE_SENT',
    subject: 'Your Photography Quotation from StudioOps',
    body: 'Hi {{clientName}},\n\nThank you for reaching out to us! Attached you will find our custom quotation for {{projectTitle}} in the amount of ${{estimatedValue}}.\n\nWe have also put together a custom portfolio for you to review here: {{portfolioUrl}}.\n\nPlease let us know if you have any questions or would like to lock in your date.\n\nBest regards,\nStudioOps Team',
    active: true,
  },
  {
    id: 't2',
    name: 'Soft Whatsapp Follow-Up',
    channel: 'WHATSAPP',
    templateType: 'SOFT_FOLLOW_UP',
    body: 'Hey {{clientName}}! Just wanted to make sure you received the quote we sent yesterday for ${{estimatedValue}}. Do you have any quick questions about the packages or the timeline? 😊',
    active: true,
  },
  {
    id: 't3',
    name: 'Value Follow-up Email',
    channel: 'EMAIL',
    templateType: 'VALUE_FOLLOW_UP',
    subject: '5 Wedding Schedule Mistakes to Avoid',
    body: 'Hi {{clientName}},\n\nAs you plan your big day, scheduling details can make or break the photo coverage. We compiled a quick guide with the 5 most common wedding timeline mistakes we see couples make.\n\nCheck it out here: {{guideUrl}}\n\nHopefully this helps with your planning! We would love to capture these moments for you.\n\nWarmly,\nStudioOps Team',
    active: true,
  },
  {
    id: 't4',
    name: 'Scarcity SMS Alert',
    channel: 'SMS',
    templateType: 'SCARCITY_FOLLOW_UP',
    body: 'Hi {{clientName}}! We just received another inquiry for {{eventDate}}. Since your quotation is still active, we wanted to check if you are ready to book so we can save your slot! Reply here to confirm.',
    active: true,
  },
  {
    id: 't5',
    name: 'Final Closure Call script',
    channel: 'MANUAL_CALL',
    templateType: 'FINAL_FOLLOW_UP',
    body: 'Talking points:\n1. Re-introduce yourself friendly.\n2. Mention we are finalizing the calendar for {{eventDate}} and need to close out pending quotes.\n3. Ask if they decided on another provider or if they want to pause planning.\n4. Leave on a highly positive note, offering future assistance.',
    active: true,
  }
];

export const mockPendingFollowUps: PendingFollowUp[] = [
  {
    id: 'p1',
    leadId: 'l1',
    clientName: 'Sarah Jenkins',
    projectTitle: 'Jenkins-Miller Wedding',
    channel: 'EMAIL',
    dueDate: '2026-05-24',
    dueStatus: 'due_today',
    subject: 'Quick question regarding your wedding photography quote',
    body: 'Hi Sarah,\n\nI wanted to confirm you received our quotation for $4,200. Do you have any initial questions or details you would like to adjust?\n\nLooking forward to hearing from you!',
  },
  {
    id: 'p2',
    leadId: 'l2',
    clientName: 'David Chen',
    projectTitle: 'Chen Corporate Portrait',
    channel: 'WHATSAPP',
    dueDate: '2026-05-22',
    dueStatus: 'overdue',
    body: 'Hey David! Just checking in to see if you have any questions about the corporate headshot packages we sent over. We can customize the background and group discounts if needed! Let me know.',
  },
  {
    id: 'p3',
    leadId: 'l6',
    clientName: 'Amanda Ross',
    projectTitle: 'Ross 30th Birthday',
    channel: 'EMAIL',
    dueDate: '2026-05-20',
    dueStatus: 'overdue',
    subject: 'Still interested in birthday event photography?',
    body: 'Hi Amanda,\n\nI wanted to check in one last time regarding the photography quote for your birthday celebration on June 15. Our weekend slots fill up fast, so let me know if you would like us to reserve the date!\n\nBest, StudioOps.',
  },
  {
    id: 'p4',
    leadId: 'l3',
    clientName: 'Rebecca Vance',
    projectTitle: 'Vance Family Reunion',
    channel: 'SMS',
    dueDate: '2026-05-25',
    dueStatus: 'upcoming',
    body: 'Hi Rebecca! We sent you the family portrait quote earlier. Do you have any questions? We would love to capture your family gathering!',
  }
];
