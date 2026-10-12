import { ApiClient } from './apiClient';
import {
  Schedule,
  ScheduleConflict,
  ScheduleApprovalHistory,
  Branch,
  Major,
  Course,
  Classroom,
  Lecturer,
  ClassSection,
  User,
  SystemSetting
} from '../../types/database';

export const ScheduleApiService = {
  getAll: () => ApiClient.get<Schedule[]>('/schedules'),
  getById: (id: string) => ApiClient.get<Schedule>(`/schedules/${id}`),
  create: (data: Partial<Schedule>) => ApiClient.post<Schedule>('/schedules', data),
  update: (id: string, data: Partial<Schedule>) => ApiClient.put<Schedule>(`/schedules/${id}`, data),
  delete: (id: string) => ApiClient.delete<void>(`/schedules/${id}`),
  submit: (id: string) => ApiClient.post<Schedule>(`/schedules/${id}/submit`, {}),
  approve: (id: string, comments: string) => ApiClient.post<Schedule>(`/schedules/${id}/approve`, { comments }),
  reject: (id: string, comments: string) => ApiClient.post<Schedule>(`/schedules/${id}/reject`, { comments }),
};

export const ConflictApiService = {
  getAll: () => ApiClient.get<ScheduleConflict[]>('/conflicts'),
  resolve: (id: string, resolution_notes: string) =>
    ApiClient.post<ScheduleConflict>(`/conflicts/${id}/resolve`, { resolution_notes }),
};

export const BranchApiService = {
  getAll: () => ApiClient.get<Branch[]>('/branches'),
  create: (data: Partial<Branch>) => ApiClient.post<Branch>('/branches', data),
  update: (id: string, data: Partial<Branch>) => ApiClient.put<Branch>(`/branches/${id}`, data),
  delete: (id: string) => ApiClient.delete<void>(`/branches/${id}`),
};

export const LecturerApiService = {
  getAll: () => ApiClient.get<Lecturer[]>('/lecturers'),
  create: (data: Partial<Lecturer>) => ApiClient.post<Lecturer>('/lecturers', data),
  update: (id: string, data: Partial<Lecturer>) => ApiClient.put<Lecturer>(`/lecturers/${id}`, data),
  delete: (id: string) => ApiClient.delete<void>(`/lecturers/${id}`),
};

export const ClassroomApiService = {
  getAll: () => ApiClient.get<Classroom[]>('/classrooms'),
  create: (data: Partial<Classroom>) => ApiClient.post<Classroom>('/classrooms', data),
  update: (id: string, data: Partial<Classroom>) => ApiClient.put<Classroom>(`/classrooms/${id}`, data),
  delete: (id: string) => ApiClient.delete<void>(`/classrooms/${id}`),
};
