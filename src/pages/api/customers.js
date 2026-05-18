import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Fetch users using the admin API
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000 // Fetch up to 1000 users at once
    });

    if (usersError) throw usersError;

    // Fetch addresses to get names and phone numbers
    const { data: addresses, error: addressesError } = await supabaseAdmin
      .from('addresses')
      .select('user_id, full_name, phone_number')
      .order('created_at', { ascending: false });
      
    if (addressesError) throw addressesError;

    // Map addresses to users
    const usersWithAddresses = users.map(user => {
      // Find the most recent address for this user
      const userAddress = addresses.find(addr => addr.user_id === user.id);
      
      return {
        ...user,
        address_name: userAddress?.full_name || null,
        phone_number: userAddress?.phone_number || null
      };
    });

    return res.status(200).json(usersWithAddresses);
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
