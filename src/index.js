/**
 * LNbits Scrum Extension Skill - Main Module
 * Provides integration between OpenClaw and LNbits Scrum extension
 * 
 * AI Economy Concept:
 * - AIs can create scrum boards with Bitcoin-rewarded tasks
 * - Other AIs (or humans) can pick up tasks and earn sats upon completion
 * - Enables autonomous AI agents to coordinate work and exchange value
 */

const LnbitsScrumClient = require('./api');
const path = require('path');
const fs = require('fs');

class LnbitsScrumSkill {
  constructor() {
    this.client = null;
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file
   */
  loadConfig() {
    const configPath = path.join(process.env.HOME, '.openclaw', 'lnbits-scrum-config.json');
    
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.error('Error loading config:', error.message);
        return {};
      }
    }
    
    // Return empty config if file doesn't exist
    return {};
  }

  /**
   * Initialize the client with config
   */
  initialize() {
    // Need at least one of: access_token, admin_key, or user_id
    if (!this.config.access_token && !this.config.admin_key && !this.config.user_id && !this.config.usr) {
      throw new Error(
        'LNbits Scrum skill requires authentication. ' +
        'Provide access_token (Bearer) OR admin_key (X-Api-Key) OR user_id/usr (query param). ' +
        'See README.md for configuration details.'
      );
    }
    
    this.client = new LnbitsScrumClient(this.config);
  }

  /**
   * Create a new scrum board
   */
  async createScrumBoard(name, description, options = {}) {
    if (!this.client) this.initialize();
    
    return await this.client.createScrumBoard(name, description, options);
  }

  /**
   * Get a specific scrum board
   */
  async getScrumBoard(scrumId) {
    if (!this.client) this.initialize();
    
    return await this.client.getScrumBoard(scrumId);
  }

  /**
   * List all scrum boards
   */
  async listScrumBoards() {
    if (!this.client) this.initialize();
    
    return await this.client.listScrumBoards();
  }

  /**
   * Delete a scrum board
   */
  async deleteScrumBoard(scrumId) {
    if (!this.client) this.initialize();
    
    return await this.client.deleteScrumBoard(scrumId);
  }

  /**
   * Create a new task
   * @param {string} scrumId - Scrum board ID
   * @param {string} taskDescription - Task description
   * @param {string} assignee - Assignee (optional)
   * @param {number|null|undefined} reward - Reward in sats (truly optional - no default)
   * @param {string} notes - Additional notes (optional)
   */
  async createTask(scrumId, taskDescription, assignee = '', reward = undefined, notes = '') {
    if (!this.client) this.initialize();
    
    return await this.client.createTask(scrumId, taskDescription, assignee, reward, notes);
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId, updates) {
    if (!this.client) this.initialize();
    
    return await this.client.updateTask(taskId, updates);
  }

  /**
   * Get a specific task
   */
  async getTask(taskId) {
    if (!this.client) this.initialize();
    
    return await this.client.getTask(taskId);
  }

  /**
   * Get all tasks for a specific scrum board
   */
  async getTasksForScrum(scrumId) {
    if (!this.client) this.initialize();
    
    return await this.client.getTasksForScrum(scrumId);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    if (!this.client) this.initialize();
    
    return await this.client.deleteTask(taskId);
  }

  /**
   * Create a weekly sprint board
   */
  async createWeeklySprint(weekNumber, description) {
    const name = `Week ${weekNumber} Sprint`;
    const options = {
      publicAssigning: true,
      publicTasks: false,
      publicDeleteTasks: false
    };
    
    return await this.createScrumBoard(name, description, options);
  }

  /**
   * Add GitHub issues as tasks to a scrum board
   * @param {Array} githubIssues - Array of GitHub issue objects
   * @param {string} scrumId - Scrum board ID
   * @param {number|null|undefined} defaultReward - Default reward (optional, can be undefined)
   */
  async addGithubIssuesToSprint(githubIssues, scrumId, defaultReward = undefined) {
    const results = [];
    
    for (const issue of githubIssues) {
      const taskDescription = `${issue.title} (${issue.repository}/${issue.number})`;
      
      try {
        const task = await this.createTask(
          scrumId,
          taskDescription,
          issue.assignee || '',
          defaultReward, // Can be undefined (no reward), null (free), or a number
          `Imported from GitHub: ${issue.url}`
        );
        results.push({ success: true, task, issue });
      } catch (error) {
        results.push({ success: false, error: error.message, issue });
      }
    }
    
    return results;
  }

  /**
   * Generate a sprint report
   */
  async generateSprintReport(scrumId) {
    const scrumBoard = await this.getScrumBoard(scrumId);
    const tasks = await this.getTasksForScrum(scrumId);
    
    const report = {
      scrumBoard: scrumBoard,
      totalTasks: tasks.total || tasks.items?.length || 0,
      todo: [],
      doing: [],
      done: [],
      assignees: new Set(),
      totalReward: 0,
      completedReward: 0
    };
    
    const processTask = (task) => {
      report.assignees.add(task.assignee);
      
      // Track rewards
      if (task.reward) {
        report.totalReward += parseInt(task.reward) || 0;
        if (task.stage === 'done') {
          report.completedReward += parseInt(task.reward) || 0;
        }
      }
      
      switch (task.stage) {
        case 'todo':
          report.todo.push(task);
          break;
        case 'doing':
          report.doing.push(task);
          break;
        case 'done':
          report.done.push(task);
          break;
      }
    };
    
    if (tasks.items) {
      for (const task of tasks.items) {
        processTask(task);
      }
    } else if (Array.isArray(tasks)) {
      for (const task of tasks) {
        processTask(task);
      }
      report.totalTasks = tasks.length;
    }
    
    report.assignees = Array.from(report.assignees).filter(a => a);
    report.rewards = {
      total: report.totalReward,
      completed: report.completedReward,
      pending: report.totalReward - report.completedReward
    };
    
    return report;
  }
}

// Export the class
module.exports = LnbitsScrumSkill;
