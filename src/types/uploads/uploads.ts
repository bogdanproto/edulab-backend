export type UploadParams = {
  Bucket: string;
  Body: Buffer;
  Key: string;
  ContentType: string;
  ContentLength: number;
};
