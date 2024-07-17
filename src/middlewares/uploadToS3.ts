import { Context, Next } from 'koa';
import { uploadsService } from '../services/uploads.service';

export interface UploadToS3Options {
	fieldName: string;
	width?: number;
	quality?: number;
}

export interface RequestBody {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const uploadToS3 =
  (options: UploadToS3Options) => async (ctx: Context, next: Next) => {

    if (!ctx.request.files || !ctx.request.files.file) {
      await next();
      return;
    }

    const uploadResult = await uploadsService.uploadFileToS3Bucket(ctx, options);

    const requestBody: RequestBody = ctx.request.body || {};
    requestBody[options.fieldName] = uploadResult.fileURL;

    await next();
  };

export default uploadToS3;
