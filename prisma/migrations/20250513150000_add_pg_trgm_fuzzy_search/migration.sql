-- Enable the pg_trgm extension for fuzzy search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for text-based fields to speed up similarity searches
CREATE INDEX user_name_trgm_idx ON "User" USING GIN (name gin_trgm_ops);
CREATE INDEX user_email_trgm_idx ON "User" USING GIN (email gin_trgm_ops);
CREATE INDEX post_title_trgm_idx ON "Post" USING GIN (title gin_trgm_ops);
CREATE INDEX post_description_trgm_idx ON "Post" USING GIN (description gin_trgm_ops);

-- Create an immutable function to support indexing arrays of text
-- pg_trgm requires immutable functions for indexing
CREATE OR REPLACE FUNCTION array_to_string_immutable(text[], text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $_$ SELECT array_to_string($1, $2); $_$;

-- Create a GIN index for the tags array
CREATE INDEX post_tags_trgm_idx ON "Post" USING GIN (array_to_string_immutable(tags, ' ') gin_trgm_ops);
