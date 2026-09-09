import { useMemo, useState } from 'react';

export function useFilterableList<T>(items: T[] | undefined | null, searchableFields: (keyof T)[], initialRowsPerPage = 10) {
     const [searchQuery, setSearchQuery] = useState('');
     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

     const filteredItems = useMemo(() => {
          const source = Array.isArray(items) ? items : [];
          const query = searchQuery.trim().toLowerCase();
          if (!query) return source;

          return source.filter((item: any) => {
               return searchableFields.some((field) => {
                    const value = item?.[field];
                    return typeof value === 'string' && value.toLowerCase().includes(query);
               });
          });
     }, [items, searchableFields, searchQuery]);

     const pagedItems = useMemo(() => {
          const startIndex = page * rowsPerPage;
          return filteredItems.slice(startIndex, startIndex + rowsPerPage);
     }, [filteredItems, page, rowsPerPage]);

     const handlePageChange = (_event: any, newPage: number) => {
          setPage(newPage);
     };

     const handleRowsPerPageChange = (event: any) => {
          const newRowsPerPage = parseInt(event.target.value, 10) || initialRowsPerPage;
          setRowsPerPage(newRowsPerPage);
          setPage(0);
     };

     const handleSearchChange = (value: string) => {
          setSearchQuery(value);
          setPage(0);
     };

     return {
          searchQuery,
          setSearchQuery: handleSearchChange,
          page,
          rowsPerPage,
          filteredItems,
          pagedItems,
          handlePageChange,
          handleRowsPerPageChange,
     };
}
