import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { Classroom, RoomType } from '../types/database';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import { DoorOpen, Plus, Edit, Trash2, Building, Users, Cpu, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const classroomSchema = z.object({
  branch_id: z.string().min(1, 'Campus branch is required'),
  room_number: z.string().min(1, 'Room number is required'),
  building: z.string().optional(),
  capacity: z.coerce.number().min(5, 'Capacity must be at least 5'),
  room_type: z.enum(['CLASSROOM', 'LECTURE_HALL', 'COMPUTER_LAB', 'SEMINAR_ROOM', 'WORKSHOP']),
  equipment: z.string().optional(),
  is_available: z.boolean().default(true),
  is_active: z.boolean().default(true)
});

type ClassroomFormData = z.infer<typeof classroomSchema>;

export const ClassroomsPage: React.FC = () => {
  const { canEditOperational } = useAuth();
  const { classrooms, branches, addClassroom, updateClassroom, deleteClassroom, schedules } = useOperations();

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      branch_id: '1',
      room_number: '',
      building: '',
      capacity: 40,
      room_type: 'CLASSROOM',
      equipment: '',
      is_available: true,
      is_active: true
    }
  });

  const handleOpenCreate = () => {
    reset({
      branch_id: branches[0]?.id || '1',
      room_number: '',
      building: '',
      capacity: 40,
      room_type: 'CLASSROOM',
      equipment: '',
      is_available: true,
      is_active: true
    });
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Classroom) => {
    reset({
      branch_id: room.branch_id,
      room_number: room.room_number,
      building: room.building || '',
      capacity: room.capacity,
      room_type: room.room_type,
      equipment: room.equipment || '',
      is_available: room.is_available,
      is_active: room.is_active ?? true
    });
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const onSubmit = (data: ClassroomFormData) => {
    if (editingRoom) {
      updateClassroom(editingRoom.id, data);
    } else {
      addClassroom(data);
    }
    setIsModalOpen(false);
  };

  const filteredRooms = classrooms.filter(r => {
    if (selectedBranch !== 'all' && r.branch_id !== selectedBranch) return false;
    if (selectedType !== 'all' && r.room_type !== selectedType) return false;
    return true;
  });

  const totalSeats = filteredRooms.reduce((acc, r) => acc + r.capacity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-brand-blue" />
            Classrooms, Labs & Physical Facilities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Physical spaces, technology hardware specifications, and capacity allocations across branches.
          </p>
        </div>

        {canEditOperational && (
          <button onClick={handleOpenCreate} className="btn-primary gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Classroom</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="card-enterprise p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Campus:</span>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Campuses ({branches.length})</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Facility Type:</span>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Facility Types</option>
              <option value="CLASSROOM">Classroom</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="COMPUTER_LAB">Computer Lab</option>
              <option value="SEMINAR_ROOM">Seminar Room</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500">
          Showing <strong>{filteredRooms.length}</strong> facilities ({totalSeats} total seating capacity)
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => {
          const branch = branches.find(b => b.id === room.branch_id);
          const activeBookings = schedules.filter(s => s.classroom_id === room.id && s.status !== 'REJECTED').length;

          return (
            <div key={room.id} className="card-enterprise p-4 flex flex-col justify-between hover:shadow-card-hover transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-sm font-extrabold text-brand-navy">
                      {room.room_number}
                    </span>
                    <div className="text-[10px] text-slate-400 font-medium">{room.building || branch?.name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    room.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {room.is_available ? 'Available' : 'Reserved'}
                  </span>
                </div>

                <div className="py-2.5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Type:</span>
                    <span className="font-semibold text-slate-800">{room.room_type.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {room.capacity} Seats
                    </span>
                  </div>

                  {room.equipment && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Equipment / Rig:</span>
                      <p className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 line-clamp-2 leading-tight">
                        {room.equipment}
                      </p>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Active Bookings:</span>
                    <span className="font-bold text-brand-blue">{activeBookings} Sessions</span>
                  </div>
                </div>
              </div>

              {canEditOperational && (
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-blue-50 rounded transition-colors"
                    title="Edit Classroom"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(room.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Classroom"
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
        title={editingRoom ? `Edit Classroom: ${editingRoom.room_number}` : 'Add Physical Classroom'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Campus Branch *</label>
              <select
                {...register('branch_id')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room Designation *</label>
              <input
                type="text"
                {...register('room_number')}
                placeholder="e.g. LAB-302"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-mono font-bold"
              />
              {errors.room_number && <p className="text-red-500 mt-1">{errors.room_number.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Building Wing / Block</label>
              <input
                type="text"
                {...register('building')}
                placeholder="e.g. Computing Systems Block A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Seating Capacity *</label>
              <input
                type="number"
                min={5}
                {...register('capacity')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Room Classification *</label>
            <select
              {...register('room_type')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="CLASSROOM">CLASSROOM (Standard Lecture Room)</option>
              <option value="LECTURE_HALL">LECTURE_HALL (Tiered Auditorium)</option>
              <option value="COMPUTER_LAB">COMPUTER_LAB (Workstation Lab)</option>
              <option value="SEMINAR_ROOM">SEMINAR_ROOM (Conference Room)</option>
              <option value="WORKSHOP">WORKSHOP (Hardware & Engineering)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Hardware & Audio-Visual Rig</label>
            <textarea
              {...register('equipment')}
              rows={2}
              placeholder="e.g. 45 Linux Workstations, 4K Projector, Surround Audio, Gigabit LAN..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_available')}
                className="rounded text-brand-blue focus:ring-brand-blue"
              />
              <span className="font-semibold text-slate-700">Available for Allocation</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingRoom ? 'Save Changes' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteClassroom(deleteId);
        }}
        title="Delete Classroom Facility?"
        message="This will remove the room from the active facility registry."
      />
    </div>
  );
};
