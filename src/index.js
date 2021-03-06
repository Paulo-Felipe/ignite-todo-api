const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { headers: { username } } = request;

	const user = users.find((user) => user.username === username);

	if (!user){
		return response.status(404).send({ error: "User not exists!" });
	}

	request.user = user;

	return next();
}

app.post('/users', (request, response) => {
  const { body: { username, name } } = request;

	const userAlreadyExists = users.some((user) => user.username === username);

	if (userAlreadyExists){
		return response.status(400).send({ error: "User already exists!" });
	}

  const user = {
		id: uuidv4(),
    username,
		name,
		todos: []
	};

	users.push(user);

	return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

	return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user: { todos }, body: { title, deadline } } = request;

  const todo = {
    id: uuidv4(),
		title,
    done: false,
		deadline: new Date(deadline),
		created_at: new Date()
	};

  todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user: { todos }, body: { title, deadline }, params: { id } } = request;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo){
    return response.status(404).send({ error: "ToDo not exists!" });
  }

  todo.title = title
  todo.deadline = deadline;

  return response.status(200).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user: { todos }, params: { id } } = request;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo){
    return response.status(404).send({ error: "ToDo not exists!" });
  }

  todo.done = true;

  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user: { todos }, params: { id } } = request;

  const todo = todos.find((todo) => todo.id === id);

  if (!todo){
    return response.status(404).send({ error: "ToDo not exists!" });
  }

  todos.splice(todo, 1)

  return response.status(204).send(todos);
});

module.exports = app;