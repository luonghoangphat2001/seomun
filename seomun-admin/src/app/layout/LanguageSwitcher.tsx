import { useTranslation } from 'react-i18next';

import { LanguageOption } from '@/app/i18n';
import { AppButton } from '@/components/shared/app-button';
import { cn } from '@/utils/cn';
export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className='border-border flex items-center overflow-hidden rounded-md border'>
      <AppButton
        className={cn(
          'h-8 rounded-none border-none px-3 text-xs font-medium transition-colors',
          i18n.language === LanguageOption.EN
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground bg-transparent',
        )}
        onClick={() => handleLanguageChange(LanguageOption.EN)}
        variant='ghost'
      >
        EN
      </AppButton>
      <AppButton
        className={cn(
          'h-8 rounded-none border-none px-3 text-xs font-medium transition-colors',
          i18n.language === LanguageOption.KO
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground bg-transparent',
        )}
        onClick={() => handleLanguageChange(LanguageOption.KO)}
        variant='ghost'
      >
        KO
      </AppButton>
    </div>
  );
}
