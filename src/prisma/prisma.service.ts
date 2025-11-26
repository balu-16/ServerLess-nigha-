import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase-based service that provides a Prisma-like interface
@Injectable()
export class PrismaService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async onModuleInit() {
    // Supabase client is ready to use
  }

  // User model operations
  user = {
    findUnique: async (args: { where: { id?: number; phoneNumber?: string }; select?: any }): Promise<any> => {
      const selectFields = args.select 
        ? Object.keys(args.select).filter(k => args.select[k]).join(',') 
        : '*';
      let query = this.supabase.from('User').select(selectFields);
      
      if (args.where.id) {
        query = query.eq('id', args.where.id);
      }
      if (args.where.phoneNumber) {
        query = query.eq('phoneNumber', args.where.phoneNumber);
      }
      
      const { data, error } = await query.single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    findMany: async (args?: { where?: any; select?: any; orderBy?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.select) {
        selectFields = Object.keys(args.select).filter(k => args.select[k]).join(',');
      }
      
      let query = this.supabase.from('User').select(selectFields);
      
      if (args?.where?.role?.in) {
        query = query.in('role', args.where.role.in);
      }
      
      if (args?.orderBy) {
        const field = Object.keys(args.orderBy)[0];
        const direction = args.orderBy[field] === 'desc';
        query = query.order(field, { ascending: !direction });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('User')
        .insert(args.data)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (args: { where: { id?: number; phoneNumber?: string }; data: any }): Promise<any> => {
      let query = this.supabase.from('User').update(args.data);
      
      if (args.where.id) {
        query = query.eq('id', args.where.id);
      }
      if (args.where.phoneNumber) {
        query = query.eq('phoneNumber', args.where.phoneNumber);
      }
      
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    },

    delete: async (args: { where: { id: number } }): Promise<any> => {
      const { error } = await this.supabase
        .from('User')
        .delete()
        .eq('id', args.where.id);
      if (error) throw error;
      return { id: args.where.id };
    },
  };

  // OTP model operations  
  oTP = {
    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('OTP')
        .insert(args.data)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    findFirst: async (args: { where: any; orderBy?: any }): Promise<any> => {
      let query = this.supabase.from('OTP').select('*');
      
      if (args.where.phoneNumber) {
        query = query.eq('phoneNumber', args.where.phoneNumber);
      }
      if (args.where.otp) {
        query = query.eq('otp', args.where.otp);
      }
      if (args.where.isUsed !== undefined) {
        query = query.eq('isUsed', args.where.isUsed);
      }
      if (args.where.expiresAt?.gt) {
        query = query.gt('expiresAt', args.where.expiresAt.gt.toISOString());
      }
      
      if (args.orderBy) {
        const field = Object.keys(args.orderBy)[0];
        const direction = args.orderBy[field] === 'desc';
        query = query.order(field, { ascending: !direction });
      }
      
      query = query.limit(1);
      
      const { data, error } = await query;
      if (error) throw error;
      return data?.[0] || null;
    },

    update: async (args: { where: { id: number }; data: any }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('OTP')
        .update(args.data)
        .eq('id', args.where.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    updateMany: async (args: { where: { phoneNumber?: string; isUsed?: boolean }; data: any }): Promise<any> => {
      let query = this.supabase.from('OTP').update(args.data);
      
      if (args.where.phoneNumber) {
        query = query.eq('phoneNumber', args.where.phoneNumber);
      }
      if (args.where.isUsed !== undefined) {
        query = query.eq('isUsed', args.where.isUsed);
      }
      
      const { data, error } = await query.select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },

    deleteMany: async (args: { where: { expiresAt?: { lt: Date } } }): Promise<any> => {
      let query = this.supabase.from('OTP').delete();
      
      if (args.where.expiresAt?.lt) {
        query = query.lt('expiresAt', args.where.expiresAt.lt.toISOString());
      }
      
      const { data, error } = await query.select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },
  };

  // Device model operations
  device = {
    findUnique: async (args: { where: { id?: number; code?: string; iotSimNumber?: string }; select?: any; include?: any }): Promise<any> => {
      let selectFields = '*';
      if (args.select) {
        selectFields = Object.keys(args.select).filter(k => args.select[k]).join(',');
      }
      if (args.include?.user) {
        selectFields = selectFields === '*' ? '*, user:User(id, name)' : `${selectFields}, user:User(id, name)`;
      }
      
      let query = this.supabase.from('Device').select(selectFields);
      
      if (args.where.id) {
        query = query.eq('id', args.where.id);
      }
      if (args.where.code) {
        query = query.eq('code', args.where.code);
      }
      if (args.where.iotSimNumber) {
        query = query.eq('iotSimNumber', args.where.iotSimNumber);
      }
      
      const { data, error } = await query.single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    findMany: async (args?: { where?: any; include?: any; select?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.include?.user) {
        selectFields = '*, user:User!assignedTo(id, name)';
      }
      
      let query = this.supabase.from('Device').select(selectFields);
      
      if (args?.where?.assignedTo) {
        query = query.eq('assignedTo', args.where.assignedTo);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('Device')
        .insert(args.data)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    createMany: async (args: { data: any[] }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('Device')
        .insert(args.data)
        .select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },

    update: async (args: { where: { id?: number; code?: string }; data: any }): Promise<any> => {
      let query = this.supabase.from('Device').update(args.data);
      
      if (args.where.id) {
        query = query.eq('id', args.where.id);
      }
      if (args.where.code) {
        query = query.eq('code', args.where.code);
      }
      
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data;
    },

    updateMany: async (args: { where: { code?: string; assignedTo?: null }; data: any }): Promise<any> => {
      let query = this.supabase.from('Device').update(args.data);
      
      if (args.where.code) {
        query = query.eq('code', args.where.code);
      }
      if (args.where.assignedTo === null) {
        query = query.is('assignedTo', null);
      }
      
      const { data, error } = await query.select();
      if (error) throw error;
      return { count: data?.length || 0 };
    },
  };

  // Tracking model operations
  tracking = {
    create: async (args: { data: any }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('Tracking')
        .insert(args.data)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    findMany: async (args?: { where?: any; orderBy?: any; take?: number; skip?: number; select?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.select) {
        selectFields = Object.keys(args.select).filter(k => args.select[k]).join(',');
      }
      let query = this.supabase.from('Tracking').select(selectFields);
      
      if (args?.where?.deviceCode) {
        query = query.eq('deviceCode', args.where.deviceCode);
      }
      if (args?.where?.trackedAt?.gte) {
        query = query.gte('trackedAt', args.where.trackedAt.gte.toISOString());
      }
      if (args?.where?.trackedAt?.lte) {
        query = query.lte('trackedAt', args.where.trackedAt.lte.toISOString());
      }
      
      if (args?.orderBy) {
        const field = Object.keys(args.orderBy)[0];
        const direction = args.orderBy[field] === 'desc';
        query = query.order(field, { ascending: !direction });
      }
      
      if (args?.take) query = query.limit(args.take);
      if (args?.skip) query = query.range(args.skip, args.skip + (args.take || 100) - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    count: async (args?: { where?: any }): Promise<number> => {
      let query = this.supabase.from('Tracking').select('*', { count: 'exact', head: true });
      
      if (args?.where?.deviceCode) {
        query = query.eq('deviceCode', args.where.deviceCode);
      }
      if (args?.where?.trackedAt?.gte) {
        query = query.gte('trackedAt', args.where.trackedAt.gte.toISOString());
      }
      if (args?.where?.trackedAt?.lte) {
        query = query.lte('trackedAt', args.where.trackedAt.lte.toISOString());
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  };

  // SharedDevice model operations
  sharedDevice = {
    findFirst: async (args: { where: { deviceId?: number; userId?: number } }): Promise<any> => {
      let query = this.supabase.from('SharedDevice').select('*');
      
      if (args.where.deviceId) {
        query = query.eq('deviceId', args.where.deviceId);
      }
      if (args.where.userId) {
        query = query.eq('userId', args.where.userId);
      }
      
      query = query.limit(1);
      
      const { data, error } = await query;
      if (error) throw error;
      return data?.[0] || null;
    },

    findUnique: async (args: { where: { deviceId_userId: { deviceId: number; userId: number } } }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('SharedDevice')
        .select('*')
        .eq('deviceId', args.where.deviceId_userId.deviceId)
        .eq('userId', args.where.deviceId_userId.userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    findMany: async (args?: { where?: { userId?: number; deviceId?: number }; include?: any }): Promise<any> => {
      let selectFields = '*';
      if (args?.include?.device) {
        selectFields = '*, device:Device(*)';
        if (args.include.device.include?.user) {
          selectFields = '*, device:Device(*, user:User!assignedTo(id, name))';
        }
      }
      if (args?.include?.user) {
        selectFields = selectFields.includes('device') 
          ? `${selectFields}, user:User(id, name, phoneNumber)`
          : '*, user:User(id, name, phoneNumber)';
      }
      
      let query = this.supabase.from('SharedDevice').select(selectFields);
      
      if (args?.where?.userId) {
        query = query.eq('userId', args.where.userId);
      }
      if (args?.where?.deviceId) {
        query = query.eq('deviceId', args.where.deviceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    create: async (args: { data: { deviceId: number; userId: number } }): Promise<any> => {
      const { data, error } = await this.supabase
        .from('SharedDevice')
        .insert(args.data)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (args: { where: { deviceId_userId: { deviceId: number; userId: number } } }): Promise<any> => {
      const { error } = await this.supabase
        .from('SharedDevice')
        .delete()
        .eq('deviceId', args.where.deviceId_userId.deviceId)
        .eq('userId', args.where.deviceId_userId.userId);
      if (error) throw error;
      return { deviceId: args.where.deviceId_userId.deviceId, userId: args.where.deviceId_userId.userId };
    },
  };
}
