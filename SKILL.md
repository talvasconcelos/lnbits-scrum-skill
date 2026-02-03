# LNbits Scrum Extension Skill

Integrates OpenClaw with the LNbits Scrum extension for Bitcoin-native task management and team coordination.

## Capabilities
- Create and manage Scrum boards for development sprints
- Add, update, and track tasks with optional Bitcoin rewards
- Support Bearer token (access_token) OR user ID (usr) authentication
- Sync with GitHub issues and PRs
- Generate reports for team meetings
- Track progress and completion status

## Configuration

Create a configuration file at `~/.openclaw/lnbits-scrum-config.json` with one of the following authentication methods:

### Option 1: Bearer Token (Recommended)
```json
{
  "lnbits_url": "https://demo.lnbits.com",
  "access_token": "your_bearer_token_here",
  "wallet_id": "your_wallet_id"
}
```

### Option 2: User ID (Query Parameter)
```json
{
  "lnbits_url": "https://demo.lnbits.com",
  "user_id": "your_user_uuid_here"
}
```

**Important:** The LNbits Scrum extension ONLY supports Bearer token (access_token) and User ID (usr) authentication. X-Api-Key (wallet API key) is NOT supported.

## Authentication Methods

The LNbits Scrum API supports:
- **access_token**: `Authorization: Bearer <token>` header
- **usr**: Query parameter `?usr=<uuid4>`

X-Api-Key (admin_key/inkey) is NOT supported by this extension.

The skill automatically selects the best available method from your config.

## Functions

### Scrum Board Management
- `create_scrum_board(name, description, options)` - Create new scrum board
- `get_scrum_board(scrum_id)` - Get scrum board details
- `list_scrum_boards()` - List all scrum boards
- `delete_scrum_board(scrum_id)` - Delete a scrum board

### Task Management
- `create_task(scrum_id, task_description, assignee, reward, notes)` - Add task
  - `reward` parameter is truly optional (no default value)
  - Pass `undefined` to omit reward entirely
  - Pass `null` or `0` for explicitly free tasks
  - Pass a number for sats reward
- `update_task(task_id, updates)` - Update task status/stage
- `get_task(task_id)` - Get task details
- `get_tasks_for_scrum(scrum_id)` - Get all tasks in a board
- `delete_task(task_id)` - Remove a task

### GitHub Integration
- `add_github_issues_to_sprint(github_issues, scrum_id, default_reward)` - Import GitHub issues
  - `default_reward` is optional - omit for no rewards

### Reporting
- `generate_sprint_report(scrum_id)` - Generate progress report with reward tracking

## Usage Examples

### Create a scrum board
```javascript
const LnbitsScrumSkill = require('./src/index');
const skill = new LnbitsScrumSkill();

const board = await skill.create_scrum_board(
  name="AI Tasks", 
  description="Tasks for AI agents",
  options={
    public_assigning: true,
    public_tasks: true,
    public_delete_tasks: false
  }
);
```

### Add task without reward (personal organization)
```javascript
await skill.create_task(
  scrum_id="abc123",
  task_description="Clean up documentation",
  assignee="",
  reward=undefined,  // No reward
  notes="Internal task"
);
```

### Add task with sats reward (AI economy)
```javascript
await skill.create_task(
  scrum_id="abc123",
  task_description="Fix critical bug",
  assignee="ai-agent-1",
  reward=5000,  // 5000 sats reward
  notes="High priority"
);
```

### Update task status
```javascript
await skill.update_task(
  task_id="xyz789",
  updates={
    stage: "doing",
    notes: "Working on it"
  }
);
```

### Complete task and earn reward
```javascript
await skill.update_task(
  task_id="xyz789",
  updates={
    stage: "done",
    notes: "Task completed!"
  }
);
// Reward is automatically available for completed tasks
```

### Generate report
```javascript
const report = await skill.generate_sprint_report(scrum_id="abc123");
console.log(`Total: ${report.totalTasks}`);
console.log(`Todo: ${report.todo.length}`);
console.log(`Doing: ${report.doing.length}`);
console.log(`Done: ${report.done.length}`);
console.log(`Rewards: ${report.rewards.completed}/${report.rewards.total} sats`);
```

## AI Economy Concept

This skill enables AIs to:
1. **Create tasks with Bitcoin rewards** - Incentivize work completion
2. **Pick up and complete tasks** - Earn sats for finished work
3. **Coordinate autonomously** - No human intervention needed
4. **Exchange value over Lightning** - Instant, borderless payments

Use cases:
- AI bounties for code review, documentation, bug fixes
- Personal task organization without rewards
- Distributed AI agent coordination
- Micropayments for microtasks

## Integration with Daily Monitoring

Combine with GitHub monitoring to automatically create bounty tasks from issues:

```javascript
// In your monitoring routine:
const githubIssues = await fetchGithubIssues();
await skill.add_github_issues_to_sprint(
  githubIssues,
  scrum_id="your-sprint-id",
  default_reward=1000  // 1000 sats per issue, or omit for no rewards
);
```
