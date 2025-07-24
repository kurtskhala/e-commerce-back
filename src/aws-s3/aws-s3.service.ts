import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class AwsS3Service {
  private readonly bucketName: string;
  private readonly s3: S3Client;

  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME!;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION;

    if (!accessKeyId || !secretAccessKey || !region || !this.bucketName) {
      throw new Error(
        'AWS credentials, region, or bucket name are not defined',
      );
    }

    this.s3 = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    });
  }

  async uploadImage(
    filePath: string,
    file: Buffer | Uint8Array | string,
  ): Promise<string> {
    if (!filePath || !file) {
      throw new BadRequestException('File path or file is missing');
    }

    const config = {
      Key: filePath,
      Bucket: this.bucketName,
      Body: file,
    };

    const uploadCommand = new PutObjectCommand(config);
    await this.s3.send(uploadCommand);
    return filePath;
  }

  async getImageByFileId(fileId: string): Promise<string | undefined> {
    if (!fileId) {
      throw new BadRequestException('File id is missing');
    }

    const config = {
      Bucket: this.bucketName,
      Key: fileId,
    };

    const command = new GetObjectCommand(config);
    const fileStream: GetObjectCommandOutput = await this.s3.send(command);

    if (fileStream.Body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of fileStream.Body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const fileBuffer = Buffer.concat(chunks);
      const base64 = fileBuffer.toString('base64');
      const file = `data:${fileStream.ContentType || 'application/octet-stream'};base64,${base64}`;
      return file;
    }

    return undefined;
  }

  async deleteImageByFileId(fileId: string): Promise<string> {
    console.log(fileId, 'fileId');
    if (!fileId) {
      throw new BadRequestException('File id is missing');
    }

    const config = {
      Bucket: this.bucketName,
      Key: fileId,
    };

    const command = new DeleteObjectCommand(config);
    await this.s3.send(command);

    return `deleted ${fileId}`;
  }
}
