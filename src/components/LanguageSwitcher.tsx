
import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Language } from '@/i18n/translations';

interface LanguageSwitcherProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`flex items-center gap-2 ${className}`}>
          <Languages size={16} />
          <span>{t('common', 'language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage(Language.ARABIC)}
          className={language === Language.ARABIC ? 'bg-primary/10 font-bold' : ''}
        >
          {t('common', 'arabic')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage(Language.ENGLISH)}
          className={language === Language.ENGLISH ? 'bg-primary/10 font-bold' : ''}
        >
          {t('common', 'english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
