-- V41__add_crm_enhancements.sql
-- Introduce CRM enhancements for CRM board/list, payment tracking, event segments, and steps delay unit.

-- 1. Alter lead table to add priority and payment tracking
ALTER TABLE "lead" ADD COLUMN priority VARCHAR(50) DEFAULT 'NORMAL' NOT NULL;
ALTER TABLE "lead" ADD COLUMN quotation_total NUMERIC(12,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE "lead" ADD COLUMN amount_paid NUMERIC(12,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE "lead" ADD COLUMN amount_remaining NUMERIC(12,2) DEFAULT 0.00 NOT NULL;
ALTER TABLE "lead" ADD COLUMN payment_status VARCHAR(50) DEFAULT 'UNPAID' NOT NULL;

-- 2. Create lead_event_segment table
CREATE TABLE lead_event_segment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(100),
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    venue_name VARCHAR(200) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_lead_event_segment_lead FOREIGN KEY (lead_id) REFERENCES "lead"(id) ON DELETE CASCADE
);

-- 3. Alter follow_up_task table for WhatsApp draft flow
ALTER TABLE follow_up_task ADD COLUMN is_draft BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE follow_up_task ADD COLUMN draft_message TEXT;
ALTER TABLE follow_up_task ADD COLUMN priority VARCHAR(50) DEFAULT 'NORMAL' NOT NULL;

-- 4. Alter follow_up_step table for editable timelines and step metrics
ALTER TABLE follow_up_step ADD COLUMN step_name VARCHAR(150);
ALTER TABLE follow_up_step ADD COLUMN trigger_stage VARCHAR(50);
ALTER TABLE follow_up_step ADD COLUMN delay_value INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE follow_up_step ADD COLUMN delay_unit VARCHAR(50) DEFAULT 'DAYS' NOT NULL;
ALTER TABLE follow_up_step ADD COLUMN default_priority VARCHAR(50) DEFAULT 'NORMAL' NOT NULL;
ALTER TABLE follow_up_step ADD COLUMN urgency_threshold_hours INTEGER DEFAULT 24;

-- 5. Alter follow_up_sequence table for triggers
ALTER TABLE follow_up_sequence ADD COLUMN applicable_stage VARCHAR(50);

-- 6. Migrate existing lead level event fields into lead_event_segment
INSERT INTO lead_event_segment (id, lead_id, event_type, event_name, event_date, venue_name, city, created_at, updated_at)
SELECT 
    gen_random_uuid(), 
    id, 
    COALESCE(event_type, 'OTHER'), 
    'Primary Event', 
    COALESCE(event_date, CURRENT_DATE), 
    'TBD', 
    COALESCE(city, 'TBD'), 
    created_at, 
    updated_at
FROM "lead";

-- 7. Migrate existing sequence steps delay_days to delay_value
UPDATE follow_up_step SET delay_value = delay_days, delay_unit = 'DAYS';
UPDATE follow_up_step SET step_name = COALESCE(goal, 'Follow-up step');
