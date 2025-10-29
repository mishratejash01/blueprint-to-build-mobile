-- Rename the enum value from 'delivery_partner' to 'partner' to match the PRD
ALTER TYPE user_role RENAME VALUE 'delivery_partner' TO 'partner';