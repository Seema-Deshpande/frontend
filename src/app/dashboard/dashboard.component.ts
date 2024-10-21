import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { DashboardService } from './dashboard.component.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../notification/notification.service';

export interface Task {
  _id?: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  notificationStatus?: 'overdue' | 'due-soon' | 'normal';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  tasks: Task[] = [];
  editingTask: Task | null = null;
  totalTasks: number = 0;
  dueSoonTasks: number = 0;
  completedTasks: number = 0;
  overDueTasks: number = 0;
  filterStatus: 'all' | 'pending' | 'in-progress' | 'completed' = 'all';
  sortBy: 'dueDate' | 'status' | null = null;

  constructor(
    private router: Router,
    private taskService: DashboardService,
    private toastr: ToastrService,
    private notificationService: NotificationService
  ) {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.calculateTaskSummary();
    });
  }
  navigateToTaskForm() {
    this.router.navigate(['/task-form']); // Adjust the route as per your routing configuration
  }
  onProfileClick(){
    this.router.navigate(['/profile']);
  }
  addOrUpdateTask(task: Task) {
    if (this.editingTask) {
      Object.assign(this.editingTask, task);
      this.taskService.updateTask(this.editingTask).subscribe(updatedTask => {
        const index = this.tasks.findIndex(t => t.title === updatedTask.title);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.editingTask = null;
      });
      this.updateNotificationCount();
    } else {
      this.taskService.addTask(task).subscribe(newTask => {
        this.tasks.push(newTask);
      });
      this.updateNotificationCount();
    }
  }

  editTask(task: Task) {
    this.editingTask = { ...task };
    this.router.navigate(['/task-form', this.editingTask?._id]);
  }


  deleteTask(task: Task) {
    this.taskService.deleteTask(task).subscribe(() => {
      this.tasks = this.tasks.filter(t => t !== task);
      this.toastr.success('Deleted task successfully!', 'Success');
      if (task.notificationStatus) { // Assuming you have a way to identify the notification ID
        this.notificationService.removeNotification(task._id!); // Replace with actual notification ID if different
      }
      this.loadTasks();
      this.updateNotificationCount();
    });
  }
  private updateNotificationCount() {
    // Assuming you have a notification service instance
    const unseenCount = this.notificationService.getUnseenCount();
    console.log('Updated unseen count:', unseenCount);
    // If you want to update any display element for unseen count, do it here.
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    const previousIndex = this.tasks.findIndex((task) => task === event.item.data);
    this.tasks.splice(previousIndex, 1);
    this.tasks.splice(event.currentIndex, 0, event.item.data);
  }

  applyFilter(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterStatus = target.value as 'all' | 'pending' | 'in-progress' | 'completed';
  }

  applySort(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value as 'dueDate' | 'status' | null;
  }
  calculateTaskSummary() {
    this.totalTasks = this.tasks.length;
    this.dueSoonTasks = this.tasks.filter(task => this.isDueSoon(task.dueDate)).length;
    this.completedTasks = this.tasks.filter(task => task.status === 'completed').length;
    this.overDueTasks = this.tasks.filter(task => this.isOverdue(task)).length;
  }

  isDueSoon(dueDate: string): boolean {
    const now = new Date();
    const taskDueDate = new Date(dueDate);
    const dueSoonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    return taskDueDate <= dueSoonThreshold && taskDueDate >= now;
  }
  isOverdue(task: Task): boolean {
    const now = new Date();
    const taskDueDate = new Date(task.dueDate);
    return taskDueDate < now;
  }
  get filteredAndSortedTasks(): Task[] {
    let filteredTasks = this.filterStatus === 'all'
      ? this.tasks
      : this.tasks.filter(task => task.status === this.filterStatus);

    if (this.sortBy) {
      filteredTasks = filteredTasks.slice().sort((a, b) => {
        if (this.sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (this.sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
    }

    return filteredTasks;
  }
}
