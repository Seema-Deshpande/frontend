import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../task-form/task.form.service';
import { NotificationService } from '../notification/notification.service';
import { of, throwError } from 'rxjs';
import { Task } from '../dashboard/dashboard.component';
import { ActivatedRoute } from '@angular/router';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let activatedRouteStub: any;

  beforeEach(waitForAsync(() => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'checkTaskNotifications']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['notify']);
    
    activatedRouteStub = { params: of({}) }; // Mock ActivatedRoute

    TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load tasks on initialization', fakeAsync(() => {
      const mockTasks: Task[] = [
        { _id: '1', title: 'Task 1', description: 'Description 1', dueDate: '2024-09-30', status: 'pending' },
        { _id: '2', title: 'Task 2', description: 'Description 2', dueDate: '2024-10-01', status: 'in-progress' }
      ];
      taskServiceSpy.getTasks.and.returnValue(of(mockTasks)); // Mocking the return value

      component.ngOnInit();
      tick(); // Simulate passage of time for async operations

      expect(taskServiceSpy.getTasks).toHaveBeenCalled();
      expect(component.tasks.length).toBe(2);
      expect(component.tasks[0].notificationStatus).toBe('normal'); // Ensure notification status is set correctly
    }));

    it('should handle error when loading tasks', fakeAsync(() => {
      taskServiceSpy.getTasks.and.returnValue(throwError(() => new Error('Error fetching tasks')));

      component.ngOnInit();
      tick();

      expect(taskServiceSpy.getTasks).toHaveBeenCalled();
      expect(component.tasks.length).toBe(0); // Ensure tasks array is empty on error
    }));
  });

  describe('onEditTask', () => {
    it('should emit editTask event if task is valid', () => {
      spyOn(component.editTask, 'emit');
      const mockTask: Task = { _id: '1', title: 'Valid Task', description: 'Description', dueDate: '2024-09-30', status: 'pending' };

      component.onEditTask(mockTask);

      expect(component.editTask.emit).toHaveBeenCalledWith(mockTask);
    });

    it('should alert validation errors if task is invalid', () => {
      spyOn(window, 'alert');
      const invalidTask: Task = { _id: '1', title: '', description: 'Description', dueDate: '2024-09-30', status: 'pending' };

      component.onEditTask(invalidTask);

      expect(window.alert).toHaveBeenCalledWith('Title is required.');
    });
  });

  describe('onDelete', () => {
    it('should emit deleteTask event if confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(component.deleteTask, 'emit');
      const mockTask: Task = { _id: '1', title: 'Task to Delete', description: 'Description', dueDate: '2024-09-30', status: 'pending' };

      component.onDelete(mockTask);

      expect(component.deleteTask.emit).toHaveBeenCalledWith(mockTask);
    });

    it('should not emit deleteTask event if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(component.deleteTask, 'emit');
      const mockTask: Task = { _id: '1', title: 'Task to Delete', description: 'Description', dueDate: '2024-09-30', status: 'pending' };

      component.onDelete(mockTask);

      expect(component.deleteTask.emit).not.toHaveBeenCalled();
    });
  });

  describe('validateTask', () => {
    it('should return errors for invalid task', () => {
      const invalidTask: Task = { _id: '1', title: '', description: 'Description', dueDate: 'invalid-date', status: 'pending' };
      
      const errors = component.validateTask(invalidTask);

      expect(errors).toContain('Title is required.');
      expect(errors).toContain('Invalid due date.');
      expect(errors).toContain('Status must be one of: pending, in-progress, or completed.');
    });

    it('should return no errors for valid task', () => {
      const validTask: Task = { _id: '1', title: 'Valid Task', description: 'Description', dueDate: '2024-09-30', status: 'pending' };
      
      const errors = component.validateTask(validTask);

      expect(errors.length).toBe(0); // No errors should be present
    });
  });

  describe('getTaskStatus', () => {
    it('should return "overdue" for overdue tasks', () => {
      const pastDate = new Date(Date.now() - 100000); // A date in the past
      const status = component.getTaskStatus(pastDate.toISOString());
      
      expect(status).toBe('overdue');
    });

    it('should return "due-soon" for tasks due soon', () => {
      const nearFutureDate = new Date(Date.now() + 1000 * 60 * 60 * 23); // 23 hours from now
      const status = component.getTaskStatus(nearFutureDate.toISOString());
      
      expect(status).toBe('due-soon');
    });

    it('should return "normal" for tasks not due soon', () => {
      const farFutureDate = new Date(Date.now() + 1000 * 60 * 60 * 25); // 25 hours from now
      const status = component.getTaskStatus(farFutureDate.toISOString());
      
      expect(status).toBe('normal');
    });
  });
});
