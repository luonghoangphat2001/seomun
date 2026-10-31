export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToBlob = (base64: string | File, mimeType = 'image/jpeg') => {
  if (base64 instanceof File) return base64;

  const byteString = atob(base64.split(',')[1]);
  const bytes = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
};

export const transformToUrl = (file: File | string): string => {
  if (typeof file === 'string') return file;
  return URL.createObjectURL(file);
};

export const transformUrltoFile = async (url: string | File): Promise<File> => {
  if (url instanceof File) return url;
  try {
    const response = await fetch(url, { cache: 'no-store' });

    const blob = await response.blob();

    // Decode file name from URL
    const nameFromUrl = decodeURIComponent(url.split('/').pop() || 'file');

    // Determine file type
    const type = blob.type || 'application/octet-stream';

    return new File([blob], nameFromUrl, { type });
  } catch (error) {
    throw new Error(`Failed to fetch file from URL: ${error}`);
  }
};

export const handleFileDownload = async (url: string, fileName?: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || url.split('/').pop() || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Failed to download file:', error);
  }
};

export const handleBlobDownload = (blob: Blob, fileName = 'file') => {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};
