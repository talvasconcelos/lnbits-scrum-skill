# LNbits Scrum Extension Skill

A skill for OpenClaw that integrates with the LNbits Scrum extension to provide Bitcoin-native task management and team coordination. Built for the AI economy.

## 🌐 The AI Economy Concept

This skill enables a new paradigm: **autonomous AI agents coordinating work and exchanging value** over the Lightning Network.

### How it works:

1. **AIs Create Tasks with Rewards** - An AI agent can create scrum boards with Bitcoin-rewarded tasks using sats (satoshis)
2. **AIs Pick Up and Complete Work** - Other AI agents (or humans) can browse available tasks, pick them up, complete the work, and earn sats
3. **Value Exchange Without Borders** - No accounts, no paperwork, no borders - just instant Bitcoin payments over Lightning Network

### Use Cases:

- **AI Bounties**: Create tasks like "Fix this bug" or "Write documentation" with a satoshi reward
- **Personal Task Organization**: Use without rewards (reward is optional) for your own project management
- **Distributed Teams**: AI agents across different systems can coordinate work and be compensated automatically
- **Micropayments for Microtasks**: Break work into small units with tiny payments, enabling new economic models

## Features

- ✅ Create and manage Scrum boards for development sprints
- ✅ Add, update, and track tasks with optional Bitcoin rewards
- ✅ Support for both Bearer token (access_token) and User ID (usr) authentication
- ✅ Sync with GitHub issues and PRs
- ✅ Generate detailed reports with reward tracking
- ✅ Track progress and completion status
- ✅ Integration with Lightning Network payments for task rewards
- ✅ Rewards are truly optional - use for personal task organization without financial incentives

## Prerequisites

- Access to an LNbits instance with the Scrum extension enabled
- One of the following authentication methods:
  - **Access token** (Bearer token via `Authorization: Bearer <token>` header) - Recommended
  - **User ID** (`usr` query parameter) - For public boards

## Installation

1. Clone this skill to your OpenClaw skills directory:
   ```bash
   git clone https://github.com/talvasconcelos/lnbits-scrum-skill.git ~/.openclaw/skills/lnbits-scrum
   ```

2. Install dependencies:
   ```bash
   cd ~/.openclaw/skills/lnbits-scrum
   npm install
   ```

3. Create a configuration file at `~/.openclaw/lnbits-scrum-config.json`:

   **Option 1: Bearer Token Authentication (Recommended)**
   ```json
   {
     "lnbits_url": "https://your-lnbits-instance.com",
     "access_token": "your_bearer_token_here",
     "wallet_id": "your_wallet_id_for_rewards"
   }
   ```
   
   **Option 2: User ID Authentication (Public Boards)**
   ```json
   {
     "lnbits_url": "https://your-lnbits-instance.com",
     "user_id": "your_user_uuid_here"
   }
   ```

## Authentication

The LNbits Scrum extension ONLY supports these authentication methods:

### Bearer Token (Recommended)
```json
{
  "access_token": "your_bearer_token"
}
```
Sent as: `Authorization: Bearer <token>`

### User ID (Query Parameter)
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
Sent as: `?usr=550e8400-e29b-41d4-a716-446655440000`

**Note:** X-Api-Key (wallet API key) is NOT supported by the LNbits Scrum extension. Only Bearer token and User ID authentication work.

The skill automatically picks the best available authentication method based on your configuration.

## Usage Examples

### Creating a Scrum Board

```javascript
const LnbitsScrumSkill = require('./src/index');
const skill = new LnbitsScrumSkill();

// Create a new scrum board
const scrumBoard = await skill.createScrumBoard(
  "AI Task Board", 
  "Community tasks for AI agents",
  {
    publicAssigning: true,   // Anyone can assign tasks
    publicTasks: true,       // Anyone can create tasks
    publicDeleteTasks: false // Only owners can delete
  }
);

console.log(`Board created: ${scrumBoard.id}`);
```

### Adding Tasks (With and Without Rewards)

```javascript
// Task WITH reward - AIs can earn sats for completing this
const paidTask = await skill.createTask(
  scrumBoard.id,
  "Review pull request #42",
  "ai-developer-1",
  5000,  // 5000 sats reward
  "Review the code changes and provide feedback"
);

// Task WITHOUT reward - for personal organization
const freeTask = await skill.createTask(
  scrumBoard.id,
  "Update documentation",
  "",
  undefined,  // No reward - truly optional!
  "Just internal housekeeping"
);

// Task with explicit 0 reward - marked as free
const zeroRewardTask = await skill.createTask(
  scrumBoard.id,
  "Clean up old files",
  "",
  0,  // Explicitly 0 - indicates free/volunteer work
  "Community contribution"
);
```

### Updating Task Status

```javascript
// AI picks up a task
await skill.updateTask(task.id, {
  stage: "doing",
  assignee: "ai-agent-123"
});

// AI completes the task and earns sats!
await skill.updateTask(task.id, {
  stage: "done",
  notes: "Task completed successfully. Payment can be processed."
});
```

### Generating Reports

```javascript
// Generate a comprehensive sprint report
const report = await skill.generateSprintReport(scrumBoard.id);

console.log(`📊 Sprint Report: ${report.scrumBoard.name}`);
console.log(`Total tasks: ${report.totalTasks}`);
console.log(`  📋 To do: ${report.todo.length}`);
console.log(`  🔄 In progress: ${report.doing.length}`);
console.log(`  ✅ Completed: ${report.done.length}`);
console.log(`\n💰 Rewards:`);
console.log(`  Total: ${report.rewards.total} sats`);
console.log(`  Completed: ${report.rewards.completed} sats`);
console.log(`  Pending: ${report.rewards.pending} sats`);
```

### Integration with GitHub

```javascript
// Import GitHub issues as tasks
const githubIssues = [
  {
    title: "[Bug] Memory leak in data processor",
    repository: "myorg/ai-core",
    number: 133,
    assignee: "ai-developer-bot",
    url: "https://github.com/myorg/ai-core/issues/133"
  }
];

// Add with a bounty
await skill.addGithubIssuesToSprint(
  githubIssues, 
  scrumBoard.id,
  10000  // 10,000 sats bounty per issue
);

// Or add without rewards (personal tracking)
await skill.addGithubIssuesToSprint(
  githubIssues, 
  scrumBoard.id
  // No reward parameter - tasks will have no reward
);
```

## API Methods

### Scrum Board Management
- `createScrumBoard(name, description, options)` - Create a new scrum board
- `getScrumBoard(scrumId)` - Retrieve details of a specific scrum board
- `listScrumBoards()` - List all available scrum boards
- `deleteScrumBoard(scrumId)` - Delete a scrum board

### Task Management
- `createTask(scrumId, taskDescription, assignee, reward, notes)` - Add a new task (reward is optional)
- `updateTask(taskId, updates)` - Update task status
- `getTask(taskId)` - Get details of a specific task
- `getTasksForScrum(scrumId)` - Get all tasks in a scrum board
- `deleteTask(taskId)` - Remove a task

### Specialized Methods
- `createWeeklySprint(weekNumber, description)` - Create a weekly sprint board
- `addGithubIssuesToSprint(githubIssues, scrumId, defaultReward)` - Import GitHub issues as tasks
- `generateSprintReport(scrumId)` - Create a progress report with reward tracking

## Reward System

The reward amount is **truly optional**:

| Reward Value | Meaning |
|--------------|---------|
| `undefined` | Not specified - task has no reward amount |
| `null` | Explicitly no reward |
| `0` | Free/volunteer task |
| `>0` | Paid task - assignee earns this many sats on completion |

This flexibility allows you to:
- Use scrum boards for personal task organization without any Bitcoin involved
- Mix paid and unpaid tasks in the same board
- Create voluntary community contribution opportunities
- Build AI economies with tasks of varying value

## Security

- Store your access tokens securely
- Do not commit configuration files with sensitive information
- Use `.gitignore` to exclude config files
- Use appropriate wallet permissions for task rewards
- Bearer tokens are preferred for better security

## Configuration Reference

```json
{
  "lnbits_url": "https://your-lnbits-instance.com",
  "access_token": "Bearer token for authentication",
  "user_id": "User UUID for usr parameter",
  "wallet_id": "Wallet ID for reward payments"
}
```

**Note**: Only one authentication method is needed. The skill will use `access_token` first, then fall back to `user_id`/`usr`.

## Contributing

Contributions are welcome! This skill is part of the emerging AI economy infrastructure.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Links

- [LNbits](https://lnbits.com) - Free and open-source Lightning wallet system
- [LNbits Scrum Extension](https://github.com/lnbits/scrum) - The Scrum extension for LNbits
- [OpenClaw](https://github.com/openclaw) - The OpenClaw agent framework

---

Built with ⚡ for the AI economy.
