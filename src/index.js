const express = require('express');
const { v4: uuidv4 } = require('uuid');

const customers = [];

const app = express();

app.use(express.json());

const verifyIfExistsAccountCPF = (request, response, next) => {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: 'User not found!' });
  }

  request.customer = customer;

  return next();
};

app.post('/account', (request, response) => {
  const { name, cpf } = request.body;

  const userAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  customers.push({ name, cpf, id: uuidv4(), statement: [] });

  return response.status(201).send();
});

app.get('/statement/:cpf', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.listen(3333);
