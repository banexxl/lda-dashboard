
export function applyPagination(documents: any, page: any, rowsPerPage: any) {

     if (!Array.isArray(documents) || typeof page !== 'number' || typeof rowsPerPage !== 'number') {
          return []; // Return an empty array or handle invalid input gracefully
     }

     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;

     return documents.slice(startIndex, endIndex);
}