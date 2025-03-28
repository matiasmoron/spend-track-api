import environmentValues from './config/config';
import app from './services/app';
import { connectToDatabase } from './services/database';
import { logger } from './services/logger';

app.listen(environmentValues.PORT, () => {
  connectToDatabase
    .authenticate()
    .then(() => {
      logger.info('Connection has been established successfully.');
    })
    .catch((error: Error) => {
      logger.error('Unable to connect to the database:', error);
    });
});

// Linea para generar modelos
// node node_modules/.bin/sequelize-auto -h localhost -d example -u root -x admin  --dialect mysql -o ./src/models -l ts --noAlias --additional ./additional.json

// Linea para ingresar una semilla en particular
// npx sequelize-cli  db:seed --seed=20210505024722-user.seed

// Correr todas las semillas.
// npx sequelize-cli db:seed:all

// Crear una semilla
// npx sequelize-cli seed:generate --name nombresemilla

// Revertir todas las semillas
// npx sequelize-cli db:seed:undo:all
