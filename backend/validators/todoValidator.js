exports.validateTodoCreate = (req) => {
  const { title } = req.body;

  if (!title || title.trim().length === 0) {
    throw new Error('Title is required');
  }

  if (title.length > 200) {
    throw new Error('Title cannot exceed 200 characters');
  }
};

exports.validateTodoUpdate = (req) => {
  const { title, done } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string') {
      throw new Error('Title must be a string');
    }

    if (title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    if (title.length > 200) {
      throw new Error('Title cannot exceed 200 characters');
    }
  }

  if (done !== undefined) {
    if (typeof done !== 'boolean') {
      throw new Error('Done must be a boolean');
    }
  }

  // At least one field must be provided
  if (title === undefined && done === undefined) {
    throw new Error('At least one field (title or done) must be provided');
  }
};