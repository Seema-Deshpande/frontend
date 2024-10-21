import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from './task.form.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Task } from '../dashboard/dashboard.component';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTaskById', 'updateTask', 'addTask']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, BrowserAnimationsModule],
      declarations: [TaskFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (param: string) => param === 'id' ? '1' : null
              }
            }
          }
        },
        { provide: Router, useValue: routerSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load task for editing if taskId is present', fakeAsync(() => {
      const mockTask: Task = {
        _id: '1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2024-03-15T00:00:00.000Z',
        status: 'pending'
      };
      taskServiceSpy.getTaskById.and.returnValue(of(mockTask));

      component.ngOnInit();
      tick(); // Simulate passage of time

      expect(taskServiceSpy.getTaskById).toHaveBeenCalledWith('1');
      expect(component.task).toEqual({ 
        ...mockTask, 
        dueDate: '2024-03-15' 
      });
    }));

    it('should initialize new task if taskId is not present', () => {
      const route = TestBed.inject(ActivatedRoute);
      route.snapshot.paramMap.get = () => null; // Simulate no taskId

      component.ngOnInit();

      expect(taskServiceSpy.getTaskById).not.toHaveBeenCalled();
      expect(component.task).toEqual({ title: '', description: '', dueDate: '', status: 'pending' });
    });
  });

  describe('onSubmit', () => {
    it('should update task if task._id is present', () => {
      component.task = { 
        _id: '1', 
        title: 'Updated Task', 
        description: 'Updated Description', 
        dueDate: '2024-03-20', 
        status: 'in-progress' 
      };
      taskServiceSpy.updateTask.and.returnValue(of(component.task));

      component.onSubmit();

      expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(component.task);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(toastrSpy.success).toHaveBeenCalledWith('Task updated successfully!', 'Success');
    });

    it('should add task if task._id is not present', () => {
      component.task = { 
        title: 'New Task', 
        description: 'New Description', 
        dueDate: '2024-03-25', 
        status: 'pending' 
      };
      taskServiceSpy.addTask.and.returnValue(of({ 
        _id: '2', 
        title: 'New Task', 
        description: 'New Description', 
        dueDate: '2024-03-25', 
        status: 'pending' 
      }));

      component.onSubmit();

      expect(taskServiceSpy.addTask).toHaveBeenCalledWith(component.task);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(toastrSpy.success).toHaveBeenCalledWith('Task added successfully!', 'Success');
    });

    it('should not submit if task title is empty', () => {
      component.task = { title: '', description: 'Some Description', dueDate: '2024-03-25', status: 'pending' };

      component.onSubmit();

      expect(taskServiceSpy.addTask).not.toHaveBeenCalled();
      expect(taskServiceSpy.updateTask).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(toastrSpy.success).not.toHaveBeenCalled();
    });

    it('should handle update task error', () => {
      component.task = { _id: '1', title: 'Updated Task', description: 'Updated Description', dueDate: '2024-03-20', status: 'in-progress' };
      const mockError = new Error('Update failed');
      taskServiceSpy.updateTask.and.returnValue(throwError(() => mockError));

      component.onSubmit();

      expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(component.task);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(toastrSpy.error).toHaveBeenCalledWith('Update failed', 'Error');
    });

    it('should handle add task error', () => {
      component.task = { title: 'New Task', description: 'New Description', dueDate: '2024-03-25', status: 'pending' };
      const mockError = new Error('Add failed');
      taskServiceSpy.addTask.and.returnValue(throwError(() => mockError));

      component.onSubmit();

      expect(taskServiceSpy.addTask).toHaveBeenCalledWith(component.task);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(toastrSpy.error).toHaveBeenCalledWith('Add failed', 'Error');
    });
  });
});
