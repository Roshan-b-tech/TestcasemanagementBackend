const request = require('supertest');
const express = require('express');
const taskRoutes = require('../src/routes/tasks');
const { authenticateToken } = require('../src/middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/tasks', authenticateToken, taskRoutes);

// Mock authentication middleware
jest.mock('../src/middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { email: 'test@example.com' };
    next();
  }
}));

describe('Task Management Endpoints', () => {
  let taskId;

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Task');
    expect(res.body.priority).toBe('high');
    taskId = res.body.id;
  });

  it('should get tasks with pagination', async () => {
    const res = await request(app)
      .get('/api/tasks?page=1&limit=10');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('totalPages');
  });

  it('should filter tasks by priority', async () => {
    const res = await request(app)
      .get('/api/tasks?priority=high');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.every(task => task.priority === 'high')).toBe(true);
  });

  it('should filter tasks by status', async () => {
    const res = await request(app)
      .get('/api/tasks?status=pending');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks.every(task => task.status === 'pending')).toBe(true);
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({
        title: 'Updated Task',
        status: 'completed'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.status).toBe('completed');
  });

  it('should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`);
    
    expect(res.statusCode).toBe(204);
  });

  it('should handle invalid task creation', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: '', // Invalid: empty title
        priority: 'invalid' // Invalid priority
      });
    
    expect(res.statusCode).toBe(400);
  });
});