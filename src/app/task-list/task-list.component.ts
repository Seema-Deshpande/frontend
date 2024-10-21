import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Task } from '../dashboard/dashboard.component';
import { TaskService } from '../task-form/task.form.service';
import { NotificationService } from '../notification/notification.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {

  @Input() tasks: Task[] = [];
  selectedTask: Task | null = null;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() drop = new EventEmitter<CdkDragDrop<Task[]>>();

  constructor(private route: ActivatedRoute, private taskService: TaskService){}

  ngOnInit() {
    this.loadTasks();
  }
  onEditTask(task: Task) {
    const validationErrors = this.validateTask(task);
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n')); // Display errors as a list
    } else {
      this.editTask.emit(task);
    }
  }

  onDelete(task: Task) {
    const confirmed = confirm(`Are you sure you want to delete the task "${task.title}"?`);
    if (confirmed) {
      this.deleteTask.emit(task);
    }
  }
  loadTasks() {
    this.taskService.getTasks().subscribe(
      (tasks: Task[]) => {
        this.tasks = tasks.map(task => ({
          ...task,
          notificationStatus: this.getTaskStatus(task.dueDate) // Use new property for notification status
        }));
        this.taskService.checkTaskNotifications(this.tasks);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }

  getTaskStatus(dueDate: string): 'overdue' | 'due-soon' | 'normal' {
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    const dueSoonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    if (taskDueDate < now) {
      return 'overdue';
    } else if (taskDueDate <= dueSoonThreshold) {
      return 'due-soon';
    } else {
      return 'normal'; // Use this for normal tasks
    }
  }
  validateTask(task: Task): string[] {
    const errors: string[] = [];

    // Validate task title
    if (!task.title || task.title.trim().length === 0) {
      errors.push('Title is required.');
    }

    // Validate task description (optional)
    if (task.description && task.description.length > 200) {
      errors.push('Description should not exceed 200 characters.');
    }

    // Validate due date
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push('Invalid due date.');
      }
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (task.status && !validStatuses.includes(task.status)) {
      errors.push('Status must be one of: pending, in-progress, or completed.');
    }

    return errors; // Return all error messages
  }
  getStatusClass(status: 'pending' | 'in-progress' | 'completed'): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in-progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  }
}
