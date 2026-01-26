import { supabase } from '../lib/supabase'

export const database_logs = async (waiterName: string, action: string, details: any = {}) => {
    const { error } = await supabase
        .from('logs')
        .insert([
            { waiterName: waiterName, action: action, details: details },
        ])
        .select()
          
    if (error) {
      console.error('Logging failed:', error.message);
    }
}
