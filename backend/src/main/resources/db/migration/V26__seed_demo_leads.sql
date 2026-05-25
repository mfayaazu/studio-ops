-- V26__seed_demo_leads.sql
-- Seed realistic Indian photography leads for testing and demo purposes

-- 1. Seed Priya & Arjun (NEW_LEAD)
INSERT INTO lead (id, studio_id, client_id, project_id, client_name, phone, email, preferred_channel, event_type, event_date, city, estimated_value, lead_source, pipeline_stage, assigned_user_id, last_contacted_at, next_follow_up_at, notes, lost_reason)
VALUES (
    'c8a6b10d-cf0c-4c7c-87d3-05745778b001',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    NULL,
    NULL,
    'Priya & Arjun',
    '+919876543210',
    'priya.arjun@wedding.in',
    'WHATSAPP',
    'Telugu Wedding Photography',
    '2026-11-20',
    'Hyderabad',
    350000.00,
    'WEBSITE',
    'NEW_LEAD',
    NULL,
    NULL,
    '2026-05-25 10:00:00+02',
    'Looking for premium traditional and candid coverage with two photographers.',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- 2. Seed Rahul & Ananya (QUOTE_SENT)
INSERT INTO lead (id, studio_id, client_id, project_id, client_name, phone, email, preferred_channel, event_type, event_date, city, estimated_value, lead_source, pipeline_stage, assigned_user_id, last_contacted_at, next_follow_up_at, notes, lost_reason)
VALUES (
    'c8a6b10d-cf0c-4c7c-87d3-05745778b002',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    NULL,
    NULL,
    'Rahul & Ananya',
    '+919988776655',
    'rahul.ananya@gmail.com',
    'EMAIL',
    'North Indian Wedding Film',
    '2026-12-15',
    'Delhi',
    250000.00,
    'INSTAGRAM',
    'QUOTE_SENT',
    NULL,
    NULL,
    '2026-05-20 11:30:00+02',
    'Sent package quote, waiting for response on editing style preferences.',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- 3. Seed Karthik & Meera (WARM)
INSERT INTO lead (id, studio_id, client_id, project_id, client_name, phone, email, preferred_channel, event_type, event_date, city, estimated_value, lead_source, pipeline_stage, assigned_user_id, last_contacted_at, next_follow_up_at, notes, lost_reason)
VALUES (
    'c8a6b10d-cf0c-4c7c-87d3-05745778b003',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    NULL,
    NULL,
    'Karthik & Meera',
    '+919123456789',
    'karthik.meera@yahoo.com',
    'PHONE_CALL',
    'Haldi & Mehendi Coverage',
    '2026-10-05',
    'Bengaluru',
    75000.00,
    'REFERRAL',
    'WARM',
    NULL,
    NULL,
    '2026-05-28 14:00:00+02',
    'Referred by a past client. Interested in visual stories and albums.',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- 4. Seed Ayesha Khan (NEGOTIATION)
INSERT INTO lead (id, studio_id, client_id, project_id, client_name, phone, email, preferred_channel, event_type, event_date, city, estimated_value, lead_source, pipeline_stage, assigned_user_id, last_contacted_at, next_follow_up_at, notes, lost_reason)
VALUES (
    'c8a6b10d-cf0c-4c7c-87d3-05745778b004',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    NULL,
    NULL,
    'Ayesha Khan',
    '+919812739485',
    'ayesha.khan@mumbai.in',
    'WHATSAPP',
    'Pre-wedding Shoot',
    '2026-09-12',
    'Mumbai',
    120000.00,
    'INSTAGRAM',
    'NEGOTIATION',
    NULL,
    NULL,
    '2026-05-25 15:30:00+02',
    'Comparing price models for multi-location outdoor shoots in Mumbai.',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- 5. Seed Sneha Reddy (FOLLOW_UP_PENDING)
INSERT INTO lead (id, studio_id, client_id, project_id, client_name, phone, email, preferred_channel, event_type, event_date, city, estimated_value, lead_source, pipeline_stage, assigned_user_id, last_contacted_at, next_follow_up_at, notes, lost_reason)
VALUES (
    'c8a6b10d-cf0c-4c7c-87d3-05745778b005',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    NULL,
    NULL,
    'Sneha Reddy',
    '+918800112233',
    'sneha.reddy@outlook.com',
    'EMAIL',
    'Reception Cinematic Film',
    '2026-11-28',
    'Chennai',
    180000.00,
    'WEBSITE',
    'FOLLOW_UP_PENDING',
    NULL,
    NULL,
    '2026-05-22 09:00:00+02',
    'Sent custom portfolio links, pending review by client''s parents.',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- 6. Seed Vikram Rao (CONFIRMED)
INSERT INTO lead (id, studio_id, client_id, project_id, client_name, phone, email, preferred_channel, event_type, event_date, city, estimated_value, lead_source, pipeline_stage, assigned_user_id, last_contacted_at, next_follow_up_at, notes, lost_reason)
VALUES (
    'c8a6b10d-cf0c-4c7c-87d3-05745778b006',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    NULL,
    NULL,
    'Vikram Rao',
    '+919876123456',
    'vikram.rao@goawedding.com',
    'PHONE_CALL',
    'Baby Shower Photography',
    '2026-08-20',
    'Goa',
    150000.00,
    'WALK_IN',
    'CONFIRMED',
    NULL,
    NULL,
    NULL,
    'Advanced booking made, contract signed. Converted to operations.',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- 7. Seed Farhan & Zoya (LOST)
INSERT INTO lead (id, studio_id, client_id, project_id, client_name, phone, email, preferred_channel, event_type, event_date, city, estimated_value, lead_source, pipeline_stage, assigned_user_id, last_contacted_at, next_follow_up_at, notes, lost_reason)
VALUES (
    'c8a6b10d-cf0c-4c7c-87d3-05745778b007',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    NULL,
    NULL,
    'Farhan & Zoya',
    '+917766554433',
    'farhan.zoya@jaipur.co.in',
    'EMAIL',
    'North Indian Wedding Film',
    '2026-12-28',
    'Jaipur',
    350000.00,
    'OTHER',
    'LOST',
    NULL,
    NULL,
    NULL,
    'Quote rejected. Client went with a local budget team.',
    'PRICE_TOO_HIGH'
) ON CONFLICT (id) DO NOTHING;
