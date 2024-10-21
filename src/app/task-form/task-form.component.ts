import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../dashboard/dashboard.component';
import { TaskService } from './task.form.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit{
  task!: Task | null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private toastr: ToastrService ) {}

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      // Load the task for editing using the TaskService
      this.taskService.getTaskById(taskId).subscribe(task => {
        this.task = task;
        this.task = {
          ...task,
          dueDate: task.dueDate.split('T')[0] // Ensure the date is in YYYY-MM-DD format
        };
      });
    }
    else {
      // Initialize a new task object for adding a new task
      this.task = {
        title: '',
        description: '',
        dueDate: '',
        status: 'pending'
      };
    }
  }

  onSubmit() {
    if (this.task) {
    if (this.task?.title.trim() !== '') {
      if (this.task?._id) {
        this.taskService.updateTask(this.task).subscribe(() => {
          this.router.navigate(['/dashboard']);
          this.toastr.success('Task updated successfully!', 'Success');
        });
      } else {
        this.taskService.addTask(this.task).subscribe(() => {

          this.router.navigate(['/dashboard']);
          this.toastr.success('Task added successfully!', 'Success');
        });
      }
    }
  }
}
}
