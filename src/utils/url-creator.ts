export const stringWithHyphens = (inputString: string): string => {
     // Define Serbian Latin to English mapping
     const serbianToEnglishMap: { [key: string]: string } = {
          'č': 'c', 'ć': 'c', 'ž': 'z', 'š': 's', 'đ': 'dj'
     };

     // Convert the input string to lowercase and replace Serbian Latin letters
     let lowerCaseString: string = inputString.toLowerCase().replace(/[čćžšđ]/g, match => serbianToEnglishMap[match] || match);

     // Replace spaces with hyphens
     let stringWithHyphens: string = lowerCaseString.replace(/\s+/g, '-');

     return stringWithHyphens;
}
