import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadParams } from '../types/uploads/uploads';
import fs from 'fs';
import { File } from 'formidable';
import { Context } from 'koa';
import { ApiError } from '../helpers';
import { UploadToS3Options } from '../middlewares/uploadToS3';
import path from 'path';

const allowedFileTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
];

export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
const UPLOAD_DIR_NORMALIZED = path.posix.normalize(UPLOAD_DIR);

export class UploadsService {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  uploadFileToS3Bucket = async (ctx: Context, options: UploadToS3Options) => {
    if (!ctx.request.files || !ctx.request.files.file) {
      throw new ApiError({
        statusCode: 400,
        message: 'No file uploaded',
      });
    }

    const uploadedFile = Array.isArray(ctx.request.files.file)
      ? ctx.request.files.file[0]
      : ctx.request.files.file;

    if (!allowedFileTypes.includes(uploadedFile.mimetype as string)) {
      throw new ApiError({
        statusCode: 400,
        message: 'File type not allowed',
      });
    }

    if (uploadedFile.size > 10000000) {
      throw new ApiError({
        statusCode: 400,
        message: 'File size should be less then 10Mb',
      });
    }

    try {
      const uploadParams = await this.prepareUploadParams(
        ctx,
        uploadedFile,
        options,
      );

      await this.sendFileToS3(uploadParams);

      const sanitizedFilePath = this.sanitizeFilePath(uploadedFile.filepath);

      const isFilePathInvalid = path
        .relative(UPLOAD_DIR, sanitizedFilePath)
        .startsWith('..');

      if (isFilePathInvalid) {
        throw new ApiError({
          statusCode: 400,
          message: 'Invalid file path',
        });
      }

      fs.unlink(sanitizedFilePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });

      const fileURL = await this.getFileURL(
        'edulab/' + uploadedFile.newFilename,
      );

      return {
        status: 200,
        message: 'File uploaded successfully',
        fileURL,
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw new ApiError({
        statusCode: 500,
        message: 'Internal server error',
      });
    }
  };

  prepareUploadParams = async (
    ctx: Context,
    uploadedFile: File,
    options: UploadToS3Options,
  ): Promise<UploadParams> =>
    new Promise((resolve, reject) => {
      if (!uploadedFile.mimetype?.startsWith('image/')) {
        fs.readFile(uploadedFile.filepath, (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            reject({ status: 500, error: 'Error reading file' });
            throw new ApiError({
              statusCode: 500,
              message: 'Error reading file',
            });
          }

          const buffer = Buffer.from(data);

          const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME! as string,
            Body: buffer,
            Key: ('edulab/' + uploadedFile.newFilename) as string,
            ContentType: uploadedFile.mimetype as string,
            ContentLength: uploadedFile.size,
          };

          resolve(uploadParams);
        });
      } else {
        sharp(uploadedFile.filepath)
          .resize({ width: options.width })
          .jpeg({ quality: options.quality })
          .toBuffer(async (err, data, info) => {
            if (err) {
              console.error('Error processing file with sharp:', err);
              reject({
                status: 500,
                error: 'Error processing file with sharp',
              });
              throw new ApiError({
                statusCode: 500,
                message: 'Error processing file with sharp',
              });
            }

            const uploadParams = {
              Bucket: process.env.AWS_BUCKET_NAME! as string,
              Body: data,
              Key: ('edulab/' + uploadedFile.newFilename) as string,
              ContentType: uploadedFile.mimetype as string,
              ContentLength: info.size,
            };

            resolve(uploadParams);
          });
      }
    });

  sanitizeFilePath(filePath: string): string {
    const sanitizedPath = path.posix.normalize(
      path.resolve(UPLOAD_DIR, filePath),
    );
    const sanitizedPathRelative = path.relative(
      UPLOAD_DIR_NORMALIZED,
      sanitizedPath,
    );

    if (sanitizedPathRelative.startsWith('..')) {
      throw new ApiError({
        statusCode: 400,
        message: 'Invalid file path',
      });
    }

    return sanitizedPath;
  }

  sendFileToS3 = async (uploadParams: UploadParams) =>
    this.s3Client.send(new PutObjectCommand(uploadParams));

  deleteFileFromS3 = async (url: string) => {
    try {
      const key = url.split('/').slice(-1)[0];

      console.log(key);

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: 'edulab/' + key,
      };

      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (e) {
      console.error(e);
    }
  };

  getFileURL = async (key: string) => {
    const fullFileUrl = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      }),
      { expiresIn: 60 }, // 60 seconds
    );

    return fullFileUrl.split('?')[0];
  };
}

export const uploadsService = new UploadsService();
