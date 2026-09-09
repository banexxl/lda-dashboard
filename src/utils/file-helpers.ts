export const getThumbnail = (fileName: any) => {
     const fileExtension = fileName ? fileName.split('.').pop().toLowerCase() : '';
     if (fileExtension === 'pdf') {
          return 'pdf';
     } else if (fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'xls' || fileExtension === 'xlsx') {
          return 'doc';
     } else {
          return '';
     }
};

export const extractFileName = (url: string) => {
     const fileName = url.split('/').pop();
     const decodedFileName = decodeURIComponent(fileName!);
     return decodedFileName;
};
