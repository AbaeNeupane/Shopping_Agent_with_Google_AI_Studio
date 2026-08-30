import React from 'react';
import { WorkflowStage } from '../types';
import { 
  FileText, 
  ListCheck, 
  SlidersHorizontal, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface StageProgressBarProps {
  currentStage: WorkflowStage;
  onSelectStage: (stage: WorkflowStage) => void;
  hasPlan: boolean;
}

interface StageStep {
  id: WorkflowStage;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const STAGES: StageStep[] = [
  {
    id: 'define',
    number: 1,
    title: 'Define Event',
    subtitle: '7 Party Factors',
    icon: FileText,
  },
  {
    id: 'review',
    number: 2,
    title: 'Review Plan',
    subtitle: '6 Supermarket Aisles',
    icon: ListCheck,
  },
  {
    id: 'refine',
    number: 3,
    title: 'Refine & Balance',
    subtitle: 'Adjust Items & Budget',
    icon: SlidersHorizontal,
  },
  {
    id: 'finalize',
    number: 4,
    title: 'Finalize & Reserve',
    subtitle: 'Curbside or Delivery',
    icon: CheckCircle2,
  },
];

export const StageProgressBar: React.FC<StageProgressBarProps> = ({
  currentStage,
  onSelectStage,
  hasPlan,
}) => {
  const stageOrder: WorkflowStage[] = ['define', 'review', 'refine', 'finalize'];
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/90 p-2.5 sm:p-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
        {STAGES.map((step, idx) => {
          const isCurrent = step.id === currentStage;
          const isPassed = currentIndex > idx;
          const isDisabled = !hasPlan && idx > 0 && currentStage === 'define';
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => !isDisabled && onSelectStage(step.id)}
                disabled={isDisabled}
                className={`flex-1 flex items-center p-2 sm:p-2.5 rounded-xl transition-all text-left relative overflow-hidden group ${
                  isCurrent
                    ? 'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white shadow-sm ring-1 ring-stone-900/10'
                    : isPassed
                    ? 'bg-stone-50 hover:bg-stone-100/80 border border-stone-200/80 cursor-pointer text-stone-800'
                    : isDisabled
                    ? 'opacity-40 cursor-not-allowed border border-transparent text-stone-400'
                    : 'hover:bg-stone-50 border border-transparent cursor-pointer text-stone-600'
                }`}
              >
                {/* Active Glowing Indicator */}
                {isCurrent && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-amber-400/10 rounded-full blur-lg pointer-events-none" />
                )}

                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mr-2 sm:mr-3 transition-all ${
                    isCurrent
                      ? 'bg-amber-400 text-stone-950 font-mono-num font-bold shadow-xs'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                </div>

                <div className="min-w-0 hidden md:block">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isCurrent
                          ? 'text-white'
                          : isPassed
                          ? 'text-stone-900'
                          : 'text-stone-600'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <div
                    className={`text-3xs truncate ${
                      isCurrent ? 'text-stone-300 font-medium' : 'text-stone-400'
                    }`}
                  >
                    {step.subtitle}
                  </div>
                </div>

                <div className="md:hidden">
                  <span
                    className={`text-2xs font-bold truncate ${
                      isCurrent ? 'text-white' : 'text-stone-700'
                    }`}
                  >
                    Stage {step.number}
                  </span>
                </div>
              </button>

              {idx < STAGES.length - 1 && (
                <div className="hidden lg:flex items-center text-stone-300 px-0.5">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
