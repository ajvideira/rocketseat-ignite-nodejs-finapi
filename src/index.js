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

const getBalance = (statement) =>
  statement.reduce(
    (acc, operation) =>
      acc +
      (operation.type === 'credit' ? operation.amount : -operation.amount),
    0
  );

app.post('/account', (request, response) => {
  const { name, cpf } = request.body;

  const userAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  customers.push({ name, cpf, id: uuidv4(), statement: [] });

  return response.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.get('/statement/:date', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  const { date } = request.params;

  const formattedDate = new Date(date + ' 00:00');

  const statementOnDate = customer.statement.filter(
    (operation) =>
      new Date(operation.created_at).toDateString() ===
      formattedDate.toDateString()
  );

  return response.json(statementOnDate);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;

  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (amount > balance) {
    return response.json({ error: 'Insufficient funds!' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.listen(3333);
