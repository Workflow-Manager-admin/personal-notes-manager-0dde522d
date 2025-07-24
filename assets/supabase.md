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

**[CONFIGURED]**  
The `notes` table has been created in Supabase with the exact required schema as below:

| Column        | Type             | Special Properties        |
|---------------|------------------|--------------------------|
| id            | bigint           | Primary key, auto-incr   |
| title         | text             |                          |
| body          | text             |                          |
| last_updated  | timestamptz      | Default: `now()`         |

- The table is RLS **off** (single-user/personal mode).
- Supabase is ready for the app to connect using the environment variables below.

## Deployment Notes

- The `notes` table is present and correctly configured.
- No authentication or user columns needed (single-user).
- Update `.env` with your project's values:

```
REACT_APP_SUPABASE_URL=your-supabase-project-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

## References

- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
