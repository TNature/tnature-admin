const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://qnhwhvvylpeawztyayjy.supabase.co";
const supabaseKey = "sb_publishable_2Dn4fWw9-l_tssUzTzjNJQ_FXHL8sAf";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: orders, error: fetchError } = await supabase
    .from("orders")
    .select("id, status")
    .limit(1);

  if (fetchError) {
    console.error("Fetch Error:", fetchError);
    return;
  }

  console.log("Orders:", orders);

  if (orders.length > 0) {
    const orderId = orders[0].id;
    console.log("Attempting to update order:", orderId);
    
    const { data, error } = await supabase
      .from("orders")
      .update({ status: 'shipped' })
      .eq("id", orderId)
      .select();

    console.log("Update Result:", { data, error });
  }
}

test();
