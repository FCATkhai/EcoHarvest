// import dotenv from 'dotenv'
// import { NextFunction, Response, Request } from 'express'
// import { IUploadRequest } from '@backend/@types/dbInterfaces'
// import multer from 'multer'
// import fs from 'fs'
// import path from 'path'

//test upload to supabase storage
// import { supabaseAdmin } from './db/authAdmin'
// import fs from 'fs'
// const file = fs.createReadStream('D:/DaiHoc/NLN/EcoHarvest/backend/src/test-image.jpg')
// supabaseAdmin.storage
//     .from('product-images')
//     .upload('test-image.jpg', file, { cacheControl: '3600', upsert: true })
//     .then((response) => {
//         console.log('Upload response:', response)
//     })

//test download from supabase storage
// supabaseAdmin.storage
//     .from('product-images')
//     .download('test-image.jpg')
//     .then(({ data, error }) => {
//         if (error) {
//             console.error('Error downloading file:', error)
//             return
//         }
//         if (data) {
//             const url = URL.createObjectURL(data)
//             console.log('Downloaded file URL:', String(url))
//             console.log(data)
//         }
//     })

// dotenv.config()

// const uploadDir = path.join(__dirname, 'uploads')
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true })
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir) // Temporary storage folder
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`) // Unique filename
//     }
// })
// const upload = multer({ storage })

// const cloudinaryUploadImage = async (
//     filePath: string,
//     folderName: string,
//     transformationOptions: { width: number; height: number; crop: string } = {
//         width: 1000,
//         height: 1000,
//         crop: 'limit'
//     }
// ) => {
//     return await cloudinary.uploader.upload(filePath, {
//         folder: `ZippyFood/${folderName}`,
//         resource_type: 'auto',
//         transformation: [transformationOptions]
//     })
// }

// // Middleware to upload a single image
// // before upload must declare upload.single('file') in route and folderName in req
// // uploaded image url will be stored in req.file.path
// const uploadImageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//     //@ts-ignore
//     const uploadReq = req as IUploadRequest
//     try {
//         if (uploadReq.file) {
//             const filePath = uploadReq.file.path
//             const folderName = uploadReq.folderName || 'default'
//             const transformationOptions = uploadReq.transformationOptions || {
//                 width: 1000,
//                 height: 1000,
//                 crop: 'limit'
//             }
//             const uploader = (path: string) => cloudinaryUploadImage(path, folderName, transformationOptions)
//             const uploadResult = await uploader(filePath)
//             fs.unlinkSync(filePath)
//             uploadReq.file.path = uploadResult.secure_url
//         }
//         next()
//     } catch (error) {
//         next(error)
//     }
// }

// // Middleware to upload multiple images
// // before upload must declare upload.fields([...]) in route and folderName in req,
// // transformationOptions is optional
// // example: paste to app.ts
// // import { upload, uploadMultipleImagesMiddleware } from './middleware/upload';

// // const uploadFields = upload.fields([
// //     { name: 'avatar', maxCount: 1 }, // Single avatar image
// //     { name: 'cover', maxCount: 1 },  // Single cover image
// //     // Add more fields as needed, e.g., { name: 'gallery', maxCount: 10 }
// // ]);
// // import { Response, NextFunction } from 'express';
// // import { IUploadRequest } from './config/interface';
// // app.post('/upload/profile', (req: IUploadRequest, res: Response, next: NextFunction) => {
// //     req.folderName = 'profile_pics';
// //     next();
// // }, uploadFields, uploadMultipleImagesMiddleware, (req: IUploadRequest, res: Response) => {
// //     console.log(req.files);
// //     console.log(req.imageUrls);
// //     if (req.imageUrls) {
// //         res.json({ imageUrls: req.imageUrls });
// //     } else {
// //         res.status(400).json({ error: 'No images provided' });
// //     }
// // });
// // app.post('/upload', (req: IUploadRequest, res: Response, next: NextFunction) => {
// //     req.folderName = req.body.folderName || req.query.folderName || 'default';
// //     next();
// //   }, uploadFields, uploadImagesMiddleware, (req: IUploadRequest, res: Response) => {
// //     if (req.imageUrls) {
// //       res.json({ imageUrls: req.imageUrls });
// //     } else {
// //       res.status(400).json({ error: 'No images provided' });
// //     }
// //   });

// const uploadMultipleImagesMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     //@ts-ignore
//     const uploadReq = req as IUploadRequest
//     try {
//         const folderName = uploadReq.folderName || 'default'
//         const uploader = (filePath: string) => cloudinaryUploadImage(filePath, folderName)

//         if (uploadReq.files && typeof uploadReq.files === 'object') {
//             const uploadPromises: Promise<{ fieldname: string; url: string }>[] = []

//             // Iterate over each field name (e.g., 'avatar', 'cover')
//             for (const fieldname in uploadReq.files) {
//                 console.log('fieldname: ', fieldname)

//                 const files = uploadReq.files[fieldname] // Array of files for this field
//                 files.forEach((file) => {
//                     uploadPromises.push(
//                         uploader(file.path).then((uploadResult) => {
//                             // Cleanup after upload
//                             fs.unlinkSync(file.path)
//                             return { fieldname, url: uploadResult.secure_url }
//                         })
//                     )
//                 })
//             }

//             const results = await Promise.all(uploadPromises)
//             uploadReq.imageUrls = {}
//             for (const { fieldname, url } of results) {
//                 uploadReq.imageUrls[fieldname] = url
//             }
//         }

//         next()
//     } catch (error) {
//         // Cleanup on error
//         if (uploadReq.files && typeof uploadReq.files === 'object') {
//             for (const fieldname in uploadReq.files) {
//                 const files = uploadReq.files[fieldname]
//                 files.map((file) => fs.unlinkSync(file.path))
//             }
//         }
//         next(error)
//     }
// }

// // req.files example:
// // [Object: null prototype] {
// //     avatar: [
// //       {
// //         fieldname: 'avatar',
// //         originalname: 'Screenshot 2025-01-15 122542.jpg',
// //         encoding: '7bit',
// //         mimetype: 'image/jpeg',
// //         destination: './uploads/',
// //         filename: '1741342926241-Screenshot 2025-01-15 122542.jpg',
// //         path: 'uploads\\1741342926241-Screenshot 2025-01-15 122542.jpg',
// //         size: 92840
// //       }
// //     ],
// //     cover: [
// //       {
// //         fieldname: 'cover',
// //         originalname: 'Screenshot 2025-01-06 131907.jpg',
// //         encoding: '7bit',
// //         mimetype: 'image/jpeg',
// //         destination: './uploads/',
// //         filename: '1741342926243-Screenshot 2025-01-06 131907.jpg',
// //         path: 'uploads\\1741342926243-Screenshot 2025-01-06 131907.jpg',
// //         size: 23804
// //       }
// //     ]
// //   }

// const extractPublicID = (url: string) => {
//     const urlParts = url.split('/')
//     const lastPart = urlParts.pop()

//     const lastDotIndex = lastPart?.lastIndexOf('.')
//     if (lastDotIndex === -1) return null // Ensure a valid format

//     const publicID = lastPart?.substring(0, lastDotIndex)

//     return urlParts.slice(7).join('/') + '/' + publicID
// }

// const deleteImage = async (link: string = '') => {
//     if (link != '') {
//         const publicID = extractPublicID(link)
//         if (publicID === null) {
//             console.error('Error: Lỗi không tìm được publicID')
//             return
//         }
//         const { result } = await cloudinary.uploader.destroy(publicID)
//         if (result !== 'ok') {
//             console.error('Error: Lỗi khi xoá ảnh')
//         }
//     } else {
//         console.error('không có link khi xoá ảnh')
//     }
// }

// export { upload, uploadImageMiddleware, uploadMultipleImagesMiddleware, deleteImage }
