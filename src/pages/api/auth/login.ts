import { UserServices } from '@/utils/user-services';
import { compare, hash } from 'bcrypt'; // Import the compare function from bcryptjs
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
     message: string,
     user?: any
}

export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse<ResponseData>
) {
     const { email, password } = req.body;
     const searchResults: any = await UserServices().getUserByEmail(email);

     // Check if exactly one user was found and the password is correct
     if (searchResults.length === 1) {
          const user = searchResults[0];
          // Use bcryptjs to compare the hashed password with the provided password

          const isPasswordCorrect = await compare(password, user.password);

          if (isPasswordCorrect) {
               const { password, ...userWithoutPassword } = user
               res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
          } else {
               res.status(401).json({ message: 'Invalid credentials' });
          }
     } else {
          res.status(404).json({ message: 'User not found' });
     }
}