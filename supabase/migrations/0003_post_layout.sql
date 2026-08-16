-- Builder v2: layout-aware article bodies. JSON blocks (width / alignment /
-- columns / buttons / captions) become the render source; body_md stays as a
-- flattened mirror for old posts, search and export. NULL = pre-v2 post,
-- rendered from body_md exactly as before.
alter table public.posts add column if not exists body_blocks jsonb;
