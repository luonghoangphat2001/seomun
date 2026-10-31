'use client';

import { optionsTabContent } from '@/constants/web-editor';
import { EditorTabType, ObjectType } from '@/enums/editor';
import { useWebEditorStore } from '@/hooks';
import { Left } from '@/icons';
import { cn } from '@/lib/utils';
import { ImageObject, ShapeObject, TextObject } from '@/types';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { CommonProperties } from './properties/CommonProperties';
import { ImageProperties } from './properties/ImageProperties';
import { ShapeProperties } from './properties/ShapeProperties';
import { TextProperties } from './properties/TextProperties';
import { BackgroundTab } from './sidebar/BackgroundTab';
import { ImageTab } from './sidebar/ImageTab';
import { ShapeTab } from './sidebar/ShapeTab';
import { TemplateTab } from './sidebar/TemplateTab';
import { TextTab } from './sidebar/TextTab';
import { ToolbarMobile } from './ToolbarMobile';

export const SidebarEditor = () => {
  const t = useTranslations('editor');

  const {
    getSelectedObject,
    updateObject,
    deleteObject,
    updateText,
    updateShape,
    updateImage,
    selectObject,
    activeTab,
    setActiveTab,
    isSheetExpanded,
    setIsSheetExpanded,
    setIsGridView,
    templates,
  } = useWebEditorStore();
  const selectedObject = getSelectedObject();

  const renderTabContent = () => {
    if (selectedObject) {
      return (
        <div className='flex flex-col gap-6'>
          <div className='flex cursor-pointer items-center gap-3' onClick={() => selectObject(null)}>
            <Left className='size-4' />
            <h3 className='title-18 text-text-main font-bold'>{t('properties')}</h3>
          </div>

          {selectedObject.type === ObjectType.TEXT && (
            <TextProperties object={selectedObject as TextObject} updateText={updateText} />
          )}
          {selectedObject.type === ObjectType.IMAGE && (
            <ImageProperties object={selectedObject as ImageObject} updateImage={updateImage} />
          )}
          {selectedObject.type === ObjectType.SHAPE && (
            <ShapeProperties object={selectedObject as ShapeObject} updateShape={updateShape} />
          )}

          <CommonProperties
            object={selectedObject}
            onUpdate={(updates) => updateObject(selectedObject.id, updates)}
            onDelete={() => deleteObject(selectedObject.id)}
          />
        </div>
      );
    }

    switch (activeTab) {
      case EditorTabType.TEMPLATE:
        return <TemplateTab templates={templates} />;
      case EditorTabType.IMAGE:
        return <ImageTab />;
      case EditorTabType.TEXT:
        return <TextTab />;
      case EditorTabType.BACKGROUND:
        return <BackgroundTab />;
      case EditorTabType.SHAPE:
        return <ShapeTab />;
      default:
        return null;
    }
  };

  return (
    <div className='border-border-soft z-20 flex h-auto w-full flex-col border-r bg-white max-md:fixed max-md:bottom-0 md:h-full md:w-auto md:flex-row'>
      {/* Mobile Bottom Sheet Overlay */}
      <AnimatePresence>
        {(activeTab || selectedObject) && (
          <>
            {isSheetExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSheetExpanded(false)}
                className='fixed inset-0 z-40 bg-black/20 md:hidden'
              />
            )}

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: isSheetExpanded ? 0 : 'calc(100% - 30px)' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag='y'
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 50) setIsSheetExpanded(false);
                else if (info.offset.y < -50) setIsSheetExpanded(true);
              }}
              className='fixed inset-x-0 bottom-45 z-50 overflow-hidden md:hidden'>
              <div className='border-border-soft flex max-h-[calc(100dvh-242px)] flex-col rounded-t-[16px] border-t bg-white'>
                <div
                  className='flex cursor-grab justify-center p-3 active:cursor-grabbing'
                  onClick={() => {
                    setIsGridView(false);
                    setIsSheetExpanded(!isSheetExpanded);
                  }}>
                  <div className='h-1.5 w-12 rounded-full bg-gray-300' />
                </div>
                <div className='flex-1 overflow-y-auto px-4 pb-6'>{renderTabContent()}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ToolbarMobile />

      <div className='md:border-border-soft relative z-50 flex w-full items-center bg-white md:w-[80px] md:shrink-0 md:flex-col md:border-r'>
        {optionsTabContent.map((tab) => {
          const isActive = activeTab === tab.label;
          const Icon = tab.icon;
          return (
            <div
              key={tab.label}
              onClick={() => {
                if (isActive) {
                  setIsSheetExpanded(!isSheetExpanded);
                } else {
                  setIsGridView(false);
                  setActiveTab(tab.label);
                  selectObject(null);
                  setIsSheetExpanded(true);
                }
              }}
              className={cn(
                'md:border-border-soft flex h-30 w-full flex-col items-center justify-center gap-3 transition-colors max-md:flex-1 md:border-b',
                isActive ? 'text-text-brand bg-primary-50 title-14' : 'body-14 cursor-pointer hover:bg-gray-50',
              )}>
              <Icon className='size-8' />
              <span>{t(tab.label)}</span>
            </div>
          );
        })}
      </div>

      <div className='scrollbar-thin hidden h-[calc(100dvh-73px)] shrink-0 overflow-y-auto bg-white md:block md:w-[200px] md:p-3 lg:w-[356px] lg:p-6'>
        {renderTabContent()}
      </div>
    </div>
  );
};
