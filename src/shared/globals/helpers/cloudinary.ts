import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export function upload(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean) {
  return new Promise<UploadApiErrorResponse | UploadApiResponse | undefined>((resolve, _) => {
    cloudinary.v2.uploader.upload(file, { public_id, overwrite, invalidate }, (error, result) => {
      if (error) {
        resolve(error);
      } else {
        resolve(result);
      }
    });
  });
}
