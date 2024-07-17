import { Context } from 'koa';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '../services/uploads.service';

export default function unlinkUploadsOnError(ctx: Context) {

  const uploadedFile = Array.isArray(ctx.request.files?.file)
    ? ctx.request.files?.file[0]
    : ctx.request.files?.file;

  if (uploadedFile) {

    const sanitizedFilePath = path.join(UPLOAD_DIR, path.basename(uploadedFile.filepath));

    fs.unlink(sanitizedFilePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
  }
}
