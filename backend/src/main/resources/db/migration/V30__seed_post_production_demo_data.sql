-- Seed Demo Client (Priya & Arjun)
INSERT INTO client (id, studio_id, full_name, phone, email, notes)
VALUES (
    'c0a80101-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'Priya & Arjun',
    '+91 98765 43210',
    'priya.arjun@wedding.local',
    'Client for Telugu wedding photography and cinematic film'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Demo Project (Priya & Arjun Telugu Wedding)
INSERT INTO project (id, studio_id, client_id, project_code, title, project_type, booking_status, payment_status, status, start_date, end_date, notes)
VALUES (
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'c0a80101-1234-5678-abcd-ef1234567890',
    'PA-TEL-2026',
    'Priya & Arjun Telugu Wedding',
    'WEDDING',
    'FULLY_BOOKED',
    'PARTIALLY_PAID',
    'POST_PRODUCTION',
    '2026-06-15',
    '2026-06-18',
    'Detailed coverage of Haldi, Mehendi, Wedding, and Reception'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Demo Deliverable 1 (Wedding Highlight Film)
INSERT INTO deliverable (id, studio_id, project_id, name, deliverable_type, status, due_date, priority)
VALUES (
    'd0a80103-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'Wedding Highlight Film',
    'TEASER',
    'IN_PROGRESS',
    '2026-08-30',
    'HIGH'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Demo Deliverable 2 (Edited Wedding Photo Gallery)
INSERT INTO deliverable (id, studio_id, project_id, name, deliverable_type, status, due_date, priority)
VALUES (
    'd0a80104-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'Edited Wedding Photo Gallery',
    'PHOTOS',
    'NOT_STARTED',
    '2026-08-15',
    'MEDIUM'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Post-Production Tasks (6-8 Tasks representing all statuses)
INSERT INTO post_production_task (id, studio_id, project_id, deliverable_id, title, description, task_type, priority, status, assigned_employee_id, due_date, estimated_hours, actual_hours, sort_order)
VALUES 
(
    'fa010001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd0a80104-1234-5678-abcd-ef1234567890',
    'Import and organize RAW files',
    'Download files from all SD cards and organize them into standardized folder structures on primary storage.',
    'EXPORT_UPLOAD',
    'LOW',
    'DONE',
    NULL,
    '2026-06-20',
    4.0,
    4.5,
    10
),
(
    'fa010002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd0a80104-1234-5678-abcd-ef1234567890',
    'Cull wedding photos',
    'Filter through the 5000+ RAW wedding photos to shortlist the best 800 candid and key moment shots.',
    'PHOTO_CULLING',
    'HIGH',
    'TODO',
    NULL,
    '2026-07-05',
    8.0,
    0.0,
    20
),
(
    'fa010003-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd0a80103-1234-5678-abcd-ef1234567890',
    'Sync audio and video footage',
    'Align the sound recordings from lapels and ambient recorders with the multi-camera video footage in Premiere Pro.',
    'AUDIO_SYNC',
    'MEDIUM',
    'IN_PROGRESS',
    NULL,
    '2026-06-25',
    3.0,
    1.5,
    30
),
(
    'fa010004-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd0a80103-1234-5678-abcd-ef1234567890',
    'Create highlight film rough cut',
    'Edit the story layout, select emotional sound bites, align to the music track, and compile a 5-minute timeline.',
    'VIDEO_EDITING',
    'HIGH',
    'CHANGES_REQUESTED',
    NULL,
    '2026-07-20',
    16.0,
    12.0,
    40
),
(
    'fa010005-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd0a80103-1234-5678-abcd-ef1234567890',
    'Color grade final highlight film',
    'Perform exposure matching across cameras, primary color correction, skin tone balancing, and apply LUT profiles.',
    'COLOR_GRADING',
    'URGENT',
    'IN_REVIEW',
    NULL,
    '2026-08-10',
    6.0,
    5.0,
    50
),
(
    'fa010006-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd0a80104-1234-5678-abcd-ef1234567890',
    'Upload final photo gallery',
    'Export high-resolution JPEGs with client watermarks and upload them to the web gallery portal.',
    'EXPORT_UPLOAD',
    'LOW',
    'BACKLOG',
    NULL,
    '2026-08-12',
    2.0,
    0.0,
    60
),
(
    'fa010007-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'e0a80102-1234-5678-abcd-ef1234567890',
    'd0a80103-1234-5678-abcd-ef1234567890',
    'Drone footage overlay',
    'Integrate drone shots into the main edit timeline. Currently blocked waiting for drone SD card dispatch.',
    'VIDEO_EDITING',
    'MEDIUM',
    'BLOCKED',
    NULL,
    '2026-07-15',
    3.0,
    0.0,
    70
)
ON CONFLICT (id) DO NOTHING;

-- Seed Post-Production Subtasks (2-5 Subtasks per task)
INSERT INTO post_production_subtask (id, studio_id, task_id, title, description, status, assigned_employee_id, sort_order, completed_at)
VALUES 
-- Task 1 Subtasks (DONE)
(
    'fb010001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010001-1234-5678-abcd-ef1234567890',
    'Import RAW folders',
    'Copy all memory cards into standardized directory on backup server.',
    'DONE',
    NULL,
    10,
    CURRENT_TIMESTAMP
),
(
    'fb010002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010001-1234-5678-abcd-ef1234567890',
    'Backup to NAS server',
    'Verify mirror synchronization is complete and log verification hashes.',
    'DONE',
    NULL,
    20,
    CURRENT_TIMESTAMP
),
(
    'fb010003-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010001-1234-5678-abcd-ef1234567890',
    'Generate smart previews',
    'Generate Lightroom catalog with 1:1 Smart Previews for mobile editing.',
    'DONE',
    NULL,
    30,
    CURRENT_TIMESTAMP
),

-- Task 2 Subtasks (TODO)
(
    'fb020001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010002-1234-5678-abcd-ef1234567890',
    'Remove duplicates and blurry shots',
    'Perform initial pass filter in PhotoMechanic to discard unwanted files.',
    'TODO',
    NULL,
    10,
    NULL
),
(
    'fb020002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010002-1234-5678-abcd-ef1234567890',
    'Shortlist ceremony photos',
    'Select crucial rituals (Jeelakarra Bellam, Kanyadaanam, Mangalsutra).',
    'TODO',
    NULL,
    20,
    NULL
),
(
    'fb020003-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010002-1234-5678-abcd-ef1234567890',
    'Shortlist couple portraits',
    'Filter creative session portraits in golden hour lights.',
    'TODO',
    NULL,
    30,
    NULL
),

-- Task 3 Subtasks (IN_PROGRESS)
(
    'fb030001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010003-1234-5678-abcd-ef1234567890',
    'Import multi-cam raw video clips',
    'Verify video sources from Sony A7S3, FX3, and drone are accounted for.',
    'DONE',
    NULL,
    10,
    CURRENT_TIMESTAMP
),
(
    'fb030002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010003-1234-5678-abcd-ef1234567890',
    'Import lapel/ambient audio files',
    'Fetch audio files from Zoom F2 lapel recorders and DJ mics.',
    'DONE',
    NULL,
    20,
    CURRENT_TIMESTAMP
),
(
    'fb030003-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010003-1234-5678-abcd-ef1234567890',
    'Premiere Pro timeline sync',
    'Sync wave files with on-camera scratch track audio.',
    'IN_PROGRESS',
    NULL,
    30,
    NULL
),

-- Task 4 Subtasks (CHANGES_REQUESTED)
(
    'fb040001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010004-1234-5678-abcd-ef1234567890',
    'Select best ceremony clips',
    'Cull film reels for emotional expressions and key actions.',
    'DONE',
    NULL,
    10,
    CURRENT_TIMESTAMP
),
(
    'fb040002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010004-1234-5678-abcd-ef1234567890',
    'Add music bed',
    'Choose backing tracks and blend audio overlays.',
    'DONE',
    NULL,
    20,
    CURRENT_TIMESTAMP
),
(
    'fb040003-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010004-1234-5678-abcd-ef1234567890',
    'Build first timeline',
    'Assemble timeline sequence matching the narrative flow.',
    'DONE',
    NULL,
    30,
    CURRENT_TIMESTAMP
),
(
    'fb040004-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010004-1234-5678-abcd-ef1234567890',
    'Export review draft',
    'Export H264 low-res review draft for client feedback.',
    'TODO',
    NULL,
    40,
    NULL
),

-- Task 5 Subtasks (IN_REVIEW)
(
    'fb050001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010005-1234-5678-abcd-ef1234567890',
    'Match camera color profiles',
    'Balance different color outputs from FX3 and Sony A7S3 cameras.',
    'DONE',
    NULL,
    10,
    CURRENT_TIMESTAMP
),
(
    'fb050002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010005-1234-5678-abcd-ef1234567890',
    'Apply creative LUT',
    'Apply selected creative profile matching the cinematic wedding theme.',
    'DONE',
    NULL,
    20,
    CURRENT_TIMESTAMP
),
(
    'fb050003-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010005-1234-5678-abcd-ef1234567890',
    'Match exposure across clips',
    'Fine-tune curves and scopes to ensure consistent exposure.',
    'TODO',
    NULL,
    30,
    NULL
),

-- Task 6 Subtasks (BACKLOG)
(
    'fb060001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010006-1234-5678-abcd-ef1234567890',
    'Export high-res JPEGs',
    'Apply light grain and export final edit outputs from Lightroom.',
    'TODO',
    NULL,
    10,
    NULL
),
(
    'fb060002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010006-1234-5678-abcd-ef1234567890',
    'Upload to cloud gallery portal',
    'Upload JPEGs into structured sub-albums (ceremony, portraits, family).',
    'TODO',
    NULL,
    20,
    NULL
),

-- Task 7 Subtasks (BLOCKED)
(
    'fb070001-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010007-1234-5678-abcd-ef1234567890',
    'Locate drone SD card',
    'Verify drone pilot has dispatched the backup footage SD card.',
    'BLOCKED',
    NULL,
    10,
    NULL
),
(
    'fb070002-1234-5678-abcd-ef1234567890',
    'd3b07384-d113-4952-b1cf-9a993710787e',
    'fa010007-1234-5678-abcd-ef1234567890',
    'Import aerial wedding venue shots',
    'Import drone footages into the project timeline.',
    'TODO',
    NULL,
    20,
    NULL
)
ON CONFLICT (id) DO NOTHING;
