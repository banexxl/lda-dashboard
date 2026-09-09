import { createAdminClient } from '@/utils/supabase/admin';

export const PublicationsServices = () => {
     const getPublicationById = async (id: string) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase.from('publications').select('*').eq('id', id).maybeSingle();
          if (error) {
               console.error('Error while fetching publication:', error);
               return null;
          }
          return data;
     };

     const getAllPublications = async () => {
          const supabase = createAdminClient();
          const { data, error } = await supabase
               .from('publications')
               .select('*')
               .order('publication_uploaded_date_time', { ascending: false });
          if (error) {
               console.error('Error while fetching publications:', error);
               return -1;
          }
          return data;
     };

     const getPublicationsByPage = async (page: number, limit: number) => {
          const parsedLimit = parseInt(limit.toString(), 10);
          if (isNaN(parsedLimit) || parsedLimit <= 0) return [];

          const supabase = createAdminClient();
          const from = page * parsedLimit;
          const to = from + parsedLimit - 1;
          const { data, error } = await supabase
               .from('publications')
               .select('*')
               .order('publication_uploaded_date_time', { ascending: false })
               .range(from, to);

          if (error) {
               console.error('Error while fetching publications by page:', error);
               return { message: error.message };
          }
          return data;
     };

     const getPublicationsCount = async () => {
          const supabase = createAdminClient();
          const { count, error } = await supabase
               .from('publications')
               .select('*', { count: 'exact', head: true });
          if (error) {
               console.error('Error while fetching publications count:', error);
               return -1;
          }
          return count ?? 0;
     };

     const updatePublication = async (id: string, updatedPublication: any) => {
          const supabase = createAdminClient();
          const { error } = await supabase
               .from('publications')
               .update({
                    publication_title: updatedPublication.publication_title,
                    publication_url: updatedPublication.publication_url,
                    publication_image_url: updatedPublication.publication_image_url,
                    publication_uploaded_date_time: updatedPublication.publication_uploaded_date_time,
               })
               .eq('id', id);

          if (error) {
               console.error('Error while updating publication:', error);
               return false;
          }
          return true;
     };

     const deletePublication = async (id: string) => {
          const supabase = createAdminClient();
          const { error } = await supabase.from('publications').delete().eq('id', id);
          if (error) {
               console.error('Error while deleting publication:', error);
               return false;
          }
          return true;
     };

     const addPublication = async (publication: any) => {
          const supabase = createAdminClient();
          const { data, error } = await supabase
               .from('publications')
               .insert({
                    publication_title: publication.publication_title,
                    publication_url: publication.publication_url,
                    publication_image_url: publication.publication_image_url,
                    publication_uploaded_date_time: publication.publication_uploaded_date_time,
               })
               .select()
               .single();

          if (error) {
               console.error('Error while adding publication:', error);
               return null;
          }
          return data;
     };

     return {
          getPublicationById,
          getAllPublications,
          getPublicationsByPage,
          getPublicationsCount,
          updatePublication,
          deletePublication,
          addPublication,
     };
};

export type Publication = {
     id: string;
     publication_title: string;
     publication_url: string;
     publication_image_url: string;
     publication_uploaded_date_time: string;
};
