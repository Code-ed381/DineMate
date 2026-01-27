const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
async function check() {
  const { data, error } = await supabase.from('menu_items').select('type').limit(100);
  if (error) console.error(error);
  const counts = {};
  data.forEach(i => counts[i.type] = (counts[i.type] || 0) + 1);
  console.log(counts);
}
check();
