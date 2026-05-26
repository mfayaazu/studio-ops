-- Seed Demo Employees
INSERT INTO employee (id, studio_id, full_name, email, phone, primary_role, status, created_at, updated_at)
VALUES 
('e1a0d81b-ea46-43b2-9214-729930f787e1', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Arjun Varma', 'arjun.varma@studioops.demo', '+91 98765 43221', 'Lead Photographer', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e2', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Meera Nair', 'meera.nair@studioops.demo', '+91 98765 43222', 'Photo Editor', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e3', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Rahul Kapoor', 'rahul.kapoor@studioops.demo', '+91 98765 43223', 'Cinematographer', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e4', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Sneha Reddy', 'sneha.reddy@studioops.demo', '+91 98765 43224', 'Video Editor', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e5', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Vikram Rao', 'vikram.rao@studioops.demo', '+91 98765 43225', 'Colorist', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e6', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Ayesha Khan', 'ayesha.khan@studioops.demo', '+91 98765 43226', 'Album Designer', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e7', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Karthik Iyer', 'karthik.iyer@studioops.demo', '+91 98765 43227', 'Drone Operator', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e8', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Priya Menon', 'priya.menon@studioops.demo', '+91 98765 43228', 'Production Coordinator', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f787e9', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Farhan Ali', 'farhan.ali@studioops.demo', '+91 98765 43229', 'Assistant Photographer', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f78710', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Zoya Sheikh', 'zoya.sheikh@studioops.demo', '+91 98765 43230', 'Client Delivery Manager', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f78711', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Nikhil Sharma', 'nikhil.sharma@studioops.demo', '+91 98765 43231', 'Sound Sync Editor', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1a0d81b-ea46-43b2-9214-729930f78712', 'd3b07384-d113-4952-b1cf-9a993710787e', 'Ananya Bose', 'ananya.bose@studioops.demo', '+91 98765 43232', 'Quality Check Reviewer', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Assign Post-Production Tasks Scoped to Default Studio

-- 1. PHOTO_CULLING
-- If title matches cull or Cull -> Meera Nair
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e2'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'PHOTO_CULLING'
  AND (title ILIKE '%cull%' OR title ILIKE '%selection%');

-- If title matches organize/import -> Farhan Ali
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e9'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'PHOTO_CULLING'
  AND (title ILIKE '%organize%' OR title ILIKE '%import%');

-- Fallback for any other PHOTO_CULLING tasks -> Meera Nair
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e2'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'PHOTO_CULLING'
  AND assigned_employee_id IS NULL;


-- 2. PHOTO_EDITING -> Meera Nair
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e2'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'PHOTO_EDITING';


-- 3. VIDEO_EDITING
-- If title matches teaser or rough cut -> Sneha Reddy
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e4'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'VIDEO_EDITING'
  AND (title ILIKE '%teaser%' OR title ILIKE '%rough cut%' OR title ILIKE '%rough%');

-- If title matches highlight, film, or video -> Rahul Kapoor
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e3'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'VIDEO_EDITING'
  AND (title ILIKE '%highlight%' OR title ILIKE '%film%' OR title ILIKE '%video%');

-- Fallback for any other VIDEO_EDITING tasks -> Sneha Reddy
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e4'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'VIDEO_EDITING'
  AND assigned_employee_id IS NULL;


-- 4. COLOR_GRADING -> Vikram Rao
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e5'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'COLOR_GRADING';


-- 5. AUDIO_SYNC -> Nikhil Sharma
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f78711'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'AUDIO_SYNC';


-- 6. ALBUM_DESIGN -> Ayesha Khan
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e6'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'ALBUM_DESIGN';


-- 7. QUALITY_CHECK -> Ananya Bose
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f78712'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'QUALITY_CHECK';


-- 8. EXPORT_UPLOAD
-- If title matches upload or Upload -> Zoya Sheikh
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f78710'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'EXPORT_UPLOAD'
  AND (title ILIKE '%upload%' OR title ILIKE '%Upload%');

-- Fallback/Other export tasks -> Priya Menon
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e8'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'EXPORT_UPLOAD'
  AND assigned_employee_id IS NULL;


-- 9. CLIENT_REVISION
-- If title matches photo or Photo -> Meera Nair
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e2'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'CLIENT_REVISION'
  AND (title ILIKE '%photo%' OR title ILIKE '%Photo%');

-- Fallback for revision tasks -> Sneha Reddy
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e4'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'CLIENT_REVISION'
  AND assigned_employee_id IS NULL;


-- 10. OTHER -> Priya Menon
UPDATE post_production_task
SET assigned_employee_id = 'e1a0d81b-ea46-43b2-9214-729930f787e8'
WHERE studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND task_type = 'OTHER';


-- 11. Subtasks Assignment from Parent Task
UPDATE post_production_subtask s
SET assigned_employee_id = t.assigned_employee_id
FROM post_production_task t
WHERE s.task_id = t.id
  AND s.studio_id = t.studio_id
  AND s.studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e'
  AND t.assigned_employee_id IS NOT NULL;
