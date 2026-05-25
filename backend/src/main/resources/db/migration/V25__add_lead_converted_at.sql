-- V25__add_lead_converted_at.sql
-- Add converted_at column to lead table to track project conversion

ALTER TABLE lead ADD COLUMN converted_at TIMESTAMP WITH TIME ZONE;
