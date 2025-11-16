import { Request } from 'express'
import { Multer } from 'multer'
export interface IUploadRequest extends Request {
    file?: Express.Multer.File
    files?: { [fieldname: string]: Express.Multer.File[] }
    imageUrls?: Record<string, string>
    bucketName: string
}
