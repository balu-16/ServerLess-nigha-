// Supabase-based prisma-like client for Lambda handlers
import { supabase } from './supabase-client'

// Export the supabase client for direct access
export { supabase }

// Prisma-like interface for backward compatibility with Lambda handlers
export const prisma = {
  // User model operations
  user: {
    findUnique: async (args: { where: { id?: number; phoneNumber?: string }; select?: any }): Promise<any> => {
      const selectFields = args.select 
        ? Object.keys(args.select).filter(k => args.select[k]).join(',') 
        : '*';
      let query = supabase.from('User').select(selectFields);
      
      if (args.where.id) query = query.eq('id', args.where.id);
      if (args.where.phoneNumber) query = query.eq('phoneNumber', args.where.phoneNumber);
      
      const { data, error } = await query.single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    findMany: async (args?: { where?: any; select?: any; orderBy?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.select) {
        selectFields = Object.keys(args.select).filter(k => args.select[k]).join(',');
      }
      
      let query = supabase.from('User').select(selectFields);
      if (args?.where?.role?.in) query = query.in('role', args.where.role.in);
      if (args?.orderBy) {
        const field = Object.keys(args.orderBy)[0];
        query = query.order(field, { ascending: args.orderBy[field] !== 'desc' });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await supabase.from('User').insert(args.data).select().single();
      if (error) throw error;
      return data;
    },

    update: async (args: { where: { id?: number; phoneNumber?: string }; data: any }): Promise<any> => {
      let query = supabase.from('User').update(args.data);
      if (args.where.id) query = query.eq('id', args.where.id);
      if (args.where.phoneNumber) query = query.eq('phoneNumber', args.where.phoneNumber);
      
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    },

    delete: async (args: { where: { id: number } }): Promise<any> => {
      const { error } = await supabase.from('User').delete().eq('id', args.where.id);
      if (error) throw error;
      return { id: args.where.id };
    },
  },

  // OTP model operations  
  oTP: {
    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await supabase.from('OTP').insert(args.data).select().single();
      if (error) throw error;
      return data;
    },

    findFirst: async (args: { where: any; orderBy?: any }): Promise<any> => {
      let query = supabase.from('OTP').select('*');
      
      if (args.where.phoneNumber) query = query.eq('phoneNumber', args.where.phoneNumber);
      if (args.where.otp) query = query.eq('otp', args.where.otp);
      if (args.where.isUsed !== undefined) query = query.eq('isUsed', args.where.isUsed);
      if (args.where.expiresAt?.gt) query = query.gt('expiresAt', args.where.expiresAt.gt.toISOString());
      
      if (args.orderBy) {
        const field = Object.keys(args.orderBy)[0];
        query = query.order(field, { ascending: args.orderBy[field] !== 'desc' });
      }
      
      const { data, error } = await query.limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },

    update: async (args: { where: { id: number }; data: any }): Promise<any> => {
      const { data, error } = await supabase.from('OTP').update(args.data).eq('id', args.where.id).select().single();
      if (error) throw error;
      return data;
    },

    updateMany: async (args: { where: { phoneNumber?: string; isUsed?: boolean }; data: any }): Promise<any> => {
      let query = supabase.from('OTP').update(args.data);
      if (args.where.phoneNumber) query = query.eq('phoneNumber', args.where.phoneNumber);
      if (args.where.isUsed !== undefined) query = query.eq('isUsed', args.where.isUsed);
      
      const { data, error } = await query.select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },

    deleteMany: async (args: { where: { phoneNumber?: string; isUsed?: boolean; expiresAt?: { lt?: Date } } }): Promise<any> => {
      let query = supabase.from('OTP').delete();
      if (args.where.phoneNumber) query = query.eq('phoneNumber', args.where.phoneNumber);
      if (args.where.isUsed !== undefined) query = query.eq('isUsed', args.where.isUsed);
      if (args.where.expiresAt?.lt) query = query.lt('expiresAt', args.where.expiresAt.lt.toISOString());
      
      const { data, error } = await query.select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },
  },

  // Device model operations
  device: {
    findUnique: async (args: { where: { id?: number; code?: string }; select?: any; include?: any }): Promise<any> => {
      let selectFields = '*';
      if (args.select) {
        selectFields = Object.keys(args.select).filter(k => args.select[k]).join(',');
      }
      if (args.include?.user) {
        selectFields = selectFields === '*' ? '*, user:User!assignedTo(id, name, phoneNumber)' : `${selectFields}, user:User!assignedTo(id, name, phoneNumber)`;
      }
      
      let query = supabase.from('Device').select(selectFields);
      if (args.where.id) query = query.eq('id', args.where.id);
      if (args.where.code) query = query.eq('code', args.where.code);
      
      const { data, error } = await query.single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    findMany: async (args?: { where?: any; include?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.include?.user) {
        selectFields = '*, user:User!assignedTo(id, name)';
      }
      
      let query = supabase.from('Device').select(selectFields);
      if (args?.where?.assignedTo) query = query.eq('assignedTo', args.where.assignedTo);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await supabase.from('Device').insert(args.data).select().single();
      if (error) throw error;
      return data;
    },

    createMany: async (args: { data: any[] }): Promise<any> => {
      const { data, error } = await supabase.from('Device').insert(args.data).select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },

    update: async (args: { where: { id?: number; code?: string }; data: any }): Promise<any> => {
      let query = supabase.from('Device').update(args.data);
      if (args.where.id) query = query.eq('id', args.where.id);
      if (args.where.code) query = query.eq('code', args.where.code);
      
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    },

    updateMany: async (args: { where: { code?: string; assignedTo?: null }; data: any }): Promise<any> => {
      let query = supabase.from('Device').update(args.data);
      if (args.where.code) query = query.eq('code', args.where.code);
      if (args.where.assignedTo === null) query = query.is('assignedTo', null);
      
      const { data, error } = await query.select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },
  },

  // Tracking model operations
  tracking: {
    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await supabase.from('Tracking').insert(args.data).select().single();
      if (error) throw error;
      return data;
    },

    findMany: async (args?: { where?: any; orderBy?: any; take?: number; skip?: number; select?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.select) {
        selectFields = Object.keys(args.select).filter(k => args.select[k]).join(',');
      }
      let query = supabase.from('Tracking').select(selectFields);
      
      if (args?.where?.deviceCode) query = query.eq('deviceCode', args.where.deviceCode);
      if (args?.where?.trackedAt?.gte) query = query.gte('trackedAt', args.where.trackedAt.gte.toISOString());
      if (args?.where?.trackedAt?.lte) query = query.lte('trackedAt', args.where.trackedAt.lte.toISOString());
      
      if (args?.orderBy) {
        const field = Object.keys(args.orderBy)[0];
        query = query.order(field, { ascending: args.orderBy[field] !== 'desc' });
      }
      
      if (args?.take) query = query.limit(args.take);
      if (args?.skip) query = query.range(args.skip, args.skip + (args.take || 100) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    count: async (args?: { where?: any }): Promise<number> => {
      let query = supabase.from('Tracking').select('*', { count: 'exact', head: true });
      
      if (args?.where?.deviceCode) query = query.eq('deviceCode', args.where.deviceCode);
      if (args?.where?.trackedAt?.gte) query = query.gte('trackedAt', args.where.trackedAt.gte.toISOString());
      if (args?.where?.trackedAt?.lte) query = query.lte('trackedAt', args.where.trackedAt.lte.toISOString());
      
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  },

  // SharedDevice model operations
  sharedDevice: {
    findFirst: async (args: { where: { deviceId?: number; userId?: number } }): Promise<any> => {
      let query = supabase.from('SharedDevice').select('*');
      if (args.where.deviceId) query = query.eq('deviceId', args.where.deviceId);
      if (args.where.userId) query = query.eq('userId', args.where.userId);
      
      const { data, error } = await query.limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },

    findMany: async (args?: { where?: { userId?: number; deviceId?: number }; include?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.include?.device) selectFields = '*, device:Device(*)';
      if (args?.include?.user) selectFields += ', user:User(id, name, phoneNumber)';
      
      let query = supabase.from('SharedDevice').select(selectFields);
      if (args?.where?.userId) query = query.eq('userId', args.where.userId);
      if (args?.where?.deviceId) query = query.eq('deviceId', args.where.deviceId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (args: { data: { deviceId: number; userId: number } }): Promise<any> => {
      const { data, error } = await supabase.from('SharedDevice').insert(args.data).select().single();
      if (error) throw error;
      return data;
    },

    delete: async (args: { where: { deviceId_userId: { deviceId: number; userId: number } } }): Promise<any> => {
      const { error } = await supabase
        .from('SharedDevice')
        .delete()
        .eq('deviceId', args.where.deviceId_userId.deviceId)
        .eq('userId', args.where.deviceId_userId.userId);
      if (error) throw error;
      return args.where.deviceId_userId;
    },
  },
}