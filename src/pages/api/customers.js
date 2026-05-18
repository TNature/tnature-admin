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

    // Fetch addresses to get full details
    const { data: addresses, error: addressesError } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (addressesError) throw addressesError;

    // Map addresses to users
    const usersWithAddresses = users.map(user => {
      // Find all addresses for this user
      const userAddresses = addresses.filter(addr => addr.user_id === user.id);
      const mainAddress = userAddresses.length > 0 ? userAddresses[0] : null;
      
      return {
        ...user,
        address_name: mainAddress?.full_name || null,
        phone_number: mainAddress?.phone_number || null,
        addresses: userAddresses
      };
    });

    return res.status(200).json(usersWithAddresses);
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
