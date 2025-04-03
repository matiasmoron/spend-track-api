import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
app.use(express.json());

// if (typeof process.env.JWT_SECRET !== 'string' || process.env.JWT_SECRET.trim() === '') {
//   throw new Error('JWT_SECRET must be a non-empty string');
// }

app.get('/', (_req, res) => {
  res.send('Hello, World!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
