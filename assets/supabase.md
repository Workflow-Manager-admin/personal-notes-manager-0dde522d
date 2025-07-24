# Supabase Integration for Notes App

This React app uses Supabase as the backend for storing notes. 

## Required Environment Variables

Set these in your environment (`.env` or deployment env):

```
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

- `REACT_APP_SUPABASE_URL`: The URL of your Supabase project (e.g. `https://xyzcompany.supabase.co`)
- `REACT_APP_SUPABASE_KEY`: The `anon` public API key (from Supabase dashboard > Project Settings > API > anon key)

## Database Table: `notes`

Create a table called `notes` in your Supabase project with the following schema:

| Column        | Type             | Special Properties        |
|---------------|------------------|--------------------------|
| id            | bigint           | Primary key, auto-incr   |
| title         | text             |                          |
| body          | text             |                          |
| last_updated  | timestamptz      | Default: `now()`         |

- The React app expects these fields for each note.
- The table should use Row Level Security (RLS) *OFF* by default for single-user scenarios, or configure policies as needed for your use case.

## Deployment Notes

- Your Supabase project must have the `notes` table.
- If you want to enable authentication and user-based notes, you must adjust the table and add policies accordingly.
- The app does not use any authentication - it is meant for personal, single-user usage.

## References

- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
