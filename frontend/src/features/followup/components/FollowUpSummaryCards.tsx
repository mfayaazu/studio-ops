import React from 'react';
import { Users, AlertCircle, Sparkles, AlertTriangle, IndianRupee } from 'lucide-react';

interface FollowUpSummaryCardsProps {
  leadsInFunnel: number;
  dueTodayCount: number;
  warmLeadsCount: number;
  overdueCount: number;
  estimatedOpenValue: number;
}

export const FollowUpSummaryCards: React.FC<FollowUpSummaryCardsProps> = ({
  leadsInFunnel,
  dueTodayCount,
  warmLeadsCount,
  overdueCount,
  estimatedOpenValue,
}) => {
  const cards = [
    {
      title: 'Leads in Funnel',
      value: leadsInFunnel,
      description: 'Active inquiries / negotiations',
      icon: Users,
      colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Due Today',
      value: dueTodayCount,
      description: 'Pending tasks for today',
      icon: AlertCircle,
      colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:border-sky-500/40',
      iconColor: 'text-sky-400',
    },
    {
      title: 'Warm Leads',
      value: warmLeadsCount,
      description: 'Active client engagement',
      icon: Sparkles,
      colorClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20 hover:border-violet-500/40',
      iconColor: 'text-violet-400',
    },
    {
      title: 'Overdue Follow-ups',
      value: overdueCount,
      description: 'Past due approval tasks',
      icon: AlertTriangle,
      colorClass: overdueCount > 0 
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/25 hover:border-rose-500/50' 
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40',
      iconColor: overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400',
    },
    {
      title: 'Open Funnel Value',
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(estimatedOpenValue),
      description: 'Total estimated deal value',
      icon: IndianRupee,
      colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:border-amber-500/50',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`flex flex-col justify-between p-5 bg-[#0d1424] border rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${card.colorClass}`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg bg-slate-900/60 border border-slate-800 ${card.iconColor}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                {card.value}
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
