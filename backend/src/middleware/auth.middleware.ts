import type { Request, Response, NextFunction } from 'express'
import { USER_ROLES } from '@backend/constants/userRoles'
import { auth } from '../utils/auth'

const toFetchHeaders = (h: Record<string, string | string[] | undefined>) => {
    const headers = new Headers()
    for (const [k, v] of Object.entries(h)) {
        if (v == null) continue
        headers.set(k, Array.isArray(v) ? v.join(', ') : v)
    }
    return headers
}

// Middleware xác thực + kiểm tra quyền truy cập dựa trên role
// nếu mảng allowRoles là [] nghĩa là tất cả user đã đăng nhập có quyền truy cập
export const authorize =
    (allowedRoles: string[] = []) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Lấy session từ Better Auth
            const session = await auth.api.getSession({ headers: toFetchHeaders(req.headers) })

            if (!session) {
                return res.status(401).json({ error: 'Unauthorized: invalid or missing session' })
            }
            req.user = session.user
            // req.access_token = session.sessionToken

            // Nếu có danh sách role cho phép → kiểm tra
            if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
                return res.status(403).json({ error: 'Forbidden: insufficient role' })
            }

            next()
        } catch (error) {
            console.error('Authorize error:', error)
            return res.status(401).json({ error: 'Unauthorized: session invalid' })
        }
    }

// chỉ allow admin hoặc chính chủ (dựa vào id trong query param hoặc params)
// chỉ dùng cho các route có id trong params hoặc query
export const ownershipAuthorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestUserId = req.query.id || req.params.id || req.params.userId || req.query.userId

        if (!requestUserId) {
            return res.status(400).json({ error: 'Missing user id in params or query' })
        }

        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: no user in request' })
        }

        // chỉ admin hoặc chính chủ được phép
        const isAdmin = req.user.role === USER_ROLES.ADMIN
        const isOwner = req.user.id === requestUserId

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Access denied: insufficient permissions' })
        }

        next()
    } catch (error) {
        console.error('Ownership check error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
