import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, X, Upload, ChevronLeft, ChevronRight, GripVertical, Flag, MapPin } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TourStep {
  id: string;
  title: string;
  image: string | null;
}

export default function TerminalTourGuidePage() {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [editingStep, setEditingStep] = useState<TourStep | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Form state
  const [stepTitle, setStepTitle] = useState('');
  const [stepImage, setStepImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setStepImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setStepImage(null);
    setImagePreviewUrl(null);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Convert FileList to Array and sort by filename
      const fileArray = Array.from(files);
      
      // Sort files: if they have numbers at the start, sort by those numbers; otherwise alphabetically
      fileArray.sort((a, b) => {
        const aMatch = a.name.match(/^(\d+)/);
        const bMatch = b.name.match(/^(\d+)/);
        
        if (aMatch && bMatch) {
          // Both have numbers at the start, sort numerically
          return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        } else if (aMatch) {
          // Only a has number, it comes first
          return -1;
        } else if (bMatch) {
          // Only b has number, it comes first
          return 1;
        } else {
          // Neither has number, sort alphabetically
          return a.name.localeCompare(b.name);
        }
      });

      const newSteps: TourStep[] = [];
      fileArray.forEach((file, i) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Extract filename without extension
          const fileName = file.name.replace(/\.[^/.]+$/, '');
          
          const newStep: TourStep = {
            id: Date.now().toString() + i,
            title: fileName,
            image: reader.result as string,
          };
          newSteps.push(newStep);
          if (newSteps.length === fileArray.length) {
            setSteps([...steps, ...newSteps]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input so the same files can be uploaded again if needed
    e.target.value = '';
  };

  const handleSaveStep = () => {
    if (!stepTitle || !imagePreviewUrl) return;

    if (editingStep) {
      // Update existing step
      setSteps(steps.map(step => 
        step.id === editingStep.id 
          ? { ...step, title: stepTitle, image: imagePreviewUrl }
          : step
      ));
      setIsEditModalOpen(false);
    } else {
      // Add new step
      const newStep: TourStep = {
        id: Date.now().toString(),
        title: stepTitle,
        image: imagePreviewUrl,
      };
      setSteps([...steps, newStep]);
      setIsAddModalOpen(false);
    }

    resetForm();
  };

  const resetForm = () => {
    setStepTitle('');
    setStepImage(null);
    setImagePreviewUrl(null);
    setEditingStep(null);
  };

  const handleEdit = (step: TourStep) => {
    setEditingStep(step);
    setStepTitle(step.title);
    setImagePreviewUrl(step.image);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const handlePreview = (index: number) => {
    setCurrentStepIndex(index);
    setIsPreviewModalOpen(true);
  };

  const handleNextPreview = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevPreview = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
            <MapPin size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Terminal Tour Guide
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Create interactive step-by-step tours for patient terminals
            </p>
          </div>
        </div>
        {steps.length > 0 && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} strokeWidth={2} />
              <span className="text-[14px] font-medium font-['Poppins',sans-serif]">Add Step</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-[#4EBEE3] hover:bg-[#4EBEE3]/90 text-white rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkUpload}
                className="hidden"
              />
              <Upload size={18} strokeWidth={2} />
              <span className="text-[14px] font-medium font-['Poppins',sans-serif]">Bulk Upload</span>
            </label>
          </div>
        )}
      </div>

      {/* Content */}
      {steps.length === 0 ? (
        // Empty State - Matching Location Page Style
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <Flag size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Tour Steps Added
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  No tour steps have been added yet. Create your first tour step to get started.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                  >
                    <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                      <Plus size={14} strokeWidth={2.5} />
                    </div>
                    Add Step
                  </button>
                  <label className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#4EBEE3] text-[#4EBEE3] hover:bg-[#4EBEE3]/5 rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBulkUpload}
                      className="hidden"
                    />
                    <Upload size={18} strokeWidth={2} />
                    Bulk Upload
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Steps Grid
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <SortableContext items={steps.map(s => s.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-5">
              {steps.map((step, index) => (
                <SortableStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  onPreview={() => handlePreview(index)}
                  onEdit={() => handleEdit(step)}
                  onDelete={() => handleDelete(step.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[600px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                {editingStep ? 'Edit Step' : 'Add Step'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Step Title */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Step Title
                </label>
                <input
                  type="text"
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  placeholder="Enter step title"
                  className="w-full px-4 py-2.5 text-[14px] font-['Poppins',sans-serif] text-[#16274D] bg-white border-2 border-[#D1D5DC] rounded-lg focus:outline-none focus:border-[#4EBEE3] transition-all"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  Image Upload
                </label>
                
                {!imagePreviewUrl ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="border-[1.875px] border-dashed border-[#D1D5DC] rounded-lg p-8 hover:border-[#4EBEE3] transition-all duration-200">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
                        </div>
                        <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          Click to upload image
                        </p>
                        <p className="text-[12px] text-[#6A7282] font-['Poppins',sans-serif]">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Step preview" 
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                        {stepImage?.name}
                      </p>
                      <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
                        Step image uploaded
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                      title="Remove image"
                    >
                      <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 bg-[rgba(249,250,251,0.5)] border-t border-gray-200">
              <button 
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif] border border-[#D1D5DC] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStep}
                disabled={!stepTitle || !imagePreviewUrl}
                className="px-5 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm font-['Poppins',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && steps[currentStepIndex] && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-[900px] max-h-[90vh] overflow-hidden">
            {/* Close Button */}
            <button 
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 z-10 rounded-lg p-2 bg-white/90 hover:bg-white transition-colors shadow-lg"
            >
              <X size={24} className="text-gray-700" strokeWidth={2} />
            </button>

            {/* Navigation Buttons */}
            {currentStepIndex > 0 && (
              <button 
                onClick={handlePrevPreview}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-lg p-2 bg-white/90 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronLeft size={24} className="text-gray-700" strokeWidth={2} />
              </button>
            )}
            {currentStepIndex < steps.length - 1 && (
              <button 
                onClick={handleNextPreview}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-lg p-2 bg-white/90 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronRight size={24} className="text-gray-700" strokeWidth={2} />
              </button>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Step Info */}
              <div className="mb-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4EBEE3] text-white rounded-lg mb-2">
                  <span className="text-[14px] font-semibold font-['Poppins',sans-serif]">
                    Step {currentStepIndex + 1}
                  </span>
                </div>
                <h3 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                  {steps[currentStepIndex].title}
                </h3>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                <img 
                  src={steps[currentStepIndex].image || ''} 
                  alt={steps[currentStepIndex].title}
                  className="max-w-full max-h-[calc(90vh-200px)] object-contain"
                />
              </div>

              {/* Step Counter */}
              <div className="mt-4 text-center">
                <p className="text-[13px] text-[#637381] font-['Poppins',sans-serif]">
                  {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sortable Step Card Component
function SortableStepCard({ 
  step, 
  index, 
  onPreview, 
  onEdit, 
  onDelete 
}: { 
  step: TourStep; 
  index: number; 
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-xl overflow-hidden transition-all duration-200
        ${isDragging 
          ? 'opacity-40 scale-95 shadow-2xl ring-4 ring-[#4EBEE3]/30' 
          : 'shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)] hover:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.3),0px_16px_32px_-4px_rgba(145,158,171,0.16)]'
        }
        ${isOver && !isDragging 
          ? 'ring-2 ring-[#4EBEE3] scale-105' 
          : ''
        }
      `}
    >
      {/* Image - Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className="relative aspect-video bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {step.image ? (
          <img 
            src={step.image} 
            alt={step.title}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-[14px] text-[#637381] font-['Poppins',sans-serif]">No image</p>
          </div>
        )}
        {/* Drag indicator */}
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-gray-600" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Step Number */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4EBEE3]/10 text-[#4EBEE3] rounded-full mb-2">
          <span className="text-[12px] font-semibold font-['Poppins',sans-serif]">
            Step {index + 1}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-3 line-clamp-2 min-h-[36px]">
          {step.title}
        </h3>

        {/* Actions */}
        <div className="flex items-center gap-3 text-[13px] font-['Poppins',sans-serif]">
          <button 
            onClick={onPreview}
            className="flex items-center gap-1.5 text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors"
          >
            <Eye size={14} strokeWidth={2} />
            <span>Preview</span>
          </button>
          <span className="text-gray-300">•</span>
          <button 
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors"
          >
            <Edit size={14} strokeWidth={2} />
            <span>Edit</span>
          </button>
          <span className="text-gray-300">•</span>
          <button 
            onClick={onDelete}
            className="flex items-center gap-1.5 text-[#EF4444] hover:text-[#DC2626] transition-colors"
          >
            <Trash2 size={14} strokeWidth={2} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}