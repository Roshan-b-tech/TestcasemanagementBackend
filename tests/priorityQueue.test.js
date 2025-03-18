const { PriorityQueue } = require('../src/utils/priorityQueue');

describe('PriorityQueue', () => {
  let queue;

  beforeEach(() => {
    queue = new PriorityQueue();
  });

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  it('should enqueue tasks with correct priority order', () => {
    const lowTask = {
      priority: 'low',
      createdAt: new Date(2023, 0, 1)
    };
    const mediumTask = {
      priority: 'medium',
      createdAt: new Date(2023, 0, 1)
    };
    const highTask = {
      priority: 'high',
      createdAt: new Date(2023, 0, 1)
    };

    queue.enqueue(lowTask);
    queue.enqueue(highTask);
    queue.enqueue(mediumTask);

    const first = queue.dequeue();
    const second = queue.dequeue();
    const third = queue.dequeue();

    expect(first.priority).toBe('high');
    expect(second.priority).toBe('medium');
    expect(third.priority).toBe('low');
  });

  it('should maintain FIFO order for same priority tasks', () => {
    const task1 = {
      priority: 'high',
      createdAt: new Date(2023, 0, 1)
    };
    const task2 = {
      priority: 'high',
      createdAt: new Date(2023, 0, 2)
    };

    queue.enqueue(task1);
    queue.enqueue(task2);

    const first = queue.dequeue();
    const second = queue.dequeue();

    expect(first.createdAt.getTime()).toBeLessThan(second.createdAt.getTime());
  });

  it('should return null when queue is empty', () => {
    expect(queue.dequeue()).toBeNull();
  });

  it('should correctly identify empty queue', () => {
    expect(queue.isEmpty()).toBe(true);

    queue.enqueue({
      priority: 'low',
      createdAt: new Date()
    });

    expect(queue.isEmpty()).toBe(false);
    queue.dequeue();
    expect(queue.isEmpty()).toBe(true);
  });
});