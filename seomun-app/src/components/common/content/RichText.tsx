import clsx from 'clsx';

import './rich-text.css';

const HTML_TAG = /<\/?[a-z][^>]*>/i;

interface Props {
  content?: string;
  className?: string;
}

export const RichText = ({ content = '', className }: Props) =>
  HTML_TAG.test(content) ? (
    <div className={clsx('rich-text', className)} dangerouslySetInnerHTML={{ __html: content }} />
  ) : (
    <p className={clsx('whitespace-pre-line', className)}>{content}</p>
  );
