import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './dashboard.component'; // Adjust the import path as necessary
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/auth/task'; // Replace with your API URL

  constructor(private http: HttpClient,  private authService: AuthService) {}

  getTasks(): Observable<Task[]> {
    const userId = this.authService.getUserId(); // Get the user ID
    return this.http.get<Task[]>(`${this.apiUrl}?userId=${userId}`); // Send userId as a query parameter
  }

  getTaskById(id: string): Observable<Task> {
    const userId = this.authService.getUserId(); // Ensure you're fetching the task for the correct user
    return this.http.get<Task>(`${this.apiUrl}/${id}?userId=${userId}`); // Include userId in the request
  }

  addTask(task: Task): Observable<Task> {
    const userId = this.authService.getUserId();
    const newTask = { ...task, userId }; // Associate the task with the user ID
    return this.http.post<Task>(this.apiUrl, newTask); // Send the task with userId
  }

  updateTask(task: Task): Observable<Task> {
    const userId = this.authService.getUserId(); // Include userId for the update operation
    return this.http.put<Task>(`${this.apiUrl}/${task._id}?userId=${userId}`, task); // Include userId in the request
  }

  deleteTask(task: Task): Observable<void> {
    const userId = this.authService.getUserId(); // Include userId for the delete operation
    return this.http.delete<void>(`${this.apiUrl}/${task._id}/${userId}`); // Include userId in the request
  }
}
