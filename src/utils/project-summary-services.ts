import { createAdminClient } from '@/utils/supabase/admin';

export const projectSummaryServices = () => {

     const getProjectSummaryById = async (id: string) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('project_summaries').select('*').eq('id', id).maybeSingle();
          if (error) {
               console.error('Error while fetching project summary:', error);
               return null;
          }
          return data;
     }

     const getAllProjectSummaries = async () => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('project_summaries').select('*').order('created_at', { ascending: false });
          if (error) {
               console.error('Error while fetching project summaries:', error);
               return -1;
          }
          return data;
     }

     const getProjectsByPage = async (page: any, limit: any) => {
          const parsedLimit = parseInt(limit, 10);
          if (isNaN(parsedLimit) || parsedLimit <= 0) return [];

          const supabase = createAdminClient();
          const from = page * parsedLimit;
          const to = from + parsedLimit - 1;
          const { data, error } = await supabase
               .from('project_summaries')
               .select('*')
               .order('created_at', { ascending: false })
               .range(from, to);

          if (error) return { message: error.message };
          return data;
     };

     const getProjectSummariesCount = async () => {
          const supabase = createAdminClient();
          const { count, error } = await supabase.from('project_summaries').select('*', { count: 'exact', head: true });
          if (error) {
               console.error('Error while fetching project summaries count:', error);
               return -1;
          }
          return count ?? 0;
     }

     const addProjectSummary = async (projectSummary: any) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('project_summaries').insert(projectSummary).select().single();
          if (error) {
               console.error('Error while adding project summary:', error);
               return null;
          }
          return data;
     }

     const updateProjectSummary = async (id: string, updatedFields: any) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('project_summaries').update(updatedFields).eq('id', id);
          if (error) {
               console.error('Error while updating project summary:', error);
               return false;
          }
          return true;
     }

     const deleteProjectSummary = async (id: string) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('project_summaries').delete().eq('id', id);
          if (error) {
               console.error('Error while deleting project summary:', error);
               return false;
          }
          return true;
     }

     return {
          getProjectSummaryById,
          getProjectsByPage,
          getProjectSummariesCount,
          getAllProjectSummaries,
          addProjectSummary,
          updateProjectSummary,
          deleteProjectSummary,
     }
}
