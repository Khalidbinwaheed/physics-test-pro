const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
const envs = {};
envStr.split('\n').forEach(line => {
  const parts = line.split('=');
  if(parts.length>=2) envs[parts[0]] = parts.slice(1).join('=').replace(/"/g, '').trim();
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envs.VITE_SUPABASE_URL, envs.VITE_SUPABASE_PUBLISHABLE_KEY);
supabase.from('profiles').select('*').then(res => console.log(JSON.stringify(res, null, 2)));
