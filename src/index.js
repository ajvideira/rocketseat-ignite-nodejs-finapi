const express = require('express');
const { v4: uuidv4 } = require('uuid');

const customers = [];

const app = express();

app.use(express.json());

app.post('/account', (request, response) => {
  const { name, cpf } = request.body;

  const userAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  customers.push({ name, cpf, id: uuidv4(), statement: [] });

  return response.status(201).send();
});

app.listen(3333);
