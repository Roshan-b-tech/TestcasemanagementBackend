class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(task) {
    const priority = this.getPriorityValue(task.priority);
    const element = {
      task,
      priority,
      timestamp: task.createdAt.getTime()
    };

    this.queue.push(element);
    this.sort();
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue.shift().task;
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  sort() {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }

  getPriorityValue(priority) {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
}

module.exports = { PriorityQueue };