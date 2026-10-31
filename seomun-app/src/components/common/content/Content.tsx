import './content.css';

type ContentProps = {
  html: string;
};

const Content = ({ html }: ContentProps) => {
  return <div className='policy-wrapper' dangerouslySetInnerHTML={{ __html: html }} />;
};

export default Content;
