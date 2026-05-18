const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://qnhwhvvylpeawztyayjy.supabase.co";
const supabaseKey = "sb_publishable_2Dn4fWw9-l_tssUzTzjNJQ_FXHL8sAf";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking for 'users' table...");
  const { data: users, error: err1 } = await supabase.from('users').select('*').limit(1);
  console.log("users:", users ? "Exists" : err1.message);

  console.log("Checking for 'profiles' table...");
  const { data: profiles, error: err2 } = await supabase.from('profiles').select('*').limit(1);
  console.log("profiles:", profiles ? "Exists" : err2.message);
}

check();
