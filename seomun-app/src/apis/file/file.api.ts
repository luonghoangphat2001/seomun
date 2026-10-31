import { api } from '@/config';
import { BaseResponse } from '@/types';
import { UploadFileREQ } from './file.request';
import { FileRespsonse } from './file.response';

export const FileApi = {
  upload: (body: UploadFileREQ) => {
    const formData = new FormData();
    formData.append('type', body.type);
    formData.append('file', body.file);

    return api.post<BaseResponse<FileRespsonse>>('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
