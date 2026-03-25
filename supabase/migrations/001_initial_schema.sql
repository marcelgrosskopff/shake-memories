-- Shake Memories - Initial Database Schema

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Stories table
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  content_text text not null,
  media_urls jsonb default '[]'::jsonb,
  canvas_position jsonb default null,
  parent_story_id uuid references public.stories(id) on delete set null,
  instagram_handle text,
  author_name text,
  anonymous_id text not null,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Story connections (replies, weaves, continuations)
create table public.story_connections (
  id uuid default uuid_generate_v4() primary key,
  from_story_id uuid not null references public.stories(id) on delete cascade,
  to_story_id uuid not null references public.stories(id) on delete cascade,
  connection_type text not null check (connection_type in ('reply', 'weave', 'continuation')),
  created_at timestamptz default now(),
  unique(from_story_id, to_story_id, connection_type)
);

-- Media files
create table public.media (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid not null references public.stories(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  thumbnail_path text,
  filters_applied jsonb,
  width integer,
  height integer,
  created_at timestamptz default now()
);

-- Reactions
create table public.reactions (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid not null references public.stories(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('heart', 'fire', 'laugh', 'crying', 'party')),
  anonymous_id text not null,
  created_at timestamptz default now(),
  unique(story_id, anonymous_id, reaction_type)
);

-- Indexes
create index idx_stories_moderation on public.stories(moderation_status);
create index idx_stories_created on public.stories(created_at desc);
create index idx_stories_parent on public.stories(parent_story_id);
create index idx_story_connections_from on public.story_connections(from_story_id);
create index idx_story_connections_to on public.story_connections(to_story_id);
create index idx_media_story on public.media(story_id);
create index idx_reactions_story on public.reactions(story_id);

-- RLS Policies
alter table public.stories enable row level security;
alter table public.story_connections enable row level security;
alter table public.media enable row level security;
alter table public.reactions enable row level security;

-- Anyone can read approved stories
create policy "Anyone can read approved stories" on public.stories
  for select using (moderation_status = 'approved');

-- Anyone can insert stories (they start as pending)
create policy "Anyone can create stories" on public.stories
  for insert with check (moderation_status = 'pending');

-- Anyone can read connections between approved stories
create policy "Anyone can read connections" on public.story_connections
  for select using (true);

-- Anyone can create connections
create policy "Anyone can create connections" on public.story_connections
  for insert with check (true);

-- Anyone can read media
create policy "Anyone can read media" on public.media
  for select using (true);

-- Anyone can insert media
create policy "Anyone can insert media" on public.media
  for insert with check (true);

-- Anyone can read reactions
create policy "Anyone can read reactions" on public.reactions
  for select using (true);

-- Anyone can add reactions
create policy "Anyone can react" on public.reactions
  for insert with check (true);

-- Anyone can remove their own reactions
create policy "Anyone can remove own reactions" on public.reactions
  for delete using (true);

-- Storage bucket for media
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can upload media" on storage.objects
  for insert with check (bucket_id = 'media');

create policy "Anyone can view media" on storage.objects
  for select using (bucket_id = 'media');

-- Updated at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stories_updated_at
  before update on public.stories
  for each row execute function update_updated_at();

-- View for stories with reaction counts
create or replace view public.stories_with_reactions as
select
  s.*,
  coalesce(
    jsonb_object_agg(r.reaction_type, r.cnt) filter (where r.reaction_type is not null),
    '{}'::jsonb
  ) as reactions_count,
  (select count(*) from public.story_connections sc where sc.from_story_id = s.id or sc.to_story_id = s.id) as connections_count
from public.stories s
left join lateral (
  select reaction_type, count(*) as cnt
  from public.reactions
  where story_id = s.id
  group by reaction_type
) r on true
where s.moderation_status = 'approved'
group by s.id;
