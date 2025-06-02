#!/usr/bin/env node

/**
 * AI Agent Integration Sync Script
 * Bidirectional synchronization between strategic context (memory-bank) and tactical execution (Taskmaster)
 */

const fs = require('fs').promises;
const path = require('path');

class AIAgentSync {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.memoryBankPath = path.join(this.projectRoot, 'memory-bank');
    this.tasksPath = path.join(this.projectRoot, 'tasks.json');
    this.contextPath = path.join(this.projectRoot, 'activeContext.md');
    this.roadmapPath = path.join(this.projectRoot, 'project_roadmap.md');
  }

  async syncStrategicToTactical() {
    console.log('🔄 Syncing strategic context to tactical execution...');
    
    // Read implementation plans
    const implementationPlans = await this.readImplementationPlans();
    
    // Read current tasks
    const tasksData = await this.readTasks();
    
    // Update task descriptions with strategic context
    for (const task of tasksData.tasks) {
      const relevantPlan = this.findRelevantPlan(task, implementationPlans);
      if (relevantPlan) {
        task.strategicContext = {
          plan: relevantPlan.name,
          module: relevantPlan.module,
          approach: relevantPlan.approach
        };
      }
    }
    
    // Save updated tasks
    await this.saveTasks(tasksData);
    console.log('✅ Strategic context synced to tasks');
  }

  async syncTacticalToStrategic() {
    console.log('🔄 Syncing tactical progress to strategic context...');
    
    // Read current tasks
    const tasksData = await this.readTasks();
    
    // Calculate progress metrics
    const progress = this.calculateProgress(tasksData.tasks);
    
    // Update activeContext.md with progress
    await this.updateActiveContext(progress);
    
    // Update roadmap with phase completion
    await this.updateRoadmap(progress);
    
    console.log('✅ Tactical progress synced to strategic context');
  }

  async readImplementationPlans() {
    const plans = [];
    const files = await fs.readdir(this.memoryBankPath);
    
    for (const file of files) {
      if (file.startsWith('implementation_plan_')) {
        const content = await fs.readFile(
          path.join(this.memoryBankPath, file),
          'utf-8'
        );
        plans.push({
          name: file,
          content: content,
          module: this.extractModule(content),
          approach: this.extractApproach(content)
        });
      }
    }
    
    return plans;
  }

  async readTasks() {
    const content = await fs.readFile(this.tasksPath, 'utf-8');
    return JSON.parse(content);
  }

  async saveTasks(tasksData) {
    await fs.writeFile(
      this.tasksPath,
      JSON.stringify(tasksData, null, 2)
    );
  }

  findRelevantPlan(task, plans) {
    // Match task to implementation plan based on keywords
    const taskKeywords = task.title.toLowerCase().split(' ');
    
    for (const plan of plans) {
      const planKeywords = plan.content.toLowerCase();
      const matches = taskKeywords.filter(keyword => 
        planKeywords.includes(keyword)
      );
      
      if (matches.length >= 2) {
        return plan;
      }
    }
    
    return null;
  }

  calculateProgress(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      percentComplete: Math.round((completed / total) * 100),
      currentPhase: this.determineCurrentPhase(tasks)
    };
  }

  determineCurrentPhase(tasks) {
    // Analyze task patterns to determine current phase
    const securityTasks = tasks.filter(t => 
      t.title.toLowerCase().includes('security') || 
      t.title.toLowerCase().includes('csp')
    );
    const deploymentTasks = tasks.filter(t => 
      t.title.toLowerCase().includes('deployment') || 
      t.title.toLowerCase().includes('deploy')
    );
    
    if (deploymentTasks.some(t => t.status === 'in_progress')) {
      return 'Phase 4: Production Deployment';
    }
    
    return 'Phase 4: Production Optimization';
  }

  async updateActiveContext(progress) {
    let content = await fs.readFile(this.contextPath, 'utf-8');
    
    // Update progress metrics
    const progressSection = `
## Task Progress
- **Total Tasks**: ${progress.total}
- **Completed**: ${progress.completed} (${progress.percentComplete}%)
- **In Progress**: ${progress.inProgress}
- **Pending**: ${progress.pending}
- **Current Phase**: ${progress.currentPhase}
`;

    // Insert or update progress section
    if (content.includes('## Task Progress')) {
      content = content.replace(
        /## Task Progress[\s\S]*?(?=##|$)/,
        progressSection + '\n'
      );
    } else {
      // Add before Context Notes
      content = content.replace(
        '## Context Notes',
        progressSection + '\n## Context Notes'
      );
    }
    
    await fs.writeFile(this.contextPath, content);
  }

  async updateRoadmap(progress) {
    let content = await fs.readFile(this.roadmapPath, 'utf-8');
    
    // Update phase 4 status based on progress
    if (progress.percentComplete >= 80) {
      content = content.replace(
        '*   **Status**: 🔄 In Progress',
        '*   **Status**: ✅ Nearly Complete (80%+)'
      );
    }
    
    await fs.writeFile(this.roadmapPath, content);
  }

  extractModule(content) {
    const match = content.match(/\*\*Parent Module\(s\)\*\*: \[(.*?)\]/);
    return match ? match[1] : '';
  }

  extractApproach(content) {
    const match = content.match(/\*\*Approach:\*\* (.*?)$/m);
    return match ? match[1] : '';
  }

  async generateIntelligentWorkflow() {
    console.log('🤖 Generating intelligent workflow recommendations...');
    
    const tasksData = await this.readTasks();
    const implementationPlans = await this.readImplementationPlans();
    
    // Analyze dependencies and priorities
    const workflow = {
      immediate: [],
      nextUp: [],
      blocked: []
    };
    
    for (const task of tasksData.tasks) {
      if (task.status === 'pending') {
        const deps = await this.checkDependencies(task, tasksData.tasks);
        
        if (deps.allComplete) {
          if (task.priority === 'critical' || task.priority === 'high') {
            workflow.immediate.push(task);
          } else {
            workflow.nextUp.push(task);
          }
        } else {
          workflow.blocked.push({
            task,
            blockedBy: deps.incomplete
          });
        }
      }
    }
    
    // Generate workflow report
    const report = this.generateWorkflowReport(workflow);
    await fs.writeFile(
      path.join(this.projectRoot, 'intelligent-workflow.md'),
      report
    );
    
    console.log('✅ Intelligent workflow generated');
    return workflow;
  }

  async checkDependencies(task, allTasks) {
    const incomplete = [];
    let allComplete = true;
    
    for (const depId of task.dependencies || []) {
      const dep = allTasks.find(t => t.id === depId);
      if (dep && dep.status !== 'completed') {
        allComplete = false;
        incomplete.push(dep.id);
      }
    }
    
    return { allComplete, incomplete };
  }

  generateWorkflowReport(workflow) {
    return `# Intelligent Workflow Recommendations

Generated: ${new Date().toISOString()}

## 🚀 Immediate Actions (High Priority)
${workflow.immediate.map(task => `- **${task.id}**: ${task.title}`).join('\n')}

## 📋 Next Up (Medium Priority)
${workflow.nextUp.map(task => `- **${task.id}**: ${task.title}`).join('\n')}

## 🚫 Blocked Tasks
${workflow.blocked.map(item => 
  `- **${item.task.id}**: ${item.task.title}\n  - Blocked by: ${item.blockedBy.join(', ')}`
).join('\n')}

## 💡 Recommendations
1. Focus on completing immediate high-priority tasks first
2. Review and update blocked task dependencies
3. Consider parallel execution of independent tasks
4. Use \`task-master next\` command for real-time task recommendations
`;
  }
}

// Main execution
async function main() {
  const sync = new AIAgentSync();
  
  try {
    // Bidirectional sync
    await sync.syncStrategicToTactical();
    await sync.syncTacticalToStrategic();
    
    // Generate intelligent workflow
    await sync.generateIntelligentWorkflow();
    
    console.log('✨ AI Agent integration complete!');
  } catch (error) {
    console.error('❌ Integration error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = AIAgentSync;