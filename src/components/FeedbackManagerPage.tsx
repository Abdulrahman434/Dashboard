import { useState, useEffect } from 'react';
import { ListChecks, Plus, Search, Edit2, Trash2, Eye, GripVertical, X, ChevronLeft, ChevronRight, Upload, Image as ImageIcon, Monitor, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineEditCell from './InlineEditCell';
import welcomeIllustration from 'figma:asset/27bd8a5ac2cb2cab0ff08c00dda7c1e3bf4db544.png';
import thankYouIllustration from 'figma:asset/fe6b642815487ac5d04d6d380c96d88db213c0f4.png';
import questionIllustration from 'figma:asset/e4bcc2b0dcc0a267f958e3e8f68d2509b9ac267f.png';

interface Question {
  id: string;
  questionEn: string;
  questionAr: string;
  answerType: 'satisfaction' | 'quality' | 'agreement' | 'frequency' | 'emoji' | 'custom';
  customOptions?: {
    option1En: string;
    option1Ar: string;
    option2En: string;
    option2Ar: string;
    option3En: string;
    option3Ar: string;
    option4En: string;
    option4Ar: string;
    option5En: string;
    option5Ar: string;
  };
}

interface Survey {
  id: string;
  nameEn: string;
  nameAr: string;
  status: 'Active' | 'Inactive';
  welcomeTitleEn: string;
  welcomeTitleAr: string;
  welcomeMessageEn: string;
  welcomeMessageAr: string;
  welcomeImage?: string;
  questions: Question[];
  thankYouTitleEn: string;
  thankYouTitleAr: string;
  thankYouMessageEn: string;
  thankYouMessageAr: string;
  thankYouImage?: string;
  createdAt: string;
}

// Pre-built answer scale templates
const ANSWER_SCALE_TEMPLATES = {
  satisfaction: {
    label: 'Satisfaction Scale',
    options: {
      en: ['Extremely Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Extremely Satisfied'],
      ar: ['غير راضٍ تماماً', 'غير راضٍ', 'محايد', 'راضٍ', 'راضٍ تماماً']
    }
  },
  quality: {
    label: 'Quality Scale',
    options: {
      en: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
      ar: ['سيء جداً', 'سيء', 'متوسط', 'جيد', 'ممتاز']
    }
  },
  agreement: {
    label: 'Agreement Scale',
    options: {
      en: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      ar: ['أعارض بشدة', 'أعارض', 'محايد', 'أوافق', 'أوافق بشدة']
    }
  },
  frequency: {
    label: 'Frequency Scale',
    options: {
      en: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
      ar: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً']
    }
  },
  emoji: {
    label: 'Emoji Scale',
    options: {
      en: ['😞', '🙁', '😐', '🙂', '😊'],
      ar: ['😞', '🙁', '😐', '🙂', '😊']
    }
  },
  custom: {
    label: 'Custom Scale',
    options: {
      en: ['', '', '', '', ''],
      ar: ['', '', '', '', '']
    }
  }
};

const getInitialSurveys = (): Survey[] => [
  {
    id: '1',
    nameEn: 'Patient Experience Survey',
    nameAr: 'استبيان تجربة المريض',
    status: 'Active',
    welcomeTitleEn: 'Share Your Experience',
    welcomeTitleAr: 'شاركنا تجربتك',
    welcomeMessageEn: 'Your feedback helps us improve the quality of care we provide. This survey will take approximately 3 minutes to complete.',
    welcomeMessageAr: 'ملاحظاتك تساعدنا في تحسين جودة الرعاية التي نقدمها. سيستغرق هذا الاستبيان حوالي 3 دقائق لإكماله.',
    welcomeImage: welcomeIllustration,
    questions: [
      {
        id: '1',
        questionEn: 'How satisfied are you with the overall quality of care you received?',
        questionAr: 'ما مدى رضاك عن جودة الرعاية الشاملة التي تلقيتها؟',
        answerType: 'satisfaction'
      },
      {
        id: '2',
        questionEn: 'How would you rate the responsiveness of our nursing staff?',
        questionAr: 'كيف تقيّم سرعة استجابة طاقم التمريض لدينا؟',
        answerType: 'quality'
      },
      {
        id: '3',
        questionEn: 'The cleanliness of my room was maintained to a high standard.',
        questionAr: 'تم الحفاظ على نظافة غرفتي بمعيار عالٍ.',
        answerType: 'agreement'
      },
      {
        id: '4',
        questionEn: 'How would you rate the quality of food and meals provided?',
        questionAr: 'كيف تقيم جودة الطعام والوجبات المقدمة؟',
        answerType: 'quality'
      },
      {
        id: '5',
        questionEn: 'The medical staff communicated clearly about my treatment and medications.',
        questionAr: 'تواصل الطاقم الطبي بوضوح بشأن علاجي والأدوية.',
        answerType: 'agreement'
      },
      {
        id: '6',
        questionEn: 'How satisfied were you with the pain management during your stay?',
        questionAr: 'ما مدى رضاك عن إدارة الألم أثناء إقامتك؟',
        answerType: 'satisfaction'
      },
      {
        id: '7',
        questionEn: 'Overall, how was your experience with us?',
        questionAr: 'بشكل عام، كيف كانت تجربتك معنا؟',
        answerType: 'emoji'
      }
    ],
    thankYouTitleEn: 'Thank You!',
    thankYouTitleAr: 'شكراً لك!',
    thankYouMessageEn: 'We appreciate you taking the time to share your feedback. Your responses will help us continue to improve our services and patient care.',
    thankYouMessageAr: 'نقدر وقتك في مشاركة ملاحظاتك. ستساعدنا إجاباتك في الاستمرار في تحسين خدماتنا ورعاية المرضى.',
    thankYouImage: thankYouIllustration,
    createdAt: '2025-12-01T10:00:00.000Z'
  }
];

export default function FeedbackManagerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [surveys, setSurveys] = useState<Survey[]>(() => {
    const saved = localStorage.getItem('feedback-surveys');
    const dataVersion = localStorage.getItem('feedback-surveys-version');
    const currentVersion = '2025-update-illustrations';
    
    // If version is outdated or missing, use fresh data
    if (dataVersion !== currentVersion) {
      localStorage.setItem('feedback-surveys-version', currentVersion);
      return getInitialSurveys();
    }
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If saved data is empty, return initial surveys
        if (parsed.length === 0) {
          return getInitialSurveys();
        }
        return parsed;
      } catch (e) {
        return getInitialSurveys();
      }
    }
    return getInitialSurveys();
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortColumn, setSortColumn] = useState<'nameEn' | 'nameAr' | 'questions' | 'status' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);

  // Form state
  const [surveyForm, setSurveyForm] = useState({
    nameEn: '',
    nameAr: '',
    status: 'Inactive' as 'Active' | 'Inactive',
    welcomeTitleEn: '',
    welcomeTitleAr: '',
    welcomeMessageEn: '',
    welcomeMessageAr: '',
    welcomeImage: welcomeIllustration,
    questions: [] as Question[],
    thankYouTitleEn: '',
    thankYouTitleAr: '',
    thankYouMessageEn: '',
    thankYouMessageAr: '',
    thankYouImage: thankYouIllustration
  });

  const [draggedQuestion, setDraggedQuestion] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<'en' | 'ar'>('en');
  const [previewAnswers, setPreviewAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [previewComment, setPreviewComment] = useState('');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('feedback-surveys', JSON.stringify(surveys));
  }, [surveys]);

  // Reset form
  const resetForm = () => {
    setSurveyForm({
      nameEn: '',
      nameAr: '',
      status: 'Inactive',
      welcomeTitleEn: '',
      welcomeTitleAr: '',
      welcomeMessageEn: '',
      welcomeMessageAr: '',
      welcomeImage: welcomeIllustration,
      questions: [],
      thankYouTitleEn: '',
      thankYouTitleAr: '',
      thankYouMessageEn: '',
      thankYouMessageAr: '',
      thankYouImage: thankYouIllustration
    });
    setCurrentStep(1);
    setEditingSurvey(null);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'welcomeImage' | 'thankYouImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSurveyForm({ ...surveyForm, [field]: reader.result as string });
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle add survey
  const handleAddSurvey = () => {
    if (!surveyForm.nameEn.trim() || !surveyForm.nameAr.trim()) {
      toast.error('Please fill in survey name in both languages');
      return;
    }

    const newSurvey: Survey = {
      id: Date.now().toString(),
      ...surveyForm,
      createdAt: new Date().toISOString()
    };

    setSurveys([...surveys, newSurvey]);
    setShowAddModal(false);
    resetForm();
    toast.success('Survey Created', {
      description: `${newSurvey.nameEn} has been created successfully`,
    });
  };

  // Handle edit survey
  const handleEditSurvey = () => {
    if (!editingSurvey || !surveyForm.nameEn.trim() || !surveyForm.nameAr.trim()) {
      toast.error('Please fill in survey name in both languages');
      return;
    }

    setSurveys(
      surveys.map((survey) =>
        survey.id === editingSurvey.id
          ? {
              ...survey,
              ...surveyForm
            }
          : survey
      )
    );

    setShowAddModal(false);
    resetForm();
    toast.success('Survey Updated', {
      description: `Survey has been updated successfully`,
    });
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setSurveys(surveys.filter((survey) => survey.id !== id));
    setShowDeleteConfirm(false);
    setSurveyToDelete(null);
    toast.success('Survey Deleted', {
      description: 'Survey has been deleted successfully',
    });
  };

  // Handle send to screens
  const handleSendToScreens = (survey: Survey) => {
    toast.success('Survey Sent to Terminals', {
      description: `${survey.nameEn} has been sent to all active terminals`,
    });
  };

  // Handle inline edit
  const handleInlineEdit = (surveyId: string, field: keyof Survey, newValue: any) => {
    setSurveys(surveys.map(survey => 
      survey.id === surveyId ? { ...survey, [field]: newValue } : survey
    ));
    toast.success('Survey Updated', {
      description: 'Changes saved successfully',
    });
  };

  // Open edit modal
  const openEditModal = (survey: Survey) => {
    setEditingSurvey(survey);
    setSurveyForm({
      nameEn: survey.nameEn,
      nameAr: survey.nameAr,
      status: survey.status,
      welcomeTitleEn: survey.welcomeTitleEn,
      welcomeTitleAr: survey.welcomeTitleAr,
      welcomeMessageEn: survey.welcomeMessageEn,
      welcomeMessageAr: survey.welcomeMessageAr,
      welcomeImage: survey.welcomeImage || '',
      questions: survey.questions,
      thankYouTitleEn: survey.thankYouTitleEn,
      thankYouTitleAr: survey.thankYouTitleAr,
      thankYouMessageEn: survey.thankYouMessageEn,
      thankYouMessageAr: survey.thankYouMessageAr,
      thankYouImage: survey.thankYouImage || ''
    });
    setShowAddModal(true);
  };

  // Add question
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionEn: '',
      questionAr: '',
      answerType: 'satisfaction'
    };
    setSurveyForm({
      ...surveyForm,
      questions: [...surveyForm.questions, newQuestion]
    });
  };

  // Update question
  const updateQuestion = (index: number, field: string, value: any) => {
    setSurveyForm(prevForm => {
      const updatedQuestions = [...prevForm.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      return {
        ...prevForm,
        questions: updatedQuestions
      };
    });
  };

  // Delete question
  const deleteQuestion = (index: number) => {
    const updatedQuestions = surveyForm.questions.filter((_, i) => i !== index);
    setSurveyForm({
      ...surveyForm,
      questions: updatedQuestions
    });
  };

  // Reorder questions - improved drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedQuestion(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedQuestion === null || draggedQuestion === dropIndex) {
      setDraggedQuestion(null);
      setDragOverIndex(null);
      return;
    }

    const updatedQuestions = [...surveyForm.questions];
    const draggedItem = updatedQuestions[draggedQuestion];
    updatedQuestions.splice(draggedQuestion, 1);
    updatedQuestions.splice(dropIndex, 0, draggedItem);

    setSurveyForm({
      ...surveyForm,
      questions: updatedQuestions
    });
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
    setDragOverIndex(null);
  };

  // Toggle survey status
  const toggleStatus = (id: string) => {
    setSurveys(
      surveys.map((survey) => {
        if (survey.id === id) {
          const newStatus = survey.status === 'Active' ? 'Inactive' : 'Active';
          // If activating, deactivate all others
          if (newStatus === 'Active') {
            surveys.forEach((s) => {
              if (s.id !== id && s.status === 'Active') {
                s.status = 'Inactive';
              }
            });
          }
          return { ...survey, status: newStatus };
        }
        return survey;
      })
    );
    toast.success('Status Updated');
  };

  // Filter surveys
  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.nameAr.includes(searchQuery)
  );

  // Apply sorting
  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortColumn) {
      case 'nameEn':
        return multiplier * a.nameEn.localeCompare(b.nameEn);
      case 'nameAr':
        return multiplier * a.nameAr.localeCompare(b.nameAr);
      case 'questions':
        return multiplier * (a.questions.length - b.questions.length);
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'createdAt':
        return multiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return 0;
    }
  });

  // Get answer options for preview
  const getAnswerOptions = (question: Question) => {
    if (question.answerType === 'custom' && question.customOptions) {
      return {
        en: [
          question.customOptions.option1En,
          question.customOptions.option2En,
          question.customOptions.option3En,
          question.customOptions.option4En,
          question.customOptions.option5En
        ],
        ar: [
          question.customOptions.option1Ar,
          question.customOptions.option2Ar,
          question.customOptions.option3Ar,
          question.customOptions.option4Ar,
          question.customOptions.option5Ar
        ]
      };
    }
    return ANSWER_SCALE_TEMPLATES[question.answerType].options;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center shrink-0">
          <ListChecks size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Survey Manager
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Create and manage patient feedback surveys
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
          />
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
        >
          <Plus size={20} strokeWidth={2} />
          <span>Add Survey</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="text-left px-6 py-4 cursor-pointer"
                onClick={() => {
                  setSortColumn('nameEn');
                  setSortDirection(sortColumn === 'nameEn' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/70 font-['Poppins',sans-serif]">
                  <span>Survey Name (EN)</span>
                  <ArrowUpDown size={14} className={sortColumn === 'nameEn' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                </div>
              </th>
              <th
                className="text-left px-6 py-4 cursor-pointer"
                onClick={() => {
                  setSortColumn('nameAr');
                  setSortDirection(sortColumn === 'nameAr' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/70 font-['Poppins',sans-serif]">
                  <span>Survey Name (AR)</span>
                  <ArrowUpDown size={14} className={sortColumn === 'nameAr' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                </div>
              </th>
              <th
                className="text-left px-6 py-4 cursor-pointer"
                onClick={() => {
                  setSortColumn('questions');
                  setSortDirection(sortColumn === 'questions' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/70 font-['Poppins',sans-serif]">
                  <span>Questions</span>
                  <ArrowUpDown size={14} className={sortColumn === 'questions' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                </div>
              </th>
              <th
                className="text-left px-6 py-4 cursor-pointer"
                onClick={() => {
                  setSortColumn('status');
                  setSortDirection(sortColumn === 'status' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/70 font-['Poppins',sans-serif]">
                  <span>Status</span>
                  <ArrowUpDown size={14} className={sortColumn === 'status' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                </div>
              </th>
              <th
                className="text-left px-6 py-4 cursor-pointer"
                onClick={() => {
                  setSortColumn('createdAt');
                  setSortDirection(sortColumn === 'createdAt' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/70 font-['Poppins',sans-serif]">
                  <span>Created At</span>
                  <ArrowUpDown size={14} className={sortColumn === 'createdAt' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                </div>
              </th>
              <th className="text-left px-6 py-4 text-[13px] font-medium text-[#0f1729]/70 font-['Poppins',sans-serif]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSurveys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <ListChecks size={48} className="text-gray-300" strokeWidth={1.5} />
                    <p className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
                      {searchQuery ? 'No surveys found' : 'No surveys yet. Create your first survey!'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedSurveys.map((survey) => (
                <tr key={survey.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                    <InlineEditCell
                      value={survey.nameEn}
                      onSave={(newValue) => handleInlineEdit(survey.id, 'nameEn', newValue)}
                      placeholder="Survey Name (English)"
                    />
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                    <InlineEditCell
                      value={survey.nameAr}
                      onSave={(newValue) => handleInlineEdit(survey.id, 'nameAr', newValue)}
                      placeholder="اسم الاستبيان (عربي)"
                      dir="rtl"
                    />
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                    {survey.questions.length}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(survey.id)}
                      className={`px-3 py-1 rounded-full text-[12px] font-medium font-['Poppins',sans-serif] transition-colors ${
                        survey.status === 'Active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {survey.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSurveyForm({
                            nameEn: survey.nameEn,
                            nameAr: survey.nameAr,
                            status: survey.status,
                            welcomeTitleEn: survey.welcomeTitleEn,
                            welcomeTitleAr: survey.welcomeTitleAr,
                            welcomeMessageEn: survey.welcomeMessageEn,
                            welcomeMessageAr: survey.welcomeMessageAr,
                            welcomeImage: survey.welcomeImage || '',
                            questions: survey.questions,
                            thankYouTitleEn: survey.thankYouTitleEn,
                            thankYouTitleAr: survey.thankYouTitleAr,
                            thankYouMessageEn: survey.thankYouMessageEn,
                            thankYouMessageAr: survey.thankYouMessageAr,
                            thankYouImage: survey.thankYouImage || ''
                          });
                          setShowPreview(true);
                          setPreviewStep(0);
                          setPreviewAnswers({});
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleSendToScreens(survey)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Send to Terminals"
                      >
                        <Monitor size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => openEditModal(survey)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => {
                          setSurveyToDelete(survey.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-500" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Survey Modal - FIXED HEIGHT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                  {editingSurvey ? 'Edit Survey' : 'Add Survey'}
                </h2>
                <p className="text-[13px] text-[#0f1729]/60 font-['Poppins',sans-serif] mt-1">
                  Step {currentStep} of 5
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" strokeWidth={2} />
              </button>
            </div>

            {/* Stepper */}
            <div className="px-6 py-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, label: 'Settings' },
                  { step: 2, label: 'Welcome' },
                  { step: 3, label: 'Questions' },
                  { step: 4, label: 'Thank You' },
                  { step: 5, label: 'Preview' }
                ].map(({ step, label }, index) => (
                  <div key={step} className="flex items-center flex-1">
                    <button
                      onClick={() => {
                        setCurrentStep(step);
                        if (step === 5) {
                          setPreviewStep(0);
                          setPreviewAnswers({});
                        }
                      }}
                      className={`flex items-center gap-2 ${
                        currentStep === step ? 'text-[#4EBEE3]' : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-medium font-['Poppins',sans-serif] transition-colors ${
                          currentStep === step
                            ? 'bg-[#4EBEE3] text-white'
                            : currentStep > step
                            ? 'bg-[#4EBEE3]/20 text-[#4EBEE3]'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step}
                      </div>
                      <span className="text-[13px] font-medium font-['Poppins',sans-serif] hidden lg:block">
                        {label}
                      </span>
                    </button>
                    {index < 4 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          currentStep > step ? 'bg-[#4EBEE3]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Content - FIXED HEIGHT WITH SCROLL */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Step 1: Survey Settings */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Survey Name (English) *
                    </label>
                    <input
                      type="text"
                      value={surveyForm.nameEn}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, nameEn: e.target.value })
                      }
                      placeholder="e.g., Patient Experience Survey"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Survey Name (Arabic) *
                    </label>
                    <input
                      type="text"
                      value={surveyForm.nameAr}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, nameAr: e.target.value })
                      }
                      placeholder="مثال: استبيان تجربة المريض"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Status
                    </label>
                    <select
                      value={surveyForm.status}
                      onChange={(e) =>
                        setSurveyForm({
                          ...surveyForm,
                          status: e.target.value as 'Active' | 'Inactive'
                        })
                      }
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] appearance-none cursor-pointer bg-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '12px'
                      }}
                    >
                      <option value="Inactive">Inactive</option>
                      <option value="Active">Active</option>
                    </select>
                    <p className="text-[12px] text-[#4EBEE3] font-['Poppins',sans-serif] mt-1">
                      * Only one survey can be active at a time
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Welcome Screen */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Welcome Title (English)
                    </label>
                    <input
                      type="text"
                      value={surveyForm.welcomeTitleEn}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, welcomeTitleEn: e.target.value })
                      }
                      placeholder="e.g., Welcome!"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Welcome Title (Arabic)
                    </label>
                    <input
                      type="text"
                      value={surveyForm.welcomeTitleAr}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, welcomeTitleAr: e.target.value })
                      }
                      placeholder="مثال: مرحباً!"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Welcome Message (English)
                    </label>
                    <textarea
                      value={surveyForm.welcomeMessageEn}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, welcomeMessageEn: e.target.value })
                      }
                      placeholder="e.g., We value your feedback. Please take a moment to complete this survey."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Welcome Message (Arabic)
                    </label>
                    <textarea
                      value={surveyForm.welcomeMessageAr}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, welcomeMessageAr: e.target.value })
                      }
                      placeholder="مثال: نحن نقدر ملاحظاتك. يرجى أخذ لحظة لإكمال هذا الاستبيان."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] resize-none"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Welcome Image (Optional)
                    </label>
                    {surveyForm.welcomeImage ? (
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-lg border-2 border-gray-200 bg-gray-50 p-2">
                          <img
                            src={surveyForm.welcomeImage}
                            alt="Welcome"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          onClick={() => setSurveyForm({ ...surveyForm, welcomeImage: '' })}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'welcomeImage')}
                          className="hidden"
                          id="welcome-image-upload"
                        />
                        <label htmlFor="welcome-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                            <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              Click to upload image
                            </p>
                            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Questions */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                      Survey Questions
                    </h3>
                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-2 px-3 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[13px] font-medium"
                    >
                      <Plus size={16} strokeWidth={2} />
                      Add Question
                    </button>
                  </div>

                  {surveyForm.questions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
                        No questions yet. Click "Add Question" to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {surveyForm.questions.map((question, index) => (
                        <div
                          key={question.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`bg-gray-50 rounded-lg p-3 border-2 transition-all ${
                            dragOverIndex === index && draggedQuestion !== index
                              ? 'border-[#4EBEE3] bg-[#4EBEE3]/5'
                              : 'border-gray-200'
                          } ${draggedQuestion === index ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <button className="mt-2 cursor-move p-1 hover:bg-gray-200 rounded">
                              <GripVertical size={18} className="text-gray-400" strokeWidth={2} />
                            </button>
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[12px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-1.5">
                                    Question {index + 1} (EN)
                                  </label>
                                  <input
                                    type="text"
                                    value={question.questionEn}
                                    onChange={(e) =>
                                      updateQuestion(index, 'questionEn', e.target.value)
                                    }
                                    placeholder="Enter question"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[12px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-1.5">
                                    Question {index + 1} (AR)
                                  </label>
                                  <input
                                    type="text"
                                    value={question.questionAr}
                                    onChange={(e) =>
                                      updateQuestion(index, 'questionAr', e.target.value)
                                    }
                                    placeholder="أدخل السؤال"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                                    dir="rtl"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[12px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-1.5">
                                  Answer Type
                                </label>
                                <select
                                  value={question.answerType}
                                  onChange={(e) => {
                                    const value = e.target.value as Question['answerType'];
                                    updateQuestion(index, 'answerType', value);
                                    if (value !== 'custom') {
                                      updateQuestion(index, 'customOptions', undefined);
                                    }
                                  }}
                                  className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg text-[13px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] appearance-none cursor-pointer bg-white"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 8px center',
                                    backgroundSize: '10px'
                                  }}
                                >
                                  {Object.entries(ANSWER_SCALE_TEMPLATES).map(([key, template]) => (
                                    <option key={key} value={key}>
                                      {template.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Custom Options */}
                              {question.answerType === 'custom' && (
                                <div className="space-y-2 pl-3 border-l-2 border-[#4EBEE3]/30">
                                  <p className="text-[12px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                                    Custom Answer Options
                                  </p>
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <div key={num} className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={
                                          question.customOptions?.[`option${num}En` as keyof typeof question.customOptions] || ''
                                        }
                                        onChange={(e) => {
                                          const customOptions = question.customOptions || {
                                            option1En: '',
                                            option1Ar: '',
                                            option2En: '',
                                            option2Ar: '',
                                            option3En: '',
                                            option3Ar: '',
                                            option4En: '',
                                            option4Ar: '',
                                            option5En: '',
                                            option5Ar: ''
                                          };
                                          updateQuestion(index, 'customOptions', {
                                            ...customOptions,
                                            [`option${num}En`]: e.target.value
                                          });
                                        }}
                                        placeholder={`Option ${num} (EN)`}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                                      />
                                      <input
                                        type="text"
                                        value={
                                          question.customOptions?.[`option${num}Ar` as keyof typeof question.customOptions] || ''
                                        }
                                        onChange={(e) => {
                                          const customOptions = question.customOptions || {
                                            option1En: '',
                                            option1Ar: '',
                                            option2En: '',
                                            option2Ar: '',
                                            option3En: '',
                                            option3Ar: '',
                                            option4En: '',
                                            option4Ar: '',
                                            option5En: '',
                                            option5Ar: ''
                                          };
                                          updateQuestion(index, 'customOptions', {
                                            ...customOptions,
                                            [`option${num}Ar`]: e.target.value
                                          });
                                        }}
                                        placeholder={`الخيار ${num} (AR)`}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                                        dir="rtl"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Preview Options */}
                              {question.answerType !== 'custom' && (
                                <div className="bg-white rounded-lg p-2 border border-gray-200">
                                  <p className="text-[11px] font-medium text-[#0f1729]/70 font-['Poppins',sans-serif] mb-1.5">
                                    Preview:
                                  </p>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {ANSWER_SCALE_TEMPLATES[question.answerType].options.en.map(
                                      (option, i) => (
                                        <div
                                          key={i}
                                          className={`px-2 py-1 rounded text-[11px] font-['Poppins',sans-serif] ${
                                            question.answerType === 'emoji'
                                              ? 'bg-gray-100 text-[16px]'
                                              : 'bg-[#4EBEE3]/10 text-[#0f1729]'
                                          }`}
                                        >
                                          {option}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => deleteQuestion(index)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-red-500" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Thank You Screen */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Thank You Title (English)
                    </label>
                    <input
                      type="text"
                      value={surveyForm.thankYouTitleEn}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, thankYouTitleEn: e.target.value })
                      }
                      placeholder="e.g., Thank You!"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Thank You Title (Arabic)
                    </label>
                    <input
                      type="text"
                      value={surveyForm.thankYouTitleAr}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, thankYouTitleAr: e.target.value })
                      }
                      placeholder="مثال: شكراً لك!"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3]"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Thank You Message (English)
                    </label>
                    <textarea
                      value={surveyForm.thankYouMessageEn}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, thankYouMessageEn: e.target.value })
                      }
                      placeholder="e.g., Your feedback is valuable to us. Thank you for your time!"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Thank You Message (Arabic)
                    </label>
                    <textarea
                      value={surveyForm.thankYouMessageAr}
                      onChange={(e) =>
                        setSurveyForm({ ...surveyForm, thankYouMessageAr: e.target.value })
                      }
                      placeholder="مثال: ملاحظاتك قيمة بالنسبة لنا. شكرا لوقتك!"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/20 focus:border-[#4EBEE3] resize-none"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
                      Thank You Image (Optional)
                    </label>
                    {surveyForm.thankYouImage ? (
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-lg border-2 border-gray-200 bg-gray-50 p-2">
                          <img
                            src={surveyForm.thankYouImage}
                            alt="Thank You"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          onClick={() => setSurveyForm({ ...surveyForm, thankYouImage: '' })}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#4EBEE3] transition-colors cursor-pointer bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'thankYouImage')}
                          className="hidden"
                          id="thankyou-image-upload"
                        />
                        <label htmlFor="thankyou-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center">
                            <Upload size={20} className="text-[#4EBEE3]" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                              Click to upload image
                            </p>
                            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Preview */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  {/* Language Toggle */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewLanguage('en')}
                      className={`px-4 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all ${
                        previewLanguage === 'en'
                          ? 'bg-[#4EBEE3] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setPreviewLanguage('ar')}
                      className={`px-4 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all ${
                        previewLanguage === 'ar'
                          ? 'bg-[#4EBEE3] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
                    <div className="p-8 h-[500px] flex flex-col overflow-hidden">
                    {/* Welcome Screen */}
                    {previewStep === 0 && (
                      <div className="text-center space-y-4 transition-opacity duration-300" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        {surveyForm.welcomeImage && (
                          <div className="w-96 h-72 mx-auto">
                            <img
                              src={surveyForm.welcomeImage}
                              alt="Welcome"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif] mb-2" lang={previewLanguage}>
                            {previewLanguage === 'en' 
                              ? (surveyForm.welcomeTitleEn || 'Welcome!')
                              : (surveyForm.welcomeTitleAr || 'مرحباً!')}
                          </h2>
                          <p className="text-[14px] text-[#0f1729]/70 font-['Poppins',sans-serif] max-w-md mx-auto" lang={previewLanguage}>
                            {previewLanguage === 'en'
                              ? (surveyForm.welcomeMessageEn || 'Please take a moment to complete this survey.')
                              : (surveyForm.welcomeMessageAr || 'يرجى أخذ لحظة لإكمال هذا الاستبيان.')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Questions */}
                    {previewStep > 0 && previewStep <= surveyForm.questions.length && (
                      <div className="space-y-4 transition-opacity duration-300" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="w-96 h-72 mx-auto">
                          <img
                            src={questionIllustration}
                            alt="Question"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-[12px] text-[#0f1729]/60 font-['Poppins',sans-serif] mb-1" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} lang={previewLanguage}>
                            {previewLanguage === 'en' 
                              ? `Question ${previewStep} of ${surveyForm.questions.length}`
                              : `السؤال ${previewStep} من ${surveyForm.questions.length}`}
                          </p>
                          <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif] mb-3" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} lang={previewLanguage}>
                            {previewLanguage === 'en'
                              ? (surveyForm.questions[previewStep - 1]?.questionEn || 'Question text here')
                              : (surveyForm.questions[previewStep - 1]?.questionAr || 'نص السؤال هنا')}
                          </h2>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto min-h-[100px]" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                          {surveyForm.questions[previewStep - 1] &&
                            getAnswerOptions(surveyForm.questions[previewStep - 1])[previewLanguage].map(
                              (option, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setPreviewAnswers({
                                      ...previewAnswers,
                                      [previewStep - 1]: i
                                    });
                                  }}
                                  className={`px-4 py-2 rounded-lg border-2 transition-all text-center ${
                                    previewAnswers[previewStep - 1] === i
                                      ? 'border-[#4EBEE3] bg-[#4EBEE3]/10'
                                      : 'border-gray-200 hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5'
                                  } ${
                                    surveyForm.questions[previewStep - 1].answerType === 'emoji'
                                      ? 'text-[40px] min-w-[90px] min-h-[90px] flex items-center justify-center'
                                      : 'text-[14px] text-[#0f1729] font-["Poppins",sans-serif] min-w-[120px]'
                                  }`}
                                  dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                                  lang={previewLanguage}
                                >
                                  {option}
                                </button>
                              )
                            )}
                        </div>
                      </div>
                    )}

                    {/* Comment Screen */}
                    {previewStep === surveyForm.questions.length + 1 && (
                      <div className="space-y-4 transition-opacity duration-300 max-w-2xl mx-auto" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="text-center space-y-1">
                          <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]" lang={previewLanguage}>
                            {previewLanguage === 'en'
                              ? 'Is there anything else you\'d like to share?'
                              : 'هل هناك أي شيء آخر تود مشاركته؟'}
                          </h2>
                          <p className="text-[13px] text-[#0f1729]/60 font-['Poppins',sans-serif]" lang={previewLanguage}>
                            {previewLanguage === 'en'
                              ? '(Optional)'
                              : '(اختياري)'}
                          </p>
                        </div>
                        <div className="px-6">
                          <textarea
                            value={previewComment}
                            onChange={(e) => {
                              if (e.target.value.length <= 500) {
                                setPreviewComment(e.target.value);
                              }
                            }}
                            placeholder={previewLanguage === 'en' 
                              ? 'Share any additional feedback or concerns here...'
                              : 'شارك أي ملاحظات أو مخاوف إضافية هنا...'}
                            className="w-full h-[120px] px-4 py-3 border-2 border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] text-[#0f1729] placeholder:text-[#0f1729]/40 focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
                            dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                          />
                          <div className="flex justify-between items-center mt-2 px-1">
                            <span className="text-[12px] text-[#0f1729]/50 font-['Poppins',sans-serif]" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} lang={previewLanguage}>
                              {previewComment.length} / 500 {previewLanguage === 'en' ? 'characters' : 'حرف'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thank You Screen */}
                    {previewStep === surveyForm.questions.length + 2 && (
                      <div className="text-center space-y-4 transition-opacity duration-300" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        {surveyForm.thankYouImage && (
                          <div className="w-96 h-72 mx-auto">
                            <img
                              src={surveyForm.thankYouImage}
                              alt="Thank You"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif] mb-2" lang={previewLanguage}>
                            {previewLanguage === 'en'
                              ? (surveyForm.thankYouTitleEn || 'Thank You!')
                              : (surveyForm.thankYouTitleAr || 'شكراً لك!')}
                          </h2>
                          <p className="text-[14px] text-[#0f1729]/70 font-['Poppins',sans-serif] max-w-md mx-auto" lang={previewLanguage}>
                            {previewLanguage === 'en'
                              ? (surveyForm.thankYouMessageEn || 'Your feedback is valuable to us.')
                              : (surveyForm.thankYouMessageAr || 'ملاحظاتك قيمة بالنسبة لنا.')}
                          </p>
                        </div>
                      </div>
                    )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-8 pb-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
                        disabled={previewStep === 0}
                        className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium font-['Poppins',sans-serif] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                        lang={previewLanguage}
                      >
                        <ChevronLeft size={18} strokeWidth={2} />
                        {previewLanguage === 'en' ? 'Previous' : 'السابق'}
                      </button>

                      <div className="flex gap-2">
                        {Array.from(
                          { length: surveyForm.questions.length + 3 },
                          (_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                i === previewStep ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                              }`}
                            />
                          )
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setPreviewStep(
                            Math.min(surveyForm.questions.length + 2, previewStep + 1)
                          )
                        }
                        disabled={previewStep === surveyForm.questions.length + 2}
                        className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium font-['Poppins',sans-serif] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                        lang={previewLanguage}
                      >
                        {previewStep === surveyForm.questions.length + 1 
                          ? (previewLanguage === 'en' ? 'Submit' : 'إرسال')
                          : (previewLanguage === 'en' ? 'Next' : 'التالي')}
                        <ChevronRight size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-[13px] text-amber-800 font-['Poppins',sans-serif]">
                      <strong>Note:</strong> This is a preview of how the survey will appear to
                      patients. Use the navigation buttons to see all screens.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    setShowAddModal(false);
                    resetForm();
                  }
                }}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>

              <div className="flex gap-2">
                {currentStep < 5 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={editingSurvey ? handleEditSurvey : handleAddSurvey}
                    className="px-6 py-2 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
                  >
                    {editingSurvey ? 'Update Survey' : 'Create Survey'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[700px] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 className="text-[20px] text-[#0f1729] font-['Poppins',sans-serif]">
                Survey Preview
              </h2>
              <div className="flex items-center gap-3">
                {/* Language Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewLanguage('en')}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all ${
                      previewLanguage === 'en'
                        ? 'bg-[#4EBEE3] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setPreviewLanguage('ar')}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-all ${
                      previewLanguage === 'ar'
                        ? 'bg-[#4EBEE3] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ع
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewStep(0);
                    setPreviewAnswers({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-6 flex items-center justify-center overflow-hidden">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full h-full flex flex-col">
                <div className="p-10 flex-1 flex flex-col justify-center">
                {/* Welcome Screen */}
                {previewStep === 0 && (
                  <div className="text-center space-y-4 transition-opacity duration-300" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {surveyForm.welcomeImage && (
                      <div className="w-full max-w-md h-56 mx-auto">
                        <img
                          src={surveyForm.welcomeImage}
                          alt="Welcome"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-[26px] text-[#0f1729] font-['Poppins',sans-serif] mb-3" lang={previewLanguage}>
                        {previewLanguage === 'en' 
                          ? (surveyForm.welcomeTitleEn || 'Welcome!')
                          : (surveyForm.welcomeTitleAr || 'مرحباً!')}
                      </h2>
                      <p className="text-[17px] text-[#0f1729]/70 font-['Poppins',sans-serif] max-w-lg mx-auto" lang={previewLanguage}>
                        {previewLanguage === 'en'
                          ? (surveyForm.welcomeMessageEn || 'Please take a moment to complete this survey.')
                          : (surveyForm.welcomeMessageAr || 'يرجى أخذ لحظة لإكمال هذا الاستبيان.')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Questions */}
                {previewStep > 0 && previewStep <= surveyForm.questions.length && (
                  <div className="space-y-6 transition-opacity duration-300" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4EBEE3]/10 mb-2">
                        <span className="text-[28px] text-[#4EBEE3] font-['Poppins',sans-serif]">
                          {previewStep}
                        </span>
                      </div>
                      <p className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} lang={previewLanguage}>
                        {previewLanguage === 'en' 
                          ? `Question ${previewStep} of ${surveyForm.questions.length}`
                          : `السؤال ${previewStep} من ${surveyForm.questions.length}`}
                      </p>
                      <h2 className="text-[28px] text-[#0f1729] font-['Poppins',sans-serif] leading-tight max-w-3xl mx-auto px-8" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} lang={previewLanguage}>
                        {previewLanguage === 'en'
                          ? (surveyForm.questions[previewStep - 1]?.questionEn || 'Question text here')
                          : (surveyForm.questions[previewStep - 1]?.questionAr || 'نص السؤال هنا')}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center mx-auto pt-4 max-w-4xl" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                      {surveyForm.questions[previewStep - 1] &&
                        getAnswerOptions(surveyForm.questions[previewStep - 1])[previewLanguage].map(
                          (option, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setPreviewAnswers({
                                  ...previewAnswers,
                                  [previewStep - 1]: i
                                });
                              }}
                              className={`px-6 py-4 rounded-xl border-2 transition-all text-center shadow-sm hover:shadow-md ${
                                previewAnswers[previewStep - 1] === i
                                  ? 'border-[#4EBEE3] bg-[#4EBEE3]/10 shadow-md'
                                  : 'border-gray-200 hover:border-[#4EBEE3] hover:bg-[#4EBEE3]/5'
                              } ${
                                surveyForm.questions[previewStep - 1].answerType === 'emoji'
                                  ? 'text-[52px] min-w-[115px] min-h-[115px] flex items-center justify-center'
                                  : 'text-[17px] text-[#0f1729] font-["Poppins",sans-serif] min-w-[170px]'
                              }`}
                              dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                              lang={previewLanguage}
                            >
                              {option}
                            </button>
                          )
                        )}
                    </div>
                  </div>
                )}

                {/* Comment Screen */}
                {previewStep === surveyForm.questions.length + 1 && (
                  <div className="space-y-6 transition-opacity duration-300 max-w-3xl mx-auto" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="text-center space-y-2">
                      <h2 className="text-[26px] text-[#0f1729] font-['Poppins',sans-serif]" lang={previewLanguage}>
                        {previewLanguage === 'en'
                          ? 'Is there anything else you\'d like to share?'
                          : 'هل هناك أي شيء آخر تود مشاركته؟'}
                      </h2>
                      <p className="text-[15px] text-[#0f1729]/60 font-['Poppins',sans-serif]" lang={previewLanguage}>
                        {previewLanguage === 'en'
                          ? '(Optional)'
                          : '(اختياري)'}
                      </p>
                    </div>
                    <div className="px-8">
                      <textarea
                        value={previewComment}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setPreviewComment(e.target.value);
                          }
                        }}
                        placeholder={previewLanguage === 'en' 
                          ? 'Share any additional feedback or concerns here...'
                          : 'شارك أي ملاحظات أو مخاوف إضافية هنا...'}
                        className="w-full h-[120px] px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] font-['Poppins',sans-serif] text-[#0f1729] placeholder:text-[#0f1729]/40 focus:outline-none focus:border-[#4EBEE3] transition-colors resize-none"
                        dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                      />
                      <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[13px] text-[#0f1729]/50 font-['Poppins',sans-serif]" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'} lang={previewLanguage}>
                          {previewComment.length} / 500 {previewLanguage === 'en' ? 'characters' : 'حرف'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thank You Screen */}
                {previewStep === surveyForm.questions.length + 2 && (
                  <div className="text-center space-y-4 transition-opacity duration-300" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {surveyForm.thankYouImage && (
                      <div className="w-full max-w-md h-56 mx-auto">
                        <img
                          src={surveyForm.thankYouImage}
                          alt="Thank You"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-[26px] text-[#0f1729] font-['Poppins',sans-serif] mb-3" lang={previewLanguage}>
                        {previewLanguage === 'en'
                          ? (surveyForm.thankYouTitleEn || 'Thank You!')
                          : (surveyForm.thankYouTitleAr || 'شكراً لك!')}
                      </h2>
                      <p className="text-[17px] text-[#0f1729]/70 font-['Poppins',sans-serif] max-w-lg mx-auto" lang={previewLanguage}>
                        {previewLanguage === 'en'
                          ? (surveyForm.thankYouMessageEn || 'Your feedback is valuable to us.')
                          : (surveyForm.thankYouMessageAr || 'ملاحظاتك قيمة بالنسبة لنا.')}
                      </p>
                    </div>
                  </div>
                )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 shrink-0">
                  {previewStep === 0 ? (
                    <div /> 
                  ) : (
                    <button
                      onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
                      className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium font-['Poppins',sans-serif] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors"
                      dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                      lang={previewLanguage}
                    >
                      <ChevronLeft size={18} strokeWidth={2} />
                      {previewLanguage === 'en' ? 'Previous' : 'السابق'}
                    </button>
                  )}

                  <div className="flex gap-2">
                    {Array.from({ length: surveyForm.questions.length + 3 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === previewStep ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {previewStep < surveyForm.questions.length + 2 && (
                    <button
                      onClick={() =>
                        setPreviewStep(
                          Math.min(surveyForm.questions.length + 2, previewStep + 1)
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium font-['Poppins',sans-serif] text-[#4EBEE3] hover:bg-[#4EBEE3]/10 rounded-lg transition-colors"
                      dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}
                      lang={previewLanguage}
                    >
                      {previewStep === surveyForm.questions.length + 1 
                        ? (previewLanguage === 'en' ? 'Submit' : 'إرسال')
                        : (previewLanguage === 'en' ? 'Next' : 'التالي')}
                      <ChevronRight size={18} strokeWidth={2} />
                    </button>
                  )}
                  {previewStep === surveyForm.questions.length + 2 && <div />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-[18px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-2">
              Delete Survey
            </h3>
            <p className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif] mb-6">
              Are you sure you want to delete this survey? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSurveyToDelete(null);
                }}
                className="px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-['Poppins',sans-serif]"
              >
                Cancel
              </button>
              <button
                onClick={() => surveyToDelete && handleDelete(surveyToDelete)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
