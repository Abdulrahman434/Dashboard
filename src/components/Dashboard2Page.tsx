import { useState, useEffect } from 'react';
import { Monitor, Users, Bell, Package, TrendingUp, Activity, AlertCircle, CheckCircle, Clock, Utensils, MessageSquare, Tv, Smartphone, WifiOff, Wifi, ChevronUp, ChevronDown, ArrowUpRight, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mock data for the dashboard
const deviceStatusData = [
  { name: 'Online', value: 847, color: '#10b981' },
  { name: 'Disconnected', value: 23, color: '#ef4444' },
  { name: 'Idle', value: 130, color: '#f59e0b' }
];

const engagementTrendData = [
  { time: '00:00', sessions: 120, requests: 45 },
  { time: '04:00', sessions: 80, requests: 20 },
  { time: '08:00', sessions: 340, requests: 180 },
  { time: '12:00', sessions: 520, requests: 280 },
  { time: '16:00', sessions: 480, requests: 240 },
  { time: '20:00', sessions: 390, requests: 160 },
  { time: '23:59', sessions: 220, requests: 90 }
];

const serviceRequestsData = [
  { service: 'Food Order', count: 342, trend: 12 },
  { service: 'Room Service', count: 218, trend: -5 },
  { service: 'Nurse Call', count: 156, trend: 8 },
  { service: 'Feedback', count: 89, trend: 15 },
  { service: 'TV Support', count: 67, trend: -2 }
];

const topContentData = [
  { name: 'Games', views: 2847, hours: 1234 },
  { name: 'Live TV', views: 2456, hours: 3891 },
  { name: 'Movies', views: 1923, hours: 2156 },
  { name: 'Reading', views: 1456, hours: 892 },
  { name: 'Music', views: 1234, hours: 456 }
];

const recentActivityData = [
  { id: 1, type: 'service', icon: Utensils, message: 'Food order from Room 302-A', time: '2 min ago', status: 'pending' },
  { id: 2, type: 'device', icon: Monitor, message: 'Device MT15-447 went offline', time: '5 min ago', status: 'critical' },
  { id: 3, type: 'feedback', icon: MessageSquare, message: 'New 5-star feedback from Sara Saleh', time: '12 min ago', status: 'success' },
  { id: 4, type: 'notification', icon: Bell, message: 'Notification sent to 234 patients', time: '18 min ago', status: 'info' },
  { id: 5, type: 'service', icon: Activity, message: 'Room service completed - Room 401-B', time: '25 min ago', status: 'success' }
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
}

function MetricCard({ title, value, change, icon: Icon, iconBg, iconColor, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mb-1">{title}</p>
          <h3 className="text-[28px] text-[#0f1729] font-['Poppins',sans-serif] mb-1">{value}</h3>
          {subtitle && (
            <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ChevronUp size={16} className="text-green-500" />
              ) : (
                <ChevronDown size={16} className="text-red-500" />
              )}
              <span className={`text-[12px] font-medium font-['Poppins',sans-serif] ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}% vs last week
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard2Page() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-[#4EBEE3]" />
            </div>
            <div>
              <h1 className="text-[24px] text-[#0f1729] font-['Poppins',sans-serif]">
                Executive Dashboard
              </h1>
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                Real-time insights & key performance metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-[18px] text-[#0f1729] font-medium font-['Poppins',sans-serif]">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] transition-colors ${
                  timeRange === range
                    ? 'bg-[#4EBEE3] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Patients"
              value="847"
              change={8.2}
              icon={Users}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              subtitle="Currently using terminals"
            />
            <MetricCard
              title="Devices Online"
              value="847/1000"
              change={-2.1}
              icon={Monitor}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              subtitle="84.7% availability"
            />
            <MetricCard
              title="Pending Requests"
              value="37"
              change={-12.5}
              icon={Clock}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              subtitle="Avg. response: 4.2 min"
            />
            <MetricCard
              title="Satisfaction Score"
              value="4.2"
              change={5.3}
              icon={MessageSquare}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              subtitle="Based on 450 feedbacks"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[16px] text-[#0f1729] font-medium font-['Poppins',sans-serif]">
                    Patient Engagement Trend
                  </h2>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                    Active sessions & service requests over 24 hours
                  </p>
                </div>
              </div>
              <div className="h-[280px] min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                  <AreaChart data={engagementTrendData}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4EBEE3" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4EBEE3" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontFamily: 'Poppins, sans-serif'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="sessions" stroke="#4EBEE3" fillOpacity={1} fill="url(#colorSessions)" name="Active Sessions" />
                    <Area type="monotone" dataKey="requests" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRequests)" name="Service Requests" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device Status Pie Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-[16px] text-[#0f1729] font-medium font-['Poppins',sans-serif]">
                  Device Status
                </h2>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                  Real-time terminal health
                </p>
              </div>
              <div className="h-[200px] min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontFamily: 'Poppins, sans-serif'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {deviceStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[12px] text-gray-700 font-['Poppins',sans-serif]">{item.name}</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Requests & Top Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Requests */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[16px] text-[#0f1729] font-medium font-['Poppins',sans-serif]">
                    Service Requests (Today)
                  </h2>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                    Most requested patient services
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {serviceRequestsData.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        {service.service === 'Food Order' && <Utensils size={18} className="text-[#4EBEE3]" />}
                        {service.service === 'Room Service' && <Package size={18} className="text-[#4EBEE3]" />}
                        {service.service === 'Nurse Call' && <Bell size={18} className="text-[#4EBEE3]" />}
                        {service.service === 'Feedback' && <MessageSquare size={18} className="text-[#4EBEE3]" />}
                        {service.service === 'TV Support' && <Tv size={18} className="text-[#4EBEE3]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                          {service.service}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {service.trend >= 0 ? (
                            <TrendingUp size={12} className="text-green-500" />
                          ) : (
                            <ChevronDown size={12} className="text-red-500" />
                          )}
                          <span className={`text-[11px] font-['Poppins',sans-serif] ${service.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {service.trend >= 0 ? '+' : ''}{service.trend}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[18px] font-medium text-[#0f1729] font-['Poppins',sans-serif]">
                        {service.count}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[16px] text-[#0f1729] font-medium font-['Poppins',sans-serif]">
                    Top Content Categories
                  </h2>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                    Most engaging patient entertainment
                  </p>
                </div>
              </div>
              <div className="h-[280px] min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                  <BarChart data={topContentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif' }} />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: '12px', fontFamily: 'Poppins, sans-serif' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontFamily: 'Poppins, sans-serif'
                      }} 
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px' }} />
                    <Bar dataKey="views" fill="#4EBEE3" name="Views" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="hours" fill="#8b5cf6" name="Hours Watched" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[16px] text-[#0f1729] font-medium font-['Poppins',sans-serif]">
                    Recent Activity
                  </h2>
                  <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                    Real-time system events
                  </p>
                </div>
                <button className="text-[13px] text-[#4EBEE3] font-medium font-['Poppins',sans-serif] hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentActivityData.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'critical' ? 'bg-red-100' :
                        activity.status === 'success' ? 'bg-green-100' :
                        activity.status === 'pending' ? 'bg-orange-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon size={18} className={
                          activity.status === 'critical' ? 'text-red-600' :
                          activity.status === 'success' ? 'text-green-600' :
                          activity.status === 'pending' ? 'text-orange-600' :
                          'text-blue-600'
                        } />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#0f1729] font-['Poppins',sans-serif]">
                          {activity.message}
                        </p>
                        <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats & Alerts */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-[16px] text-[#0f1729] font-medium font-['Poppins',sans-serif]">
                  System Health
                </h2>
                <p className="text-[12px] text-gray-500 font-['Poppins',sans-serif]">
                  Critical alerts & warnings
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-red-900 font-['Poppins',sans-serif]">
                        23 Devices Disconnected
                      </p>
                      <p className="text-[11px] text-red-700 font-['Poppins',sans-serif] mt-1">
                        Requires immediate attention
                      </p>
                      <button className="text-[11px] text-red-600 font-medium font-['Poppins',sans-serif] mt-2 hover:underline">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-orange-900 font-['Poppins',sans-serif]">
                        12 Pending Food Orders
                      </p>
                      <p className="text-[11px] text-orange-700 font-['Poppins',sans-serif] mt-1">
                        Avg wait time: 8 minutes
                      </p>
                      <button className="text-[11px] text-orange-600 font-medium font-['Poppins',sans-serif] mt-2 hover:underline">
                        View Queue →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-green-900 font-['Poppins',sans-serif]">
                        All Services Operational
                      </p>
                      <p className="text-[11px] text-green-700 font-['Poppins',sans-serif] mt-1">
                        99.8% uptime this week
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-gray-600 font-['Poppins',sans-serif]">Network Status</span>
                    <Wifi size={16} className="text-green-500" />
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '98%' }} />
                  </div>
                  <p className="text-[11px] text-gray-500 font-['Poppins',sans-serif] mt-1">
                    98% devices connected
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}