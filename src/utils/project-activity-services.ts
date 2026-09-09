import { createAdminClient } from '@/utils/supabase/admin';

export const projectActivitiesServices = () => {

     const getProjectActivityById = async (id: string) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('project_activities').select('*').eq('id', id).maybeSingle();
          if (error) {
               console.error('Error while fetching project activity:', error);
               return null;
          }
          return data;
     }

     const getAllProjectActivities = async () => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('project_activities').select('*').order('created_at', { ascending: false });
          if (error) {
               console.error('Error while fetching project activities:', error);
               return -1;
          }
          return data;
     }

     const getProjectActivitiesByPage = async (page: any, limit: any) => {
          const parsedLimit = parseInt(limit, 10);
          if (isNaN(parsedLimit) || parsedLimit <= 0) return [];

          const supabase = createAdminClient();
          const from = page * parsedLimit;
          const to = from + parsedLimit - 1;
          const { data, error } = await supabase
               .from('project_activities')
               .select('*')
               .order('created_at', { ascending: false })
               .range(from, to);

          if (error) return { message: error.message };
          return data;
     };

     const getProjectActivitiesCount = async () => {
          const supabase = createAdminClient();
          const { count, error } = await supabase.from('project_activities').select('*', { count: 'exact', head: true });
          if (error) {
               console.error('Error while fetching project activities count:', error);
               return -1;
          }
          return count ?? 0;
     }

     const addProjectActivity = async (projectActivity: any) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('project_activities').insert(projectActivity).select().single();
          if (error) {
               console.error('Error while adding project activity:', error);
               return null;
          }
          return data;
     }

     const updateProjectActivity = async (id: string, updatedFields: any) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('project_activities').update(updatedFields).eq('id', id);
          if (error) {
               console.error('Error while updating project activity:', error);
               return false;
          }
          return true;
     }

     const deleteProjectActivity = async (id: string) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('project_activities').delete().eq('id', id);
          if (error) {
               console.error('Error while deleting project activity:', error);
               return false;
          }
          return true;
     }

     return {
          getProjectActivityById,
          getProjectActivitiesByPage,
          getProjectActivitiesCount,
          getAllProjectActivities,
          addProjectActivity,
          updateProjectActivity,
          deleteProjectActivity,
     }
}
