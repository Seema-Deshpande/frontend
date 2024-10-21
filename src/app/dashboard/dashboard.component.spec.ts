import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent, Task } from './dashboard.component';
import { Router } from '@angular/router';
import { DashboardService } from './dashboard.component.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../notification/notification.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';

const mockTasks: Task[] = [
  { _id: '1', title: 'Task 1', description: 'Description 1', dueDate: '2024-03-10', status: 'pending' },
  { _id: '2', title: 'Task 2', description: 'Description 2', dueDate: '2024-03-15', status: 'in-progress' },
  { _id: '3', title: 'Task 3', description: 'Description 3', dueDate: '2024-03-20', status: 'completed' }
];

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let taskServiceSpy: jasmine.SpyObj<DashboardService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    taskServiceSpy = jasmine.createSpyObj('DashboardService', ['getTasks', 'addTask', 'updateTask', 'deleteTask']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['removeNotification', 'getUnseenCount']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, BrowserAnimationsModule, DragDropModule],
      declarations: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: DashboardService, useValue: taskServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    taskServiceSpy.getTasks.and.returnValue(of(mockTasks)); // Ensure this returns an observable
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Calls ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on initialization', fakeAsync(() => {
    component.loadTasks();
    tick(); // Simulate the passage of time until all pending asynchronous activities finish

    expect(component.tasks).toEqual(mockTasks);
    expect(component.totalTasks).toBe(3);
  }));

  it('should handle error when loading tasks fails', fakeAsync(() => {
    taskServiceSpy.getTasks.and.returnValue(throwError(() => new Error('Failed to load tasks')));
    
    component.loadTasks();
    tick(); // Simulate passage of time

    expect(component.tasks).toEqual([]); // Adjust according to your error handling logic
    expect(toastrSpy.success).not.toHaveBeenCalled(); // Ensure no success message is shown
  }));

  it('should navigate to task form', () => {
    component.navigateToTaskForm();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/task-form']);
  });

  it('should add a new task', fakeAsync(() => {
    const newTask: Task = { title: 'New Task', description: 'New Description', dueDate: '2024-04-01', status: 'pending' };
    taskServiceSpy.addTask.and.returnValue(of({ ...newTask, _id: '4' }));

    component.addOrUpdateTask(newTask);
    tick(); // Simulate passage of time

    expect(taskServiceSpy.addTask).toHaveBeenCalledWith(newTask);
    expect(component.tasks).toContain({ ...newTask, _id: '4' });
  }));

  it('should handle error when adding a new task fails', fakeAsync(() => {
    const newTask: Task = { title: 'New Task', description: 'New Description', dueDate: '2024-04-01', status: 'pending' };
    taskServiceSpy.addTask.and.returnValue(throwError(() => new Error('Failed to add task')));

    component.addOrUpdateTask(newTask);
    tick(); // Simulate passage of time

    expect(taskServiceSpy.addTask).toHaveBeenCalledWith(newTask);
    expect(component.tasks).not.toContain(newTask);
  }));

  it('should delete a task', fakeAsync(() => {
    const taskToDelete = mockTasks[1];
    taskServiceSpy.deleteTask.and.returnValue(of());

    component.deleteTask(taskToDelete);
    tick(); // Simulate passage of time

    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(taskToDelete);
    expect(component.tasks).not.toContain(taskToDelete);
    expect(toastrSpy.success).toHaveBeenCalledWith('Deleted task successfully!', 'Success');
  }));

  it('should handle error when deleting a task fails', fakeAsync(() => {
    const taskToDelete = mockTasks[1];
    taskServiceSpy.deleteTask.and.returnValue(throwError(() => new Error('Deletion failed')));

    component.deleteTask(taskToDelete);
    tick(); // Simulate passage of time

    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(taskToDelete);
    expect(component.tasks).toContain(taskToDelete); // Task should still be in the array
  }));

  it('should filter tasks by status', () => {
    component.filterStatus = 'pending';
    expect(component.filteredAndSortedTasks.length).toBe(1);
    expect(component.filteredAndSortedTasks[0].title).toBe('Task 1');
  });

  it('should calculate task summary correctly', () => {
    component.calculateTaskSummary();
    expect(component.totalTasks).toBe(3);
    expect(component.dueSoonTasks).toBe(0); // Adjust based on mock data
    expect(component.completedTasks).toBe(1);
    expect(component.overDueTasks).toBe(0);
  });
});
