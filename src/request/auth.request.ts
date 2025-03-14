import { Request } from 'express';
import { User } from '@supabase/supabase-js'; // Import User type from Supabase

export interface AuthRequest extends Request {
  /** Supabase Auth User */
  user?: User;
}
