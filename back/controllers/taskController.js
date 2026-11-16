const Task = require("../models/task");

const getTasks = async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
};

const createTask = async (req, res) => {
  const task = new Task({
    title: req.body.title,
    completed: false
  });

  const savedTask = await task.save();
  res.json(savedTask);
};

const deleteTask = async (req, res) => {
  await Task.deleteOne({ _id: req.body.id });
  res.send("Task deleted");
};

module.exports = {
  getTasks,
  createTask,
  deleteTask
};