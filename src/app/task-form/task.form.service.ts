import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { Task } from '../dashboard/dashboard.component'; // Adjust the import path as necessary
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/auth/task'; // Replace with your API URL

  constructor(
    private http: HttpClient, 
    private notificationService: NotificationService, 
    private authService: AuthService
  ) {}

  getTasks(): Observable<Task[]> {
    const userId = this.authService.getUserId(); // Get the user ID
    return this.http.get<Task[]>(`${this.apiUrl}?userId=${userId}`); // Send userId as a query parameter
  }

  getTaskById(id: string): Observable<Task> {
    const userId = this.authService.getUserId(); // Ensure you're fetching the task for the correct user
    return this.http.get<Task>(`${this.apiUrl}/${id}/${userId}`); // Include userId in the request
  }

  addTask(task: Task): Observable<Task> {
    const userId = this.authService.getUserId();
    const newTask = { ...task, userId }; // Associate the task with the user ID
    return this.http.post<Task>(this.apiUrl, newTask); // Send the task with userId
  }

  updateTask(task: Task): Observable<Task> {
    const userId = this.authService.getUserId(); // Include userId for the update operation
    return this.http.put<Task>(`${this.apiUrl}/${task._id}/${userId}`, task); // Include userId in the request
  }

  deleteTask(task: Task): Observable<void> {
    const userId = this.authService.getUserId(); // Include userId for the delete operation
    return this.http.delete<void>(`${this.apiUrl}/${task._id}/${userId}`); // Include userId in the request
  }

  checkTaskNotifications(tasks: Task[]) {
    const now = new Date();
    const dueSoonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    tasks.forEach(task => {
      const taskDueDate = new Date(task.dueDate);

      if (taskDueDate <= now) {
        // Task is overdue
        this.notificationService.addNotification({
          id: task._id ?? '',
          title: 'Overdue Task',
          message: `Your Task "${task.title}" is overdue!`,
          status: task.status,
          date: task.dueDate,
          type: 'overdue',
        });
      } else if (taskDueDate <= dueSoonThreshold) {
        // Task is due soon
        this.notificationService.addNotification({
          id: task._id ?? '',
          message: `Your task "${task.title}" is due soon!`,
          type: 'due-soon',
          title: 'Task Due Soon',
          status: task.status,
          date: task.dueDate,
        });
      }
    });
  }
}
