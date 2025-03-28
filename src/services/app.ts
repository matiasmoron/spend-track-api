import 'core-js/stable';
import 'regenerator-runtime/runtime';
import cors from 'cors';
import express from 'express';
import errorHandler from '../middleware/error';
import response from '../middleware/response';
import mainRouter from '../routes/index';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', response, mainRouter);

app.use(errorHandler);

export default app;
