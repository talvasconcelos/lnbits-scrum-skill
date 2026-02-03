/**
 * LNbits Scrum Extension API Client
 * Provides functions to interact with the LNbits Scrum extension API
 * 
 * Authentication support:
 * - Bearer token (access_token via Authorization header)
 * - User ID (usr query parameter)
 * 
 * The API decorator expects:
 *   access_token: Annotated[str | None, Depends(check_access_token)] OR usr: UUID4 | None
 */

const axios = require('axios');

class LnbitsScrumClient {
  constructor(config) {
    this.config = config;
    this.baseURL = config.lnbits_url || 'https://demo.lnbits.com';
    
    // LNbits Scrum extension only supports:
    // 1. Bearer token (access_token via Authorization header)
    // 2. User ID (usr query parameter)
    // NOTE: X-Api-Key is NOT supported by this extension
    this.accessToken = config.access_token;
    
    // User ID for usr query param authentication
    this.userId = config.user_id || config.usr;
    
    // Wallet ID is optional
    this.walletId = config.wallet_id;

    // Build headers based on authentication method
    const headers = {
      'Content-Type': 'application/json'
    };

    // Bearer token auth (preferred method)
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    this.api = axios.create({
      baseURL: `${this.baseURL}/scrum/api/v1`,
      headers
    });
  }

  /**
   * Build request parameters including usr if using user ID auth
   */
  buildParams(additionalParams = {}) {
    const params = { ...additionalParams };
    if (this.userId) {
      params.usr = this.userId;
    }
    return params;
  }

  /**
   * Create a new scrum board
   */
  async createScrumBoard(name, description, options = {}) {
    const payload = {
      name,
      description,
      public_assigning: options.publicAssigning ?? false,
      public_tasks: options.publicTasks ?? false,
      public_delete_tasks: options.publicDeleteTasks ?? false,
      wallet: this.walletId || undefined
    };

    try {
      const response = await this.api.post('/scrum', payload, {
        params: this.buildParams()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create scrum board: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get a specific scrum board
   */
  async getScrumBoard(scrumId) {
    try {
      const response = await this.api.get(`/scrum/${scrumId}`, {
        params: this.buildParams()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get scrum board: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * List all scrum boards
   */
  async listScrumBoards(limit = 100, offset = 0) {
    try {
      const response = await this.api.get('/scrum/paginated', {
        params: this.buildParams({ 
          limit,
          offset
        })
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list scrum boards: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Delete a scrum board
   */
  async deleteScrumBoard(scrumId) {
    try {
      const response = await this.api.delete(`/scrum/${scrumId}`, {
        params: this.buildParams()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete scrum board: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Create a new task
   * @param {string} scrumId - Scrum board ID
   * @param {string} taskDescription - Task description
   * @param {string} assignee - Assignee name/identifier (optional)
   * @param {number|null|undefined} reward - Reward amount in sats (truly optional - no default)
   * @param {string} notes - Additional notes (optional)
   */
  async createTask(scrumId, taskDescription, assignee = '', reward = undefined, notes = '') {
    const payload = {
      task: taskDescription,
      scrum_id: scrumId,
      assignee: assignee || '',
      stage: 'todo' // default to 'todo'
    };

    // Reward is truly optional - only include if explicitly provided
    // undefined means "not set" - let the API handle defaults if any
    // null or 0 are valid values (free tasks)
    if (reward !== undefined) {
      payload.reward = reward;
    }

    if (notes) {
      payload.notes = notes;
    }

    try {
      const response = await this.api.post('/tasks', payload, {
        params: this.buildParams()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create task: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId, updates) {
    try {
      const response = await this.api.put(`/tasks/${taskId}`, updates, {
        params: this.buildParams()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update task: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get a specific task
   */
  async getTask(taskId) {
    try {
      const response = await this.api.get(`/tasks/${taskId}`, {
        params: this.buildParams()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get task: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get all tasks for a specific scrum board
   */
  async getTasksForScrum(scrumId, limit = 100, offset = 0) {
    try {
      const response = await this.api.get('/tasks/paginated', {
        params: this.buildParams({
          scrum_id: scrumId,
          limit,
          offset
        })
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get tasks for scrum: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    try {
      const response = await this.api.delete(`/tasks/${taskId}`, {
        params: this.buildParams()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.response?.data?.detail || error.message}`);
    }
  }
}

module.exports = LnbitsScrumClient;
