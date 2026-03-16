import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/hooks';
import { selectUsername } from '@/store/selectors/authSelectors';
import { cn } from '@/lib/utils';

type Tab = 'report' | 'invoice';

interface ReportInvoiceSwitcherProps {
  activeTab: Tab;
}

const activeStyles = 'text-[#2183A8] border-b-2 border-[#2183A8]';
const inactiveStyles = 'text-[#A8A8A8] border-b-2 border-[#A8A8A8]';

const ReportInvoiceSwitcher: React.FC<ReportInvoiceSwitcherProps> = ({
  activeTab,
}) => {
  const username = useAppSelector(selectUsername);
  const baseReportUrl = `/tg_bot_add?username=${username || ''}`;

  return (
    <div className="flex max-w-7xl mx-auto px-4 pt-4 gap-4">
      <Link
        to={baseReportUrl}
        className={cn(
          'no-underline pb-2 border-b-2 inline-block text-center min-w-[4rem]',
          activeTab === 'report' ? activeStyles : inactiveStyles
        )}
      >
        Операции
      </Link>
      <Link
        to="/tg_bot_add/invoice"
        className={cn(
          'no-underline pb-2 border-b-2 inline-block text-center min-w-[4rem]',
          activeTab === 'invoice' ? activeStyles : inactiveStyles
        )}
      >
        Счёт
      </Link>
    </div>
  );
};

export default ReportInvoiceSwitcher;
