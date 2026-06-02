import { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, Eye, Download, Calendar, Star, MessageSquare, ChevronDown, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import TablePagination from './TablePagination';

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

interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyName: string;
  answers: { questionId: string; answer: number; questionText: string }[];
  comment?: string;
  completedAt: string;
  roomNumber?: string;
  patientType?: string;
  patientId?: string; // Changed from patientName to patientId (MRN format)
}

// Generate mock response data
const generateMockResponses = (surveys: Survey[]): SurveyResponse[] => {
  const responses: SurveyResponse[] = [];
  const now = new Date();
  
  surveys.forEach((survey) => {
    // Generate 80-120 responses per survey
    const responseCount = Math.floor(Math.random() * 40) + 80;
    
    for (let i = 0; i < responseCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const completedDate = new Date(now);
      completedDate.setDate(completedDate.getDate() - daysAgo);
      
      // Generate MRN (Medical Record Number) - Format: MRN followed by 7 digits
      const mrnNumber = Math.floor(1000000 + Math.random() * 9000000);
      const patientId = `MRN${mrnNumber}`;
      
      // Generate optional comment (35% chance)
      const mockComments = [
        'The staff was very caring and professional. Thank you for the excellent service!',
        'Room was clean but a bit noisy at night. Overall good experience.',
        'Food quality could be improved, but medical care was outstanding.',
        'Very satisfied with everything. The nurses were especially helpful.',
        'Wait times were a bit long, but staff was apologetic and kind.',
        'Excellent facility and caring staff. Would recommend to others.',
        'The doctor explained everything clearly. Very reassuring experience.',
        'Physical therapy team was amazing. They helped me recover quickly.',
        'Parking was difficult to find, but everything else was great.',
        'Registration process was smooth. Staff at reception were friendly.',
        '',
        '',
        '',
        '',
        ''
      ];
      const comment = mockComments[Math.floor(Math.random() * mockComments.length)];
      
      responses.push({
        id: `${survey.id}-response-${i}`,
        surveyId: survey.id,
        surveyName: survey.nameEn,
        patientId: patientId,
        answers: survey.questions.map((q) => ({
          questionId: q.id,
          questionText: q.questionEn,
          answer: Math.floor(Math.random() * 5) + 1 // 1-5 rating
        })),
        comment: comment || undefined,
        completedAt: completedDate.toISOString(),
        roomNumber: `${Math.floor(Math.random() * 500) + 100}`,
        patientType: ['Kids', 'Adults', 'VIP'][Math.floor(Math.random() * 3)]
      });
    }
  });
  
  return responses;
};

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

export default function SurveyResponsesPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<SurveyResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [showSurveyDropdown, setShowSurveyDropdown] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortColumn, setSortColumn] = useState<'patient' | 'survey' | 'date' | 'rating' | 'room' | 'type' | 'comment' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load surveys and generate responses
  useEffect(() => {
    const saved = localStorage.getItem('feedback-surveys');
    let loadedSurveys: Survey[] = [];
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        loadedSurveys = parsed;
      } catch (e) {
        console.error('Failed to load surveys:', e);
        loadedSurveys = [];
      }
    }
    
    // Set surveys (even if empty array)
    setSurveys(loadedSurveys);
    
    // Generate mock responses only if there are surveys
    if (loadedSurveys.length > 0) {
      const mockResponses = generateMockResponses(loadedSurveys);
      setResponses(mockResponses);
      setFilteredResponses(mockResponses);
    } else {
      setResponses([]);
      setFilteredResponses([]);
    }
  }, []);

  // Filter responses
  useEffect(() => {
    let filtered = responses;

    // Filter by survey
    if (selectedSurvey !== 'all') {
      filtered = filtered.filter(r => r.surveyId === selectedSurvey);
    }

    // Filter by rating
    if (selectedRating !== 'all') {
      const ratingThreshold = parseInt(selectedRating);
      filtered = filtered.filter(r => {
        const avgRating = r.answers.reduce((sum, a) => sum + a.answer, 0) / r.answers.length;
        return Math.round(avgRating) === ratingThreshold;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(r =>
        r.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.surveyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResponses(filtered);
    setCurrentPage(1);
  }, [selectedSurvey, selectedRating, searchQuery, responses]);

  // Calculate average rating for a response
  const getAverageRating = (response: SurveyResponse) => {
    const avg = response.answers.reduce((sum, a) => sum + a.answer, 0) / response.answers.length;
    return avg.toFixed(1);
  };

  // Get rating stars
  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={i < fullStars ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-gray-300'}
          strokeWidth={2}
        />
      );
    }
    return stars;
  };

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Apply sorting
  const sortedResponses = [...filteredResponses].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortColumn) {
      case 'patient':
        return multiplier * ((a.patientId || '').localeCompare(b.patientId || ''));
      case 'survey':
        return multiplier * a.surveyName.localeCompare(b.surveyName);
      case 'date':
        return multiplier * (new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
      case 'rating': {
        const ratingA = a.answers.reduce((sum, ans) => sum + ans.answer, 0) / a.answers.length;
        const ratingB = b.answers.reduce((sum, ans) => sum + ans.answer, 0) / b.answers.length;
        return multiplier * (ratingA - ratingB);
      }
      case 'room':
        return multiplier * (parseInt(a.roomNumber || '0') - parseInt(b.roomNumber || '0'));
      case 'type':
        return multiplier * ((a.patientType || '').localeCompare(b.patientType || ''));
      case 'comment':
        return multiplier * ((a.comment || '').localeCompare(b.comment || ''));
      default:
        return 0;
    }
  });
  
  const currentResponses = sortedResponses.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get survey for response
  const getSurveyForResponse = (response: SurveyResponse) => {
    return surveys.find(s => s.id === response.surveyId);
  };

  // Get answer text
  const getAnswerText = (answer: { questionId: string; answer: number; questionText: string }, survey: Survey | undefined) => {
    if (!survey) return `Rating: ${answer.answer}`;
    
    const question = survey.questions.find(q => q.id === answer.questionId);
    if (!question) return `Rating: ${answer.answer}`;
    
    const answerType = question.answerType;
    const options = ANSWER_SCALE_TEMPLATES[answerType].options.en;
    
    return options[answer.answer - 1] || `Rating: ${answer.answer}`;
  };

  return (
    <div className="flex-1 bg-white overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10">
            <ClipboardList size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Survey Responses
            </h1>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              View and analyze individual patient survey submissions
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f1729]/40" strokeWidth={2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by MRN, room, or survey..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[14px] font-['Poppins',sans-serif] text-[#0f1729] placeholder:text-[#0f1729]/40 focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>
            </div>

            {/* Survey Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSurveyDropdown(!showSurveyDropdown);
                  setShowRatingDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[14px] font-medium font-['Poppins',sans-serif] text-[#0f1729] hover:border-[#4EBEE3] transition-colors"
              >
                <Filter size={16} strokeWidth={2} />
                <span>{selectedSurvey === 'all' ? 'All Surveys' : surveys.find(s => s.id === selectedSurvey)?.nameEn}</span>
                <ChevronDown size={16} strokeWidth={2} />
              </button>

              {showSurveyDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedSurvey('all');
                        setShowSurveyDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[14px] font-['Poppins',sans-serif] transition-colors ${
                        selectedSurvey === 'all'
                          ? 'bg-[#4EBEE3]/10 text-[#4EBEE3]'
                          : 'text-[#0f1729] hover:bg-gray-100'
                      }`}
                    >
                      All Surveys
                    </button>
                    {surveys.map(survey => (
                      <button
                        key={survey.id}
                        onClick={() => {
                          setSelectedSurvey(survey.id);
                          setShowSurveyDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[14px] font-['Poppins',sans-serif] transition-colors ${
                          selectedSurvey === survey.id
                            ? 'bg-[#4EBEE3]/10 text-[#4EBEE3]'
                            : 'text-[#0f1729] hover:bg-gray-100'
                        }`}
                      >
                        {survey.nameEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRatingDropdown(!showRatingDropdown);
                  setShowSurveyDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[14px] font-medium font-['Poppins',sans-serif] text-[#0f1729] hover:border-[#4EBEE3] transition-colors"
              >
                <Star size={16} strokeWidth={2} />
                <span>{selectedRating === 'all' ? 'All Ratings' : `${selectedRating} Stars`}</span>
                <ChevronDown size={16} strokeWidth={2} />
              </button>

              {showRatingDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedRating('all');
                        setShowRatingDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[14px] font-['Poppins',sans-serif] transition-colors ${
                        selectedRating === 'all'
                          ? 'bg-[#4EBEE3]/10 text-[#4EBEE3]'
                          : 'text-[#0f1729] hover:bg-gray-100'
                      }`}
                    >
                      All Ratings
                    </button>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => {
                          setSelectedRating(rating.toString());
                          setShowRatingDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[14px] font-['Poppins',sans-serif] transition-colors ${
                          selectedRating === rating.toString()
                            ? 'bg-[#4EBEE3]/10 text-[#4EBEE3]'
                            : 'text-[#0f1729] hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getRatingStars(rating)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
              {filteredResponses.length} {filteredResponses.length === 1 ? 'response' : 'responses'}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  className="text-left px-6 py-3 cursor-pointer"
                  onClick={() => {
                    setSortColumn('patient');
                    setSortDirection(sortColumn === 'patient' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    <span>Patient</span>
                    <ArrowUpDown size={14} className={sortColumn === 'patient' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 cursor-pointer"
                  onClick={() => {
                    setSortColumn('survey');
                    setSortDirection(sortColumn === 'survey' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    <span>Survey</span>
                    <ArrowUpDown size={14} className={sortColumn === 'survey' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 cursor-pointer"
                  onClick={() => {
                    setSortColumn('date');
                    setSortDirection(sortColumn === 'date' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    <span>Date</span>
                    <ArrowUpDown size={14} className={sortColumn === 'date' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 cursor-pointer"
                  onClick={() => {
                    setSortColumn('rating');
                    setSortDirection(sortColumn === 'rating' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    <span>Rating</span>
                    <ArrowUpDown size={14} className={sortColumn === 'rating' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 cursor-pointer"
                  onClick={() => {
                    setSortColumn('room');
                    setSortDirection(sortColumn === 'room' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    <span>Room</span>
                    <ArrowUpDown size={14} className={sortColumn === 'room' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 cursor-pointer"
                  onClick={() => {
                    setSortColumn('type');
                    setSortDirection(sortColumn === 'type' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    <span>Type</span>
                    <ArrowUpDown size={14} className={sortColumn === 'type' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-3 cursor-pointer"
                  onClick={() => {
                    setSortColumn('comment');
                    setSortDirection(sortColumn === 'comment' && sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                    <span>Comment</span>
                    <ArrowUpDown size={14} className={sortColumn === 'comment' ? 'text-[#4ebee3]' : 'text-gray-400'} />
                  </div>
                </th>
                <th className="text-right px-6 py-3 text-[13px] font-medium text-[#0f1729]/60 font-['Poppins',sans-serif]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentResponses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList size={40} className="text-gray-300" strokeWidth={1.5} />
                      <p className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
                        No responses found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentResponses.map(response => {
                  const avgRating = parseFloat(getAverageRating(response));
                  return (
                    <tr key={response.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                          {response.patientId || 'Anonymous'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif]">
                          {response.surveyName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#0f1729]/70 font-['Poppins',sans-serif]">
                          {formatDate(response.completedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {getRatingStars(avgRating)}
                          </div>
                          <span className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                            {avgRating}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#0f1729]/70 font-['Poppins',sans-serif]">
                          {response.roomNumber || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-[12px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                          {response.patientType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {response.comment ? (
                          <div className="flex items-center gap-1 text-[#4EBEE3]">
                            <MessageSquare size={16} strokeWidth={2} />
                            <span className="text-[13px] font-medium font-['Poppins',sans-serif]">Yes</span>
                          </div>
                        ) : (
                          <span className="text-[13px] text-[#0f1729]/40 font-['Poppins',sans-serif]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedResponse(response)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} className="text-[#0f1729]/60" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredResponses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="responses"
              showRowsPerPage={false}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-[18px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                  Response Details
                </h3>
                <p className="text-[13px] text-[#0f1729]/60 font-['Poppins',sans-serif] mt-0.5">
                  {selectedResponse.patientId || 'Anonymous'} • {formatDateTime(selectedResponse.completedAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#0f1729]/60" strokeWidth={2} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12px] text-[#0f1729]/60 font-['Poppins',sans-serif] mb-1">Survey</p>
                      <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                        {selectedResponse.surveyName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#0f1729]/60 font-['Poppins',sans-serif] mb-1">Overall Rating</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {getRatingStars(parseFloat(getAverageRating(selectedResponse)))}
                        </div>
                        <span className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                          {getAverageRating(selectedResponse)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#0f1729]/60 font-['Poppins',sans-serif] mb-1">Room Number</p>
                      <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                        {selectedResponse.roomNumber || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-[#0f1729]/60 font-['Poppins',sans-serif] mb-1">Patient Type</p>
                      <p className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                        {selectedResponse.patientType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                <div>
                  <h4 className="text-[16px] font-medium text-[#0f1729] font-['Poppins',sans-serif] mb-3">
                    Question Responses
                  </h4>
                  <div className="space-y-3">
                    {selectedResponse.answers.map((answer, index) => {
                      const survey = getSurveyForResponse(selectedResponse);
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <p className="text-[13px] text-[#0f1729]/80 font-['Poppins',sans-serif] mb-2">
                            {answer.questionText}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {getRatingStars(answer.answer)}
                            </div>
                            <span className="text-[14px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                              {getAnswerText(answer, survey)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Section - Highlighted */}
                {selectedResponse.comment && (
                  <div className="bg-[#4EBEE3]/5 border-2 border-[#4EBEE3]/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={18} className="text-[#4EBEE3]" strokeWidth={2} />
                      <h4 className="text-[16px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                        Additional Comment
                      </h4>
                    </div>
                    <p className="text-[14px] text-[#0f1729]/80 font-['Poppins',sans-serif] leading-relaxed">
                      {selectedResponse.comment}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 bg-[#4EBEE3] hover:bg-[#3da9cc] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}