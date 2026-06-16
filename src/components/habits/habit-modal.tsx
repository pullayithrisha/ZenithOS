/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { Habit, Priority } from '@/types/database';
import { useHabits } from '@/hooks/use-habits';
import { X, Save, Trash2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

export function HabitModal({ isOpen, onClose, habitToEdit }: HabitModalProps) {
  const { createHabit, updateHabitDetails, deleteHabit } = useHabits();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('productivity');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [reminderTime, setReminderTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category || 'productivity');
      setPriority(habitToEdit.priority || 'Medium');
      setReminderTime(habitToEdit.reminder_time || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('productivity');
      setPriority('Medium');
      setReminderTime('');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (habitToEdit) {
        await updateHabitDetails(habitToEdit.id, {
          title,
          description: description || null,
          category,
          priority,
          reminder_time: reminderTime || null,
        });
        toast.success('Habit updated');
      } else {
        await createHabit({
          title,
          description: description || null,
          category,
          priority,
          reminder_time: reminderTime || null,
          frequency_type: 'daily',
          is_active: true,
          is_recurring: true, // Habits created via this modal are explicitly recurring
        });
        toast.success('Habit created');
      }
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(`Failed to save habit: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!habitToEdit) return;
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        await deleteHabit(habitToEdit.id);
        toast.success('Habit deleted');
        onClose();
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Something went wrong';
        toast.error(`Failed to delete habit: ${msg}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full sm:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 rounded-2xl border-border bg-background max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border flex-shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-foreground">{habitToEdit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Read for 30 minutes"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any specific rules or goals?"
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-16 resize-none text-sm placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                <AlertCircle className="w-3.5 h-3.5" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" /> Reminder Time (Optional)
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
              <p className="text-[10px] text-muted-foreground mt-1">If set, we&apos;ll try to notify you around this time.</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
              {habitToEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </button>
              ) : <div />}
              
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex items-center px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {habitToEdit ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
