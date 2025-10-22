import type { SupaUser } from "../types/supaUser.js";

export default (user: SupaUser) => user.admin ? 'admin' : 'employee';