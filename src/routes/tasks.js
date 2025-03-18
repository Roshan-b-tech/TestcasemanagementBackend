const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const NodeCache = require('node-cache');
const { PriorityQueue } = require('../utils/priorityQueue');

// Cache initialization
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes TTL

// In-memory task storage (replace with a proper database in production)
const tasks = new Map();
const taskQueue = new PriorityQueue();

// Create task
router.post('/',
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('priority').isIn(['low', 'medium', 'high']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, priority } = req.body;
    const taskId = Date.now().toString();
    const task = {
      id: taskId,
      title,
      description,
      priority,
      status: 'pending',
      userId: req.user.email,
      createdAt: new Date(),
    };

    tasks.set(taskId, task);
    taskQueue.enqueue(task);
    cache.del('tasks'); // Invalidate cache

    res.status(201).json(task);
  }
);

// Get tasks with pagination and filtering
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'completed']),
    query('priority').optional().isIn(['low', 'medium', 'high']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;

    const cacheKey = `tasks:${req.user.email}:${page}:${limit}:${status}:${priority}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult) {
      return res.json(cachedResult);
    }

    let userTasks = Array.from(tasks.values())
      .filter(task => task.userId === req.user.email);

    if (status) {
      userTasks = userTasks.filter(task => task.status === status);
    }
    if (priority) {
      userTasks = userTasks.filter(task => task.priority === priority);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = userTasks.slice(startIndex, endIndex);

    const result = {
      tasks: paginatedTasks,
      page,
      totalPages: Math.ceil(userTasks.length / limit),
      totalTasks: userTasks.length,
    };

    cache.set(cacheKey, result);
    res.json(result);
  }
);

// Update task
router.put('/:id',
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('status').optional().isIn(['pending', 'completed']),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskId = req.params.id;
    const task = tasks.get(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId !== req.user.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedTask = {
      ...task,
      ...req.body,
      updatedAt: new Date(),
    };

    tasks.set(taskId, updatedTask);
    cache.del('tasks'); // Invalidate cache

    res.json(updatedTask);
  }
);

// Delete task
router.delete('/:id', (req, res) => {
  const taskId = req.params.id;
  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.userId !== req.user.email) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  tasks.delete(taskId);
  cache.del('tasks'); // Invalidate cache

  res.status(204).send();
});

module.exports = router;