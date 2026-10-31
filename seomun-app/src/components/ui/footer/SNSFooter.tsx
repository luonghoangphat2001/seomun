import { BLOG_LINK, INSTAGRAM_LINK, KAKAO_LINK } from '@/constants/common';
import { Instagram, Kakao, NaverBlog } from '@/icons';

const SNSFooter = () => {
  return (
    <div className='flex items-center gap-4'>
      <a
        href={INSTAGRAM_LINK}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Instagram'
        className='cursor-pointer hover:opacity-80'>
        <Instagram className='size-8' />
      </a>
      <a
        href={KAKAO_LINK}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Kakao'
        className='cursor-pointer hover:opacity-80'>
        <Kakao className='size-8' />
      </a>
      <a
        href={BLOG_LINK}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Naver Blog'
        className='cursor-pointer hover:opacity-80'>
        <NaverBlog className='h-8 w-9.5' />
      </a>
    </div>
  );
};

export default SNSFooter;
