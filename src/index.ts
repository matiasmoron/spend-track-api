import dotenv from 'dotenv';
import { openAIClient } from './config/di';
import { initExpress } from './config/express';
import { errorHandler } from './interfaces/http/middlewares/errorHandler';
import apiRouter from './interfaces/http/routes/apiRouter';

dotenv.config();

const PORT = process.env.PORT || 8080;

const app = initExpress();

const prefix = '/api';

app.use(`${prefix}`, apiRouter);

app.post(`${prefix}/gpt`, async (req, res) => {
  console.log({ body: req.body as string });

  const { data } = req.body as { data: { prompt: string } };

  const { prompt } = data;

  console.log({ prompt });

  const categories = ['Comida', 'Transporte', 'Casa', 'Salud', 'Entretenimiento', 'Otro'];
  const content = `
  Necesitas determinar la categoría de un gasto, 
  agruparlas dentro de las siguientes secciones: ${categories.join(',')}, 
  dependiendo la descripcion del gasto, quiero que solamente me devuelvas el nombre de la categoría a la que pertenece, si no sabes cual utilizar, utiliza la categoría 'Otro'. Descripcion: ${prompt}`;

  console.log({ content });

  try {
    const response = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        {
          role: 'user',
          content,
        },
      ],
      max_tokens: 50,
    });

    let category = 'Otro';

    if (response.choices.length) category = response.choices[0].message.content;

    res.send({ data: { category } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ error: 'There was an error trying to identify the category' });
  }
});

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
