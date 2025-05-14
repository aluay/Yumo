-- filepath: c:\Users\abdul\Desktop\Projects\nullix\prisma\migrations\add_fuzzy_search\migration.sql
-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- For array type, we'll use a custom function
CREATE OR REPLACE FUNCTION array_to_string_immutable(text[], text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT array_to_string($1, $2);
$_$;
