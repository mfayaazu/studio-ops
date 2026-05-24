-- V23__seed_follow_up_task_demo_data.sql
-- Seed demo tasks for Follow-up Automation Center

-- 1. Ensure the default studio exists
INSERT INTO studio (id, name, slug, business_email, phone, country, timezone, status, subscription_plan, subscription_status)
VALUES (
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Default Studio',
    'default-studio',
    'contact@defaultstudio.com',
    '+919999999999',
    'India',
    'Asia/Kolkata',
    'ACTIVE',
    'PRO',
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 2. Seed Task 1: Overdue WhatsApp follow-up (Scheduled 2 days ago)
INSERT INTO follow_up_task (
    id,
    studio_id,
    sequence_id,
    step_id,
    template_id,
    channel,
    scheduled_at,
    status,
    recipient,
    subject,
    message_body,
    created_at,
    updated_at
) VALUES (
    'a1111111-1111-4111-8111-111111111111',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e42',
    'e30cf82a-bc91-4d37-88ea-d43806fbce21',
    'WHATSAPP',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'PENDING_APPROVAL',
    '+919876543210',
    NULL,
    'Namaste Priya & Arjun! Hope you are doing well. Just wanted to make sure you received the custom quotation for Telugu Wedding Photography in Hyderabad we sent yesterday. Do you have any quick questions about the package inclusions or customized video editing? 😊',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 3. Seed Task 2: Due today email follow-up (Scheduled 1 hour ago)
INSERT INTO follow_up_task (
    id,
    studio_id,
    sequence_id,
    step_id,
    template_id,
    channel,
    scheduled_at,
    status,
    recipient,
    subject,
    message_body,
    created_at,
    updated_at
) VALUES (
    'a2222222-2222-4222-8222-222222222222',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e43',
    'e30cf82a-bc91-4d37-88ea-d43806fbce22',
    'EMAIL',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    'PENDING_APPROVAL',
    'ananya@example.in',
    'A glimpse of our wedding storytelling',
    'Hi Rahul & Ananya,

Planning an Indian wedding involves coordinating multiple rituals. We compiled a quick guide with timeline tips to ensure your photography captures every beautiful moment stress-free.

Read our guide and customer testimonials here: https://example.com/testimonials

We also updated our wedding cinematography showcase here: https://example.com/portfolio

We would love to cover your special celebrations!

Warmly,
StudioOps Team',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 4. Seed Task 3: Upcoming follow-up task (Scheduled 1 day in the future)
INSERT INTO follow_up_task (
    id,
    studio_id,
    sequence_id,
    step_id,
    template_id,
    channel,
    scheduled_at,
    status,
    recipient,
    subject,
    message_body,
    created_at,
    updated_at
) VALUES (
    'a3333333-3333-4333-8333-333333333333',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e44',
    'e30cf82a-bc91-4d37-88ea-d43806fbce23',
    'WHATSAPP',
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    'PENDING_APPROVAL',
    '+919900112233',
    NULL,
    'Hi Karthik & Meera! We just received another inquiry for their wedding date. Since your quotation is still active, we wanted to check if you are ready to book so we can lock in the date for you! Reply here to proceed.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;
