# How to Reset the Database

## Quick Reset

To completely reset the database (removes ALL data):

```sql
mysql -u root -p330122 < database_schema.sql
```

Or in MySQL Workbench:
1. Open `database_schema.sql`
2. Execute the script (F5 or Execute button)

## What Happens

1. **Drops the entire database** - All data is deleted
2. **Creates fresh database** - Clean slate
3. **Creates all tables** - Empty tables ready for use

## After Reset

You'll need to:
1. Create a new admin account at `/setup`
2. Add partners again (or they can sign up again)
3. All previous data will be gone

## Important Notes

⚠️ **WARNING**: This will delete:
- All admin accounts
- All affiliate partner accounts
- All affiliate links
- All click tracking data
- All demo requests
- All statistics

**Make sure you want to reset before running!**

## Alternative: Reset Specific Tables Only

If you only want to clear data but keep the structure:

```sql
USE gleen_affiliate;

TRUNCATE TABLE demo_requests;
TRUNCATE TABLE link_clicks;
TRUNCATE TABLE affiliate_links;
TRUNCATE TABLE partners;
TRUNCATE TABLE users;
```

This keeps the tables but removes all data.
