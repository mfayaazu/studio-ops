-- V32: Fix invalid enum values seeded by V31.
--
-- V31 used several invalid enum values:
--   project.payment_status = 'PENDING'          → correct to 'UNPAID'
--   project.status         = 'IN_PROGRESS'      → correct to 'POST_PRODUCTION'
--   project.booking_status = 'CONFIRMED'        → correct to 'CONTRACT_SIGNED'
--   deliverable.deliverable_type = 'HIGHLIGHT_FILM' → correct to 'TEASER'
--   deliverable.deliverable_type = 'ALBUM'          → correct to 'ALBUM_DESIGN'
--   deliverable.deliverable_type = 'RAW_FILES'      → correct to 'HARD_DISK'
--   deliverable.status     = 'IN_REVIEW'        → correct to 'READY_FOR_REVIEW'

UPDATE project
SET payment_status = 'UNPAID'
WHERE payment_status = 'PENDING'
  AND studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e';

UPDATE project
SET status = 'POST_PRODUCTION'
WHERE status = 'IN_PROGRESS'
  AND studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e';

UPDATE project
SET booking_status = 'CONTRACT_SIGNED'
WHERE booking_status = 'CONFIRMED'
  AND studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e';

UPDATE deliverable
SET deliverable_type = 'TEASER'
WHERE deliverable_type = 'HIGHLIGHT_FILM'
  AND studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e';

UPDATE deliverable
SET deliverable_type = 'ALBUM_DESIGN'
WHERE deliverable_type = 'ALBUM'
  AND studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e';

UPDATE deliverable
SET deliverable_type = 'HARD_DISK'
WHERE deliverable_type = 'RAW_FILES'
  AND studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e';

UPDATE deliverable
SET status = 'READY_FOR_REVIEW'
WHERE status = 'IN_REVIEW'
  AND studio_id = 'd3b07384-d113-4952-b1cf-9a993710787e';

