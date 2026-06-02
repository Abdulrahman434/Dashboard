import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Download, Calendar, Star, ChevronDown, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-[11px] font-['Poppins',sans-serif]" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
}

// Generate mock response data
const generateMockResponses = (surveys: Survey[]): SurveyResponse[] => {
  const responses: SurveyResponse[] = [];
  const now = new Date();
  
  // Weighted rating generator to achieve 4.2 average
  // Distribution: 54% 5-star, 28% 4-star, 11% 3-star, 4% 2-star, 3% 1-star
  const getWeightedRating = (): number => {
    const rand = Math.random() * 100;
    if (rand < 54) return 5;
    if (rand < 82) return 4;
    if (rand < 93) return 3;
    if (rand < 97) return 2;
    return 1;
  };
  
  surveys.forEach((survey) => {
    // Generate 50-150 responses per survey
    const responseCount = Math.floor(Math.random() * 100) + 50;
    
    for (let i = 0; i < responseCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const completedDate = new Date(now);
      completedDate.setDate(completedDate.getDate() - daysAgo);
      
      // Generate optional comment (30% chance)
      const mockComments = [
        'The staff was very caring and professional. Thank you for the excellent service!',
        'Room was clean but a bit noisy at night. Overall good experience.',
        'Food quality could be improved, but medical care was outstanding.',
        'Very satisfied with everything. The nurses were especially helpful.',
        'Wait times were a bit long, but staff was apologetic and kind.',
        'Excellent facility and caring staff. Would recommend to others.',
        'The doctor explained everything clearly. Very reassuring experience.',
        '',
        '',
        ''
      ];
      const comment = mockComments[Math.floor(Math.random() * mockComments.length)];
      
      responses.push({
        id: `${survey.id}-response-${i}`,
        surveyId: survey.id,
        surveyName: survey.nameEn,
        answers: survey.questions.map((q) => ({
          questionId: q.id,
          questionText: q.questionEn,
          answer: getWeightedRating() // Use weighted rating instead of random
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

export default function FeedbackReportPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const [showSurveyDropdown, setShowSurveyDropdown] = useState(false);

  // Load surveys and generate mock responses
  useEffect(() => {
    const saved = localStorage.getItem('feedback-surveys');
    let loadedSurveys: Survey[] = [];
    
    if (saved) {
      try {
        const parsedSurveys = JSON.parse(saved);
        loadedSurveys = parsedSurveys;
      } catch (e) {
        console.error('Error loading surveys:', e);
        loadedSurveys = [];
      }
    }
    
    // Set surveys (even if empty array)
    setSurveys(loadedSurveys);
    
    // Generate mock responses only if there are surveys
    if (loadedSurveys.length > 0) {
      const mockResponses = generateMockResponses(loadedSurveys);
      setResponses(mockResponses);
    } else {
      setResponses([]);
    }
  }, []);

  // Filter responses based on selected survey and date
  const filteredResponses = responses.filter((response) => {
    // Survey filter
    if (selectedSurveyId !== 'all' && response.surveyId !== selectedSurveyId) {
      return false;
    }
    
    // Date filter
    const responseDate = new Date(response.completedAt);
    const now = new Date();
    const daysAgo = (now.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dateRange === '7' && daysAgo > 7) return false;
    if (dateRange === '30' && daysAgo > 30) return false;
    if (dateRange === '90' && daysAgo > 90) return false;
    
    return true;
  });

  // Calculate metrics
  const totalResponses = filteredResponses.length;
  const averageScore = filteredResponses.length > 0
    ? filteredResponses.reduce((sum, r) => {
        const avg = r.answers.reduce((s, a) => s + a.answer, 0) / r.answers.length;
        return sum + avg;
      }, 0) / filteredResponses.length
    : 0;
  
  const completionRate = 85; // Mock data
  const avgCompletionTime = 2.5; // Mock data in minutes

  // Get selected survey
  const selectedSurvey = selectedSurveyId === 'all' 
    ? null 
    : surveys.find(s => s.id === selectedSurveyId);

  // Helper function to get answer labels based on question type
  const getAnswerLabel = (question: Question, rating: number): string => {
    switch (question.answerType) {
      case 'satisfaction':
        const satisfactionLabels = ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];
        return satisfactionLabels[rating - 1] || `${rating}`;
      case 'quality':
        const qualityLabels = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
        return qualityLabels[rating - 1] || `${rating}`;
      case 'agreement':
        const agreementLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        return agreementLabels[rating - 1] || `${rating}`;
      case 'frequency':
        const frequencyLabels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
        return frequencyLabels[rating - 1] || `${rating}`;
      case 'emoji':
        const emojiLabels = ['😞 Very Unhappy', '😕 Unhappy', '😐 Neutral', '🙂 Happy', '😄 Very Happy'];
        return emojiLabels[rating - 1] || `${rating}`;
      case 'custom':
        if (question.customOptions) {
          const customLabels = [
            question.customOptions.option1En,
            question.customOptions.option2En,
            question.customOptions.option3En,
            question.customOptions.option4En,
            question.customOptions.option5En
          ];
          return customLabels[rating - 1] || `${rating}`;
        }
        return `${rating}`;
      default:
        return `${rating}`;
    }
  };

  // Calculate question-level analytics
  const questionAnalytics = selectedSurvey
    ? selectedSurvey.questions.map((question) => {
        const relevantResponses = filteredResponses.filter(r => r.surveyId === selectedSurvey.id);
        const answers = relevantResponses.flatMap(r => 
          r.answers.filter(a => a.questionId === question.id).map(a => a.answer)
        );
        
        const average = answers.length > 0
          ? answers.reduce((sum, a) => sum + a, 0) / answers.length
          : 0;
        
        // Distribution of answers with proper labels
        const distribution = [1, 2, 3, 4, 5].map(rating => ({
          rating,
          label: getAnswerLabel(question, rating),
          count: answers.filter(a => a === rating).length
        }));
        
        return {
          question,
          average,
          totalAnswers: answers.length,
          distribution
        };
      })
    : [];

  // Response trend data (last 30 days)
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayResponses = filteredResponses.filter(r => {
      const responseDate = new Date(r.completedAt).toISOString().split('T')[0];
      return responseDate === dateStr;
    });
    
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      responses: dayResponses.length,
      avgScore: dayResponses.length > 0
        ? dayResponses.reduce((sum, r) => {
            const avg = r.answers.reduce((s, a) => s + a.answer, 0) / r.answers.length;
            return sum + avg;
          }, 0) / dayResponses.length
        : 0
    };
  });

  // Patient type distribution
  const patientTypeData = ['Kids', 'Adults', 'VIP'].map(type => ({
    name: type,
    value: filteredResponses.filter(r => r.patientType === type).length
  }));

  const COLORS = ['#4EBEE3', '#16274D', '#9CA3AF'];

  // Score distribution for all responses
  const scoreDistribution = [1, 2, 3, 4, 5].map(score => ({
    score: `${score} Star${score > 1 ? 's' : ''}`,
    count: filteredResponses.filter(r => {
      const avg = r.answers.reduce((s, a) => s + a.answer, 0) / r.answers.length;
      return Math.round(avg) === score;
    }).length
  }));

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      survey: selectedSurvey?.nameEn || 'All Surveys',
      dateRange: dateRange,
      totalResponses,
      averageScore,
      responses: filteredResponses
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-8">
      <div>
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <PieChartIcon size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Survey Report
              </h1>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Detailed analytics and insights from patient feedback surveys
              </p>
            </div>
          </div>

          {/* Filters and Export - Moved to Header */}
          <div className="flex items-center gap-3">
            {/* Survey Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSurveyDropdown(!showSurveyDropdown);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-200"
              >
                <span className="text-[14px] text-[#16274D] font-medium font-['Poppins',sans-serif]">
                  {selectedSurveyId === 'all' 
                    ? 'All Surveys' 
                    : surveys.find(s => s.id === selectedSurveyId)?.nameEn || 'Select Survey'}
                </span>
                <ChevronDown size={16} className="text-gray-600" strokeWidth={2} />
              </button>

              {showSurveyDropdown && (
                <div className="absolute top-full mt-2 left-0 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 min-w-[250px] max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedSurveyId('all');
                      setShowSurveyDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedSurveyId === 'all' ? 'bg-[#4EBEE3]/10' : ''
                    }`}
                  >
                    <div className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                      All Surveys
                    </div>
                    <div className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                      Combined analytics from all surveys
                    </div>
                  </button>
                  {surveys.map((survey) => (
                    <button
                      key={survey.id}
                      onClick={() => {
                        setSelectedSurveyId(survey.id);
                        setShowSurveyDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedSurveyId === survey.id ? 'bg-[#4EBEE3]/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          {survey.nameEn}
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium font-['Poppins',sans-serif] ${
                          survey.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {survey.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2.5 pr-10 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '12px'
              }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
            >
              <Download size={16} strokeWidth={2} />
              Export Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="text-[12px] text-green-600 font-medium bg-green-50 px-2 py-1 rounded font-['Poppins',sans-serif]">
                +12%
              </div>
            </div>
            <div className="text-[32px] font-['Poppins',sans-serif] text-[#0f1729] mb-1">
              {totalResponses}
            </div>
            <div className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
              Total Responses
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="text-[12px] text-green-600 font-medium bg-green-50 px-2 py-1 rounded font-['Poppins',sans-serif]">
                +0.3
              </div>
            </div>
            <div className="text-[32px] font-['Poppins',sans-serif] text-[#0f1729] mb-1">
              {averageScore.toFixed(1)}
            </div>
            <div className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
              Average Score
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="text-[12px] text-green-600 font-medium bg-green-50 px-2 py-1 rounded font-['Poppins',sans-serif]">
                +5%
              </div>
            </div>
            <div className="text-[32px] font-['Poppins',sans-serif] text-[#0f1729] mb-1">
              {completionRate}%
            </div>
            <div className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
              Completion Rate
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-[#4EBEE3]" strokeWidth={2} />
              </div>
              <div className="text-[12px] text-green-600 font-medium bg-green-50 px-2 py-1 rounded font-['Poppins',sans-serif]">
                -0.2m
              </div>
            </div>
            <div className="text-[32px] font-['Poppins',sans-serif] text-[#0f1729] mb-1">
              {avgCompletionTime}m
            </div>
            <div className="text-[14px] text-[#0f1729]/60 font-['Poppins',sans-serif]">
              Avg. Time
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Response Trend */}
          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6">
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-6">
              Response Trend (Last 30 Days)
            </h3>
            <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend 
                  wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="responses" 
                  stroke="#4EBEE3" 
                  strokeWidth={3}
                  dot={{ fill: '#4EBEE3', r: 4 }}
                  name="Responses"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#16274D" 
                  strokeWidth={3}
                  dot={{ fill: '#16274D', r: 4 }}
                  name="Avg Score"
                  isAnimationActive={true}
                  animationBegin={200}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Type Distribution */}
          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6">
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-6">
              Responses by Patient Type
            </h3>
            <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
              <PieChart>
                <Pie
                  data={patientTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {patientTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6 mb-6">
          <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-6">
            Overall Score Distribution
          </h3>
          <div className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
            <BarChart 
              data={scoreDistribution}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.5} vertical={false} />
              <XAxis 
                dataKey="score" 
                tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#16274D', fontFamily: 'Poppins, sans-serif' }}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar 
                dataKey="count" 
                fill="#4EBEE3" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={60}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
                onMouseEnter={(data, index, e) => {
                  const bar = e.target;
                  bar.setAttribute('fill', '#3DA5CA');
                }}
                onMouseLeave={(data, index, e) => {
                  const bar = e.target;
                  bar.setAttribute('fill', '#4EBEE3');
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>

        {/* Question-Level Analytics (only when a specific survey is selected) */}
        {selectedSurvey && questionAnalytics.length > 0 && (
          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-6">
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-6">
              Question-Level Analytics: {selectedSurvey.nameEn}
            </h3>
            
            <div className="space-y-6">
              {questionAnalytics.map((qa, index) => (
                <div key={qa.question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 bg-[#4EBEE3]/10 text-[#4EBEE3] rounded-lg flex items-center justify-center text-[14px] font-medium font-['Poppins',sans-serif]">
                          {index + 1}
                        </span>
                        <h4 className="text-[16px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                          {qa.question.questionEn}
                        </h4>
                      </div>
                      <p className="text-[13px] text-gray-500 font-['Poppins',sans-serif] ml-11">
                        {qa.totalAnswers} responses
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-[28px] font-['Poppins',sans-serif] text-[#0f1729]">
                        {qa.average.toFixed(1)}
                      </div>
                      <div className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
                        Average Score
                      </div>
                    </div>
                  </div>
                  
                  {/* Answer Distribution */}
                  <div className="ml-11 space-y-2">
                    {qa.distribution.map((dist) => {
                      const percentage = qa.totalAnswers > 0 
                        ? (dist.count / qa.totalAnswers) * 100 
                        : 0;
                      
                      return (
                        <div key={dist.rating} className="flex items-center gap-3">
                          <div className="w-40 text-[13px] text-gray-600 font-['Poppins',sans-serif] flex-shrink-0">
                            {dist.label}
                          </div>
                          <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                            <div 
                              className="h-full bg-[#4EBEE3] transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-end px-3">
                              <span className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                                {dist.count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {surveys.length === 0 && (
          <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={32} className="text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="text-[17px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
              No Survey Data Available
            </h3>
            <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">
              Create surveys in the Feedback Manager to start collecting responses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}