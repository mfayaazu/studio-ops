-- Beta-only migration: forces existing communication setup to WhatsApp for controlled beta testing.
-- This migration should not be treated as a permanent production communication policy.

UPDATE message_template SET channel = 'WHATSAPP';
UPDATE follow_up_step SET channel = 'WHATSAPP';
UPDATE follow_up_task SET channel = 'WHATSAPP';
UPDATE lead SET preferred_channel = 'WHATSAPP';
