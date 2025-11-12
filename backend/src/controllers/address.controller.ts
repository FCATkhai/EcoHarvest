import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/client'
import { addresses } from '../db/schema/addresses.schema'
import { eq } from 'drizzle-orm'

/**
 * @route POST api/addresses
 * @desc Tạo địa chỉ mới cho user
 * @access Private
 */
export async function createAddress(req: Request, res: Response, next: NextFunction) {
    try {
        const { label, province, ward, detailAddress } = req.body
        const userId = req.user.id

        const [newAddress] = await db
            .insert(addresses)
            .values({
                userId,
                label,
                province,
                ward,
                detailAddress
            })
            .returning()

        res.status(201).json({ success: true, message: 'Địa chỉ tạo thành công', data: newAddress })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route GET /addresses/:userId
 * @desc Lấy danh sách địa chỉ của user
 * @access Private
 */
export async function getAddressesByUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.params
        if (!userId) return res.status(400).json({ error: 'Thiếu userId' })

        const result = await db.select().from(addresses).where(eq(addresses.userId, userId))
        res.json({ success: true, message: 'Lấy danh sách địa chỉ thành công', data: result })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route PUT/PATCH /addresses/:id
 * @desc Cập nhật địa chỉ
 * @access Private
 */
export async function updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params
        const { label, province, ward, detailAddress } = req.body

        const [updated] = await db
            .update(addresses)
            .set({
                label,
                province,
                ward,
                detailAddress,
                updatedAt: new Date()
            })
            .where(eq(addresses.id, Number(id)))
            .returning()

        if (!updated) return res.status(404).json({ error: 'Không tìm thấy địa chỉ' })

        res.json({ success: true, message: 'Cập nhật địa chỉ thành công', data: updated })
    } catch (error: unknown) {
        next(error)
    }
}

/**
 * @route DELETE /addresses/:id
 * @desc Xóa địa chỉ
 * @access Private
 */
export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params

        const deleted = await db
            .delete(addresses)
            .where(eq(addresses.id, Number(id)))
            .returning()
        if (!deleted.length) return res.status(404).json({ error: 'Không tìm thấy địa chỉ' })

        res.status(204).json({ success: true, message: 'Xóa địa chỉ thành công' })
    } catch (error: unknown) {
        next(error)
    }
}
