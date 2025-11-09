import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/client'
import { roles } from '../db/schema'

/**
 *  Lấy danh sách role
 *  @route GET /api/roles
 *  @access Admin
 */
export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const allRoles = await db.select().from(roles)
        res.status(200).json({ success: true, data: allRoles })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 *  Tạo role mới
 *  @route POST /api/roles
 *  @access Admin
 */
export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name } = req.body
        const [newRole] = await db.insert(roles).values({ name }).returning()
        res.status(201).json({ success: true, data: newRole })
    } catch (error: unknown) {
        next(error)
    }
}
