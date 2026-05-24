import type { Lead, SequenceStep, MessageTemplate, PendingFollowUp } from './types';

export const mockLeads: Lead[] = [
  {
    id: 'l1',
    clientName: 'Priya & Arjun',
    projectTitle: 'Telugu Wedding Photography in Hyderabad',
    estimatedValue: 350000,
    eventDate: '2026-09-12',
    lastContacted: '2026-05-20',
    nextFollowUp: '2026-05-24', // Due today
    channel: 'EMAIL',
    stage: 'QUOTE_SENT',
    priority: 'high',
    urgencyDays: 0,
    sequenceName: 'Premium 3-Day Wedding Sequence',
    notes: 'Requested custom destination pricing for a 3-day wedding in Hyderabad. Interested in traditional Telugu rituals coverage + cinematic film and premium leather-bound albums.',
    history: [
      { date: '2026-05-18', event: 'Initial inquiry received via WhatsApp', status: 'system' },
      { date: '2026-05-20', event: 'Quotation of $350,000 sent with custom portfolio links', status: 'sent' }
    ]
  },
  {
    id: 'l2',
    clientName: 'Sneha Reddy',
    projectTitle: 'Haldi & Mehendi Coverage in Bengaluru',
    estimatedValue: 85000,
    eventDate: '2026-07-05',
    lastContacted: '2026-05-18',
    nextFollowUp: '2026-05-22', // Overdue
    channel: 'WHATSAPP',
    stage: 'WARM',
    priority: 'medium',
    urgencyDays: -2,
    sequenceName: 'Intimate Event Sequence',
    notes: 'Wants candid photography and short video reels for Instagram. Event at a resort near Nandi Hills. Total guest count is 150.',
    history: [
      { date: '2026-05-15', event: 'Inquiry submitted via website form', status: 'system' },
      { date: '2026-05-16', event: 'Haldi & Mehendi packages brochure sent', status: 'sent' },
      { date: '2026-05-18', event: 'Followed up via WhatsApp, client expressed positive interest', status: 'sent' }
    ]
  },
  {
    id: 'l3',
    clientName: 'Rahul & Ananya',
    projectTitle: 'Pre-wedding Shoot in Goa',
    estimatedValue: 120000,
    eventDate: '2026-08-20',
    lastContacted: '2026-05-22',
    nextFollowUp: '2026-05-25', // Tomorrow
    channel: 'SMS',
    stage: 'NEW_LEAD',
    priority: 'low',
    urgencyDays: 1,
    sequenceName: 'Pre-wedding Outdoor Sequence',
    notes: 'Looking for a sunset beach session and a couple of outfit changes. Needs drone coverage and a cinematic teaser video.',
    history: [
      { date: '2026-05-22', event: 'Inquiry received for Goa beach pre-wedding shoot', status: 'system' }
    ]
  },
  {
    id: 'l4',
    clientName: 'Rohit Sharma',
    projectTitle: 'Corporate Headshots in Mumbai',
    estimatedValue: 65000,
    eventDate: '2026-10-04',
    lastContacted: '2026-05-15',
    nextFollowUp: '2026-05-24', // Due today
    channel: 'MANUAL_CALL',
    stage: 'NEGOTIATION',
    priority: 'high',
    urgencyDays: 0,
    sequenceName: 'Commercial Headshot Sequence',
    notes: 'Needs executive headshots for 25 board members at their BKC office. Negotiating group package rate and backdrop options.',
    history: [
      { date: '2026-05-10', event: 'Corporate inquiry submitted', status: 'system' },
      { date: '2026-05-12', event: 'Price sheet and backdrop options sent', status: 'sent' },
      { date: '2026-05-15', event: 'Consultation call with HR completed', status: 'sent' }
    ]
  },
  {
    id: 'l5',
    clientName: 'Karthik & Meera',
    projectTitle: 'Engagement Ceremony in Chennai',
    estimatedValue: 95000,
    eventDate: '2026-06-30',
    lastContacted: '2026-05-23',
    nextFollowUp: '2026-05-27',
    channel: 'EMAIL',
    stage: 'FOLLOW_UP_PENDING',
    priority: 'medium',
    urgencyDays: 3,
    sequenceName: 'Standard Rituals Sequence',
    notes: 'Traditional South Indian style engagement. Client requested a quick turnaround for photo delivery to share with relatives abroad.',
    history: [
      { date: '2026-05-20', event: 'Inquiry received', status: 'system' },
      { date: '2026-05-21', event: 'Engagement pricing packages sent', status: 'sent' },
      { date: '2026-05-23', event: 'Follow-up email with client testimonials approved & sent', status: 'sent' }
    ]
  },
  {
    id: 'l6',
    clientName: 'Ayesha Khan',
    projectTitle: 'Baby Shower Photography in Delhi',
    estimatedValue: 55000,
    eventDate: '2026-06-15',
    lastContacted: '2026-05-10',
    nextFollowUp: '2026-05-20', // Overdue
    channel: 'EMAIL',
    stage: 'QUOTE_SENT',
    priority: 'high',
    urgencyDays: -4,
    sequenceName: 'Standard Event Sequence',
    notes: 'Family-only baby shower event in Delhi. Needs candid coverage, group photo portraits, and custom photo album.',
    history: [
      { date: '2026-05-08', event: 'Baby shower inquiry received', status: 'system' },
      { date: '2026-05-10', event: 'Custom event quote sent', status: 'sent' }
    ]
  },
  {
    id: 'l7',
    clientName: 'Aditya & Kavya',
    projectTitle: 'North Indian Wedding Film in Delhi',
    estimatedValue: 450000,
    eventDate: '2026-08-15',
    lastContacted: '2026-05-22',
    nextFollowUp: 'Completed',
    channel: 'EMAIL',
    stage: 'CONFIRMED',
    priority: 'high',
    urgencyDays: 99,
    sequenceName: 'Premium 3-Day Wedding Sequence',
    notes: 'Advance deposit paid. Traditional Punjabi wedding with Baraat, Anand Karaj, and Reception coverage.',
    history: [
      { date: '2026-05-15', event: 'Inquiry received', status: 'system' },
      { date: '2026-05-17', event: 'Cinematography & photography quote sent', status: 'sent' },
      { date: '2026-05-20', event: 'Contracts sent for signature', status: 'sent' },
      { date: '2026-05-22', event: 'Deposit paid & contract fully executed', status: 'system' }
    ]
  },
  {
    id: 'l8',
    clientName: 'Vikram Rao',
    projectTitle: 'Housewarming Event in Pune',
    estimatedValue: 40000,
    eventDate: '2026-06-05',
    lastContacted: '2026-05-05',
    nextFollowUp: 'Archived',
    channel: 'SMS',
    stage: 'LOST',
    priority: 'low',
    urgencyDays: 99,
    sequenceName: 'Standard Event Sequence',
    notes: 'Lost to neighborhood photographer offering a cheaper basic package without editing.',
    history: [
      { date: '2026-05-01', event: 'Inquiry received', status: 'system' },
      { date: '2026-05-03', event: 'Housewarming pricing brochure sent', status: 'sent' },
      { date: '2026-05-05', event: 'Client responded that they chose a local freelancer', status: 'system' }
    ]
  }
];

export const mockSequenceSteps: SequenceStep[] = [
  {
    id: 's1',
    delayDays: 0,
    channel: 'EMAIL',
    templateType: 'QUOTE_SENT',
    goal: 'Deliver Custom Quote & Portfolio Link',
    active: true,
  },
  {
    id: 's2',
    delayDays: 1,
    channel: 'WHATSAPP',
    templateType: 'SOFT_FOLLOW_UP',
    goal: 'Quick WhatsApp Check-in / Package Clarifications',
    active: true,
  },
  {
    id: 's3',
    delayDays: 3,
    channel: 'EMAIL',
    templateType: 'VALUE_FOLLOW_UP',
    goal: 'Share Indian Wedding Timeline Guide / Planning Tips',
    active: true,
  },
  {
    id: 's4',
    delayDays: 6,
    channel: 'SMS',
    templateType: 'SCARCITY_FOLLOW_UP',
    goal: 'Urgency Alert on Wedding Season Booking Slots',
    active: true,
  },
  {
    id: 's5',
    delayDays: 10,
    channel: 'MANUAL_CALL',
    templateType: 'FINAL_FOLLOW_UP',
    goal: 'Final Polite Call on Open Quotation Status',
    active: true,
  }
];

export const mockTemplates: MessageTemplate[] = [
  {
    id: 't1',
    name: 'Quote Sent Email Template',
    channel: 'EMAIL',
    templateType: 'QUOTE_SENT',
    subject: 'Your Photography & Film Quotation from StudioOps',
    body: 'Hi {{clientName}},\n\nThank you for reaching out to us! Attached you will find our custom quotation for {{projectTitle}} in the amount of ${{estimatedValue}}.\n\nWe have also put together a custom portfolio of wedding films and albums for you here: {{portfolioUrl}}.\n\nPlease let us know if you have any questions or would like to lock in your auspicious dates.\n\nBest regards,\nStudioOps Team',
    active: true,
  },
  {
    id: 't2',
    name: 'Soft Whatsapp Follow-Up',
    channel: 'WHATSAPP',
    templateType: 'SOFT_FOLLOW_UP',
    body: 'Namaste {{clientName}}! Hope you are doing well. Just wanted to make sure you received the custom quotation for {{projectTitle}} we sent yesterday. Do you have any quick questions about the package inclusions or customized video editing? 😊',
    active: true,
  },
  {
    id: 't3',
    name: 'Value Follow-up Email',
    channel: 'EMAIL',
    templateType: 'VALUE_FOLLOW_UP',
    subject: 'How to Plan Your Auspicious Indian Wedding Photography Timeline',
    body: 'Hi {{clientName}},\n\nPlanning an Indian wedding involves coordinating multiple rituals (Baraat, Muhurtham, Phere, etc.). We compiled a quick guide with timeline tips to ensure your photography captures every beautiful moment stress-free.\n\nCheck out the planning guide here: {{guideUrl}}\n\nHopefully this helps with your planning! We would love to capture your celebrations.\n\nWarmly,\nStudioOps Team',
    active: true,
  },
  {
    id: 't4',
    name: 'Scarcity SMS Alert',
    channel: 'SMS',
    templateType: 'SCARCITY_FOLLOW_UP',
    body: 'Hi {{clientName}}! We just received another inquiry for {{eventDate}} (peak wedding season). Since your quote is still active, we wanted to check if you are ready to book so we can save your slot! Reply here to confirm.',
    active: true,
  },
  {
    id: 't5',
    name: 'Final Closure Call script',
    channel: 'MANUAL_CALL',
    templateType: 'FINAL_FOLLOW_UP',
    body: 'Talking points:\n1. Friendly greeting and warm tone.\n2. Mention we are finalizing the calendar for {{eventDate}} and need to close out pending quotes.\n3. Ask if they chose another provider or want to adjust the package parameters.\n4. Leave on a highly positive note, offering future assistance.',
    active: true,
  }
];

export const mockPendingFollowUps: PendingFollowUp[] = [
  {
    id: 'p1',
    leadId: 'l1',
    clientName: 'Priya & Arjun',
    projectTitle: 'Telugu Wedding Photography in Hyderabad',
    channel: 'EMAIL',
    dueDate: '2026-05-24',
    dueStatus: 'due_today',
    subject: 'Quick question regarding your Telugu Wedding photography quote',
    body: 'Hi Priya,\n\nI wanted to confirm you received our quotation of $350,000 for your wedding. Do you have any initial questions or details you would like to adjust?\n\nLooking forward to hearing from you!',
  },
  {
    id: 'p2',
    leadId: 'l2',
    clientName: 'Sneha Reddy',
    projectTitle: 'Haldi & Mehendi Coverage in Bengaluru',
    channel: 'WHATSAPP',
    dueDate: '2026-05-22',
    dueStatus: 'overdue',
    body: 'Hey Sneha! Just checking in to see if you have any questions about the Haldi & Mehendi packages we sent over. We can customize the editing styles and reels output! Let me know.',
  },
  {
    id: 'p3',
    leadId: 'l6',
    clientName: 'Ayesha Khan',
    projectTitle: 'Baby Shower Photography in Delhi',
    channel: 'EMAIL',
    dueDate: '2026-05-20',
    dueStatus: 'overdue',
    subject: 'Still interested in baby shower photography?',
    body: 'Hi Ayesha,\n\nI wanted to check in one last time regarding the baby shower photography quote we sent. Let us know if you would like to block the date!\n\nBest, StudioOps.',
  },
  {
    id: 'p4',
    leadId: 'l3',
    clientName: 'Rahul & Ananya',
    projectTitle: 'Pre-wedding Shoot in Goa',
    channel: 'SMS',
    dueDate: '2026-05-25',
    dueStatus: 'upcoming',
    body: 'Hi Rahul! We sent you the Goa pre-wedding quote earlier. Do you have any questions? We would love to capture your shoot!',
  }
];
