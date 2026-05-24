-- V21__seed_follow_up_demo_data.sql
-- Seed development/demo data for Follow-up Automation & Communication Funnel

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

-- 2. Insert message templates
-- Template A: Quote Sent Email
INSERT INTO message_template (id, studio_id, name, channel, template_type, subject, body, active)
VALUES (
    'e30cf82a-bc91-4d37-88ea-d43806fbce20',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Quote Sent Email',
    'EMAIL',
    'QUOTE_SENT',
    'Your wedding photography quotation',
    'Hi {{clientName}},\n\nThank you for reaching out to us! Attached you will find our custom quotation for {{projectTitle}}.\n\nYou can review and accept the quotation directly here: {{quotationLink}}.\n\nWe have also put together a custom portfolio of our work here: {{portfolioLink}}.\n\nPlease let us know if you have any questions or would like to lock in your auspicious dates.\n\nBest regards,\nStudioOps Team',
    true
) ON CONFLICT ON CONSTRAINT uq_message_template_studio_name_channel DO NOTHING;

-- Template B: Soft WhatsApp Follow-up
INSERT INTO message_template (id, studio_id, name, channel, template_type, subject, body, active)
VALUES (
    'e30cf82a-bc91-4d37-88ea-d43806fbce21',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Soft WhatsApp Follow-up',
    'WHATSAPP',
    'SOFT_FOLLOW_UP',
    NULL,
    'Namaste {{clientName}}! Hope you are doing well. Just wanted to make sure you received the custom quotation for {{projectTitle}} we sent yesterday. Do you have any quick questions about the package inclusions or customized video editing? 😊',
    true
) ON CONFLICT ON CONSTRAINT uq_message_template_studio_name_channel DO NOTHING;

-- Template C: Value Follow-up Email
INSERT INTO message_template (id, studio_id, name, channel, template_type, subject, body, active)
VALUES (
    'e30cf82a-bc91-4d37-88ea-d43806fbce22',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Value Follow-up Email',
    'EMAIL',
    'VALUE_FOLLOW_UP',
    'A glimpse of our wedding storytelling',
    'Hi {{clientName}},\n\nPlanning an Indian wedding involves coordinating multiple rituals. We compiled a quick guide with timeline tips to ensure your photography captures every beautiful moment stress-free.\n\nRead our guide and customer testimonials here: {{testimonialLink}}\n\nWe also updated our wedding cinematography showcase here: {{portfolioLink}}\n\nWe would love to cover your special celebrations!\n\nWarmly,\nStudioOps Team',
    true
) ON CONFLICT ON CONSTRAINT uq_message_template_studio_name_channel DO NOTHING;

-- Template D: Scarcity WhatsApp Follow-up
INSERT INTO message_template (id, studio_id, name, channel, template_type, subject, body, active)
VALUES (
    'e30cf82a-bc91-4d37-88ea-d43806fbce23',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Scarcity WhatsApp Follow-up',
    'WHATSAPP',
    'SCARCITY_FOLLOW_UP',
    NULL,
    'Hi {{clientName}}! We just received another inquiry for {{eventDate}} (peak wedding season). Since your quotation is still active, we wanted to check if you are ready to book so we can lock in the date for you! Reply here to proceed.',
    true
) ON CONFLICT ON CONSTRAINT uq_message_template_studio_name_channel DO NOTHING;

-- Template E: Final Closure SMS
INSERT INTO message_template (id, studio_id, name, channel, template_type, subject, body, active)
VALUES (
    'e30cf82a-bc91-4d37-88ea-d43806fbce24',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Final Closure SMS',
    'SMS',
    'FINAL_FOLLOW_UP',
    NULL,
    'Hi {{clientName}}, this is {{studioName}}. We have not heard back regarding our quotation, so we will close it out to release the date for other inquiries. Thank you!',
    true
) ON CONFLICT ON CONSTRAINT uq_message_template_studio_name_channel DO NOTHING;


-- 3. Insert follow-up sequence
INSERT INTO follow_up_sequence (id, studio_id, name, description, active)
VALUES (
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Wedding 10-Day Follow-up Sequence',
    'Default post-quotation sequence for Indian wedding photography leads',
    true
) ON CONFLICT ON CONSTRAINT uq_follow_up_sequence_studio_name DO NOTHING;


-- 4. Insert follow-up steps
-- Step 1
INSERT INTO follow_up_step (id, studio_id, sequence_id, step_order, delay_days, channel, template_id, goal, active)
VALUES (
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e41',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    1,
    0,
    'EMAIL',
    'e30cf82a-bc91-4d37-88ea-d43806fbce20',
    'Send quotation with portfolio and booking CTA',
    true
) ON CONFLICT ON CONSTRAINT uq_follow_up_step_sequence_order DO NOTHING;

-- Step 2
INSERT INTO follow_up_step (id, studio_id, sequence_id, step_order, delay_days, channel, template_id, goal, active)
VALUES (
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e42',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    2,
    1,
    'WHATSAPP',
    'e30cf82a-bc91-4d37-88ea-d43806fbce21',
    'Gently confirm quotation was received',
    true
) ON CONFLICT ON CONSTRAINT uq_follow_up_step_sequence_order DO NOTHING;

-- Step 3
INSERT INTO follow_up_step (id, studio_id, sequence_id, step_order, delay_days, channel, template_id, goal, active)
VALUES (
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e43',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    3,
    3,
    'EMAIL',
    'e30cf82a-bc91-4d37-88ea-d43806fbce22',
    'Share storytelling value, portfolio and testimonials',
    true
) ON CONFLICT ON CONSTRAINT uq_follow_up_step_sequence_order DO NOTHING;

-- Step 4
INSERT INTO follow_up_step (id, studio_id, sequence_id, step_order, delay_days, channel, template_id, goal, active)
VALUES (
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e44',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    4,
    6,
    'WHATSAPP',
    'e30cf82a-bc91-4d37-88ea-d43806fbce23',
    'Remind about date availability',
    true
) ON CONFLICT ON CONSTRAINT uq_follow_up_step_sequence_order DO NOTHING;

-- Step 5
INSERT INTO follow_up_step (id, studio_id, sequence_id, step_order, delay_days, channel, template_id, goal, active)
VALUES (
    'f8df4a4a-1123-4ad9-a78f-efbcd8213e45',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    '3a0cf82a-bc91-4d37-88ea-d43806fbce30',
    5,
    10,
    'SMS',
    'e30cf82a-bc91-4d37-88ea-d43806fbce24',
    'Politely close the follow-up loop',
    true
) ON CONFLICT ON CONSTRAINT uq_follow_up_step_sequence_order DO NOTHING;
