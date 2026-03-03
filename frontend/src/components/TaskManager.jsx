import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus, 
  Trash2,
  Save,
  Filter
} from 'lucide-react';
import { taskApi } from '../api/tasks';

export default function TaskManager() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get month data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, daysInMonth).toISOString().split('T')[0];
      
      const response = await taskApi.getTasks(startDate, endDate);
      const taskMap = {};
      response.data.tasks.forEach(task => {
        const dateKey = new Date(task.date).toISOString().split('T')[0];
        taskMap[dateKey] = task;
      });
      setTasks(taskMap);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDateKey = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleTaskToggle = async (day) => {
    const dateKey = getDateKey(day);
    const existingTask = tasks[dateKey];

    try {
      if (existingTask) {
        // Toggle completion
        const newCompleted = !existingTask.completed;
        await taskApi.updateTaskStatus(existingTask._id, newCompleted);
        setTasks(prev => ({
          ...prev,
          [dateKey]: { ...existingTask, completed: newCompleted }
        }));
        toast.success(newCompleted ? 'Task marked as completed' : 'Task marked as pending');
      } else {
        // Create new task
        const response = await taskApi.saveTask({
          date: dateKey,
          description: `Task for ${dateKey}`,
          completed: true
        });
        setTasks(prev => ({
          ...prev,
          [dateKey]: response.data.task
        }));
        toast.success('Task created and completed');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (day, e) => {
    e.stopPropagation();
    const dateKey = getDateKey(day);
    const existingTask = tasks[dateKey];

    if (!existingTask) return;

    try {
      await taskApi.deleteTask(existingTask._id);
      setTasks(prev => {
        const newTasks = { ...prev };
        delete newTasks[dateKey];
        return newTasks;
      });
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Manager</h2>
          <p className="text-gray-500 mt-1">Track your daily activities and progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 font-semibold text-gray-900 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Excel-like Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-3 text-left font-semibold text-gray-700 w-16">Date</th>
              <th className="border p-3 text-left font-semibold text-gray-700">Day</th>
              <th className="border p-3 text-center font-semibold text-gray-700 w-24">Status</th>
              <th className="border p-3 text-left font-semibold text-gray-700">Description</th>
              <th className="border p-3 text-center font-semibold text-gray-700 w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <tr key={`empty-${index}`} className="bg-gray-50/50">
                    <td className="border p-3 text-gray-300">-</td>
                    <td className="border p-3 text-gray-300">-</td>
                    <td className="border p-3">-</td>
                    <td className="border p-3 text-gray-300">-</td>
                    <td className="border p-3">-</td>
                  </tr>
                );
              }

              const dateKey = getDateKey(day);
              const task = tasks[dateKey];
              const dayName = weekDays[new Date(year, month, day).getDay()];
              const isToday = new Date().toISOString().split('T')[0] === dateKey;

              return (
                <tr 
                  key={day} 
                  className={`hover:bg-blue-50/50 transition-colors ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <td className="border p-3 font-medium text-gray-900">
                    {String(day).padStart(2, '0')}
                    {isToday && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Today</span>}
                  </td>
                  <td className="border p-3 text-gray-600">{dayName}</td>
                  <td className="border p-3 text-center">
                    <button
                      onClick={() => handleTaskToggle(day)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        task?.completed
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="border p-3">
                    {task ? (
                      <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                        {task.description}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Click checkbox to add task</span>
                    )}
                  </td>
                  <td className="border p-3 text-center">
                    {task && (
                      <button
                        onClick={(e) => handleDeleteTask(day, e)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
            <Check className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-gray-600">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-50 border-2 border-blue-200 rounded"></div>
          <span className="text-gray-600">Today</span>
        </div>
      </div>
    </div>
  );
}
