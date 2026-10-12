import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { Course } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { BookOpen, Plus, Edit, Trash2, Award, Clock, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const courseSchema = z.object({
  code: z.string().min(2, 'Course code is required'),
  name: z.string().min(3, 'Course name is required'),
  description: z.string().min(5, 'Description is required'),
  credits: z.coerce.number().min(1).max(12),
  year_level: z.coerce.number().min(1).max(8).optional(),
  semester_id: z.string().optional(),
  major_ids: z.array(z.string()).min(1, 'Select at least one major program'),
  is_active: z.boolean().default(true)
});

type CourseFormData = z.infer<typeof courseSchema>;

export const CoursesPage: React.FC = () => {
  const { canEditOperational } = useAuth();
  const { courses, majors, courseMajors, addCourse, updateCourse, deleteCourse } = useOperations();

  const [search, setSearch] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      credits: 3,
      year_level: 1,
      semester_id: '1',
      major_ids: [],
      is_active: true
    }
  });

  const watchMajorIds = watch('major_ids') || [];

  const handleOpenCreate = () => {
    reset({
      code: '',
      name: '',
      description: '',
      credits: 3,
      year_level: 1,
      semester_id: '1',
      major_ids: majors.slice(0, 1).map(m => m.id),
      is_active: true
    });
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    const linkedMajors = courseMajors.filter(cm => cm.course_id === course.id).map(cm => cm.major_id);
    reset({
      code: course.code,
      name: course.name,
      description: course.description,
      credits: course.credits,
      year_level: course.year_level || 1,
      semester_id: course.semester_id || '1',
      major_ids: linkedMajors,
      is_active: course.is_active
    });
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const onSubmit = (data: CourseFormData) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, {
        code: data.code,
        name: data.name,
        description: data.description,
        credits: data.credits,
        year_level: data.year_level,
        semester_id: data.semester_id,
        is_active: data.is_active
      });
    } else {
      addCourse(
        {
          code: data.code,
          name: data.name,
          description: data.description,
          credits: data.credits,
          year_level: data.year_level,
          semester_id: data.semester_id,
          is_active: data.is_active
        },
        data.major_ids
      );
    }
    setIsModalOpen(false);
  };

  const filteredCourses = courses.filter(c => {
    if (selectedMajor !== 'all') {
      const isLinked = courseMajors.some(cm => cm.course_id === c.id && cm.major_id === selectedMajor);
      if (!isLinked) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-blue" />
            Course Catalog & Syllabus Curriculum
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standardized academic courses, credit hour quotas, and degree major linkages.
          </p>
        </div>

        {canEditOperational && (
          <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search course code or title..."
            className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Major:</span>
            <select
              value={selectedMajor}
              onChange={e => setSelectedMajor(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Majors ({majors.length})</option>
              {majors.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-medium">
          Showing <strong>{filteredCourses.length}</strong> of {courses.length} courses
        </span>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map(course => {
          const linkedMajors = courseMajors
            .filter(cm => cm.course_id === course.id)
            .map(cm => majors.find(m => m.id === cm.major_id))
            .filter(Boolean);

          return (
            <div key={course.id} className="card-enterprise p-5 flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-blue border border-blue-200">
                      {course.code}
                    </span>
                    <h3 className="text-base font-bold text-brand-navy mt-2 leading-snug">{course.name}</h3>
                  </div>
                  <StatusBadge status={course.is_active} size="sm" />
                </div>

                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {course.credits} Credits
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      Year {course.year_level || 1}
                    </span>
                  </div>

                  <p className="text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Degree Programs:</span>
                    <div className="flex flex-wrap gap-1">
                      {linkedMajors.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {m?.code} - {m?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {canEditOperational && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                    title="Edit Course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(course.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.code}` : 'Add Catalog Course'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                {...register('code')}
                placeholder="e.g. CS201"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 uppercase font-mono"
              />
              {errors.code && <p className="text-red-500 mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Credit Hours *</label>
              <input
                type="number"
                min={1}
                max={12}
                {...register('credits')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Data Structures & Algorithmic Complexity"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Syllabus scope and academic topics covered..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Associated Majors *</label>
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-32 overflow-y-auto">
              {majors.map(m => {
                const isSelected = watchMajorIds.includes(m.id);
                return (
                  <label key={m.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => {
                        if (e.target.checked) {
                          setValue('major_ids', [...watchMajorIds, m.id]);
                        } else {
                          setValue('major_ids', watchMajorIds.filter(id => id !== m.id));
                        }
                      }}
                      className="rounded text-brand-blue focus:ring-brand-blue"
                    />
                    <span className="truncate">{m.code} - {m.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.major_ids && <p className="text-red-500 mt-1">{errors.major_ids.message}</p>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_active_course"
              {...register('is_active')}
              className="rounded text-brand-blue focus:ring-brand-blue"
            />
            <label htmlFor="is_active_course" className="font-semibold text-slate-700">
              Active Curriculum Course
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteCourse(deleteId);
        }}
        title="Delete Course?"
        message="This will remove the course record from the active catalog."
      />
    </div>
  );
};
