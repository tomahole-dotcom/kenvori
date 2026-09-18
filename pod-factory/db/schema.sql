create table if not exists pod_candidates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'DISCOVERED',
  source text,
  niche text,
  audience text,
  concept text not null,
  design_prompt text,
  artwork_url text,
  qa text,
  ip_risk text,
  margin_approved boolean default false,
  blueprint_id integer,
  print_provider_id integer,
  printify_product_id text,
  etsy_listing_id bigint,
  expected_margin numeric,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists pod_candidates_status_idx on pod_candidates(status);
create index if not exists pod_candidates_ip_risk_idx on pod_candidates(ip_risk);
