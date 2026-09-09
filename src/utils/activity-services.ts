import { createAdminClient } from '@/utils/supabase/admin';

export const ActivitiesServices = () => {

     const getActivityById = async (id: string) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('activities').select('*').eq('id', id).maybeSingle();
          if (error) {
               console.error('Error while fetching activity:', error);
               return null;
          }
          return data;
     }

     const getAllActivities = async () => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
          if (error) {
               console.error('Error while fetching activities:', error);
               return -1;
          }
          return data;
     }

     const getActivitiesByPage = async (page: any, limit: any) => {
          const parsedLimit = parseInt(limit, 10);
          if (isNaN(parsedLimit) || parsedLimit <= 0) return [];

          const supabase = createAdminClient();
          const from = page * parsedLimit;
          const to = from + parsedLimit - 1;
          const { data, error } = await supabase
               .from('activities')
               .select('*')
               .order('created_at', { ascending: false })
               .range(from, to);

          if (error) return { message: error.message };
          return data;
     };

     const getActivitiesCount = async () => {
          const supabase = createAdminClient();
          const { count, error } = await supabase.from('activities').select('*', { count: 'exact', head: true });
          if (error) {
               console.error('Error while fetching activities count:', error);
               return -1;
          }
          return count ?? 0;
     }

     const addActivity = async (activity: any) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('activities').insert(activity).select().single();
          if (error) {
               console.error('Error while adding activity:', error);
               return null;
          }
          return data;
     }

     const updateActivity = async (id: string, updatedFields: any) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('activities').update(updatedFields).eq('id', id);
          if (error) {
               console.error('Error while updating activity:', error);
               return false;
          }
          return true;
     }

     const deleteActivity = async (id: string) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('activities').delete().eq('id', id);
          if (error) {
               console.error('Error while deleting activity:', error);
               return false;
          }
          return true;
     }

     return {
          getActivityById,
          getActivitiesByPage,
          getActivitiesCount,
          getAllActivities,
          addActivity,
          updateActivity,
          deleteActivity,
     }
}
