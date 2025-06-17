-- Add geocoding fields to jobs table for map functionality
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(latitude, longitude);

-- Add a check constraint to ensure both lat/lng are provided together
ALTER TABLE jobs ADD CONSTRAINT check_coordinates 
  CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL)); 