const express = require('express');
const { v4: uuidv4 } = require('uuid');

const customers = [];

const app = express();

app.use(express.json());

app.post('/account', (request, response) => {
  const { name, cpf } = request.body;

  const id = uuidv4();

  customers.push({ name, cpf, id, statement: [] });

  return response.status(201).send();
});

app.listen(3333);
