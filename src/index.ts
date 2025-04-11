import dotenv from 'dotenv';
import app from './app';
import { initDI } from './config/di'; // import this to initialize the dependency injection container

dotenv.config();

const PORT = process.env.PORT || 8081;

export async function init() {
  try {
    await initDI();
  } catch (error) {
    console.error('Error initializing dependency injection:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

void init();
