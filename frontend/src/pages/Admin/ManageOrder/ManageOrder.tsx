//TODO: update behavior filter, current filter make order count wrong

import { useState } from 'react'
import useOrders, { useOrder } from '@/hooks/useOrder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
    Package,
    Eye,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Calendar,
    MapPin,
    CreditCard,
    Search,
    Filter
} from 'lucide-react'
import { ORDER_STATUS, PAYMENT_STATUS, type OrderStatus } from '@/constants/order'
import type { Order } from '@/types/schema.type'
import PlaceHolderProduct from '@/assets/placeholder-product.svg'
import toast from 'react-hot-toast'

export default function ManageOrder() {
    const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [sortBy] = useState<'created_at' | 'updated_at'>('created_at')
    const [sortOrder] = useState<'asc' | 'desc'>('desc')

    const {
        orders,
        total,
        isLoading,
        updateOrderStatus,
        updatePaymentStatus,
        deleteOrder,
        updatingStatus,
        updatingPayment,
        deleting,
        refetch
    } = useOrders({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        order_status: filterStatus !== 'all' ? filterStatus : undefined,
        sort_by: sortBy,
        sort: sortOrder
    })

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const { orderDetails } = useOrder(selectedOrderId || undefined)

    // Dialog states
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Form states
    const [orderToUpdate, setOrderToUpdate] = useState<Order | null>(null)
    const [newStatus, setNewStatus] = useState<string>('')
    const [newPaymentStatus, setNewPaymentStatus] = useState<string>('')
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Number(amount))
    }

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getOrderStatusBadge = (status: string) => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return (
                    <Badge variant='outline' className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        Chờ xác nhận
                    </Badge>
                )
            case ORDER_STATUS.PROCESSING:
                return (
                    <Badge variant='secondary' className='flex items-center gap-1'>
                        <Package className='h-3 w-3' />
                        Đang xử lý
                    </Badge>
                )
            case ORDER_STATUS.SHIPPED:
                return (
                    <Badge variant='default' className='flex items-center gap-1 bg-blue-500'>
                        <Truck className='h-3 w-3' />
                        Đang giao
                    </Badge>
                )
            case ORDER_STATUS.COMPLETED:
                return (
                    <Badge variant='default' className='flex items-center gap-1 bg-green-500'>
                        <CheckCircle2 className='h-3 w-3' />
                        Hoàn thành
                    </Badge>
                )
            case ORDER_STATUS.CANCELLED:
                return (
                    <Badge variant='destructive' className='flex items-center gap-1'>
                        <XCircle className='h-3 w-3' />
                        Đã hủy
                    </Badge>
                )
            default:
                return <Badge variant='outline'>{status}</Badge>
        }
    }

    const getPaymentStatusBadge = (status?: string) => {
        if (!status) return null
        switch (status) {
            case PAYMENT_STATUS.PAID:
                return <Badge className='bg-green-500'>Đã thanh toán</Badge>
            case PAYMENT_STATUS.UNPAID:
                return <Badge variant='outline'>Chưa thanh toán</Badge>
            case PAYMENT_STATUS.FAILED:
                return <Badge variant='destructive'>Thanh toán thất bại</Badge>
            case PAYMENT_STATUS.REFUNDED:
                return <Badge variant='secondary'>Đã hoàn tiền</Badge>
            default:
                return <Badge variant='outline'>{status}</Badge>
        }
    }

    const openDetailDialog = (orderId: string) => {
        setSelectedOrderId(orderId)
        setDetailDialogOpen(true)
    }

    const openStatusDialog = (order: Order) => {
        setOrderToUpdate(order)
        setNewStatus(order.status)
        setStatusDialogOpen(true)
    }

    const openPaymentDialog = (order: Order) => {
        setOrderToUpdate(order)
        setNewPaymentStatus('')
        setPaymentDialogOpen(true)
    }

    const openDeleteDialog = (order: Order) => {
        setOrderToDelete(order)
        setDeleteDialogOpen(true)
    }

    const handleUpdateStatus = async () => {
        if (!orderToUpdate || !newStatus) return
        try {
            await updateOrderStatus({ id: orderToUpdate.id, status: newStatus })
            toast.success('Cập nhật trạng thái đơn hàng thành công!')
            setStatusDialogOpen(false)
            setOrderToUpdate(null)
            refetch()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    const handleUpdatePayment = async () => {
        if (!orderToUpdate || !newPaymentStatus) return
        try {
            await updatePaymentStatus({ orderId: orderToUpdate.id, status: newPaymentStatus })
            toast.success('Cập nhật trạng thái thanh toán thành công!')
            setPaymentDialogOpen(false)
            setOrderToUpdate(null)
            refetch()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thanh toán')
        }
    }

    const handleDelete = async () => {
        if (!orderToDelete) return
        try {
            await deleteOrder(orderToDelete.id)
            toast.success('Xóa đơn hàng thành công!')
            setDeleteDialogOpen(false)
            setOrderToDelete(null)
            refetch()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa đơn hàng')
        }
    }

    // Filter and search logic
    const filteredOrders = orders.filter((order) => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.userId.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    if (isLoading) {
        return (
            <div className='container mx-auto py-8'>
                <div className='flex h-64 items-center justify-center'>
                    <p className='text-muted-foreground'>Đang tải đơn hàng...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='container mx-auto py-8'>
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle className='text-2xl'>Quản lý đơn hàng</CardTitle>
                            <CardDescription>Xem, cập nhật và quản lý tất cả đơn hàng trong hệ thống</CardDescription>
                        </div>
                        <Badge variant='secondary' className='text-lg px-4 py-2'>
                            Tổng: {total} đơn
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Search and Filter */}
                    <div className='flex gap-4 mb-6'>
                        <div className='relative flex-1'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Tìm kiếm theo mã đơn, user ID...'
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className='pl-10'
                            />
                        </div>
                        <Select
                            value={filterStatus}
                            onValueChange={(val) => {
                                setFilterStatus(val as OrderStatus | 'all')
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className='w-[200px]'>
                                <Filter className='h-4 w-4 mr-2' />
                                <SelectValue placeholder='Lọc trạng thái' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                                <SelectItem value={ORDER_STATUS.PENDING}>Chờ xác nhận</SelectItem>
                                <SelectItem value={ORDER_STATUS.PROCESSING}>Đang xử lý</SelectItem>
                                <SelectItem value={ORDER_STATUS.SHIPPED}>Đang giao</SelectItem>
                                <SelectItem value={ORDER_STATUS.COMPLETED}>Hoàn thành</SelectItem>
                                <SelectItem value={ORDER_STATUS.CANCELLED}>Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Summary Tabs */}
                    <Tabs
                        value={filterStatus}
                        onValueChange={(val) => setFilterStatus(val as OrderStatus | 'all')}
                        className='mb-6'
                    >
                        <TabsList className='grid w-full grid-cols-6'>
                            <TabsTrigger value='all'>
                                Tất cả
                                <Badge variant='secondary' className='ml-2'>
                                    {orders.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={ORDER_STATUS.PENDING}>
                                Chờ xác nhận
                                <Badge variant='secondary' className='ml-2'>
                                    {orders.filter((o) => o.status === ORDER_STATUS.PENDING).length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={ORDER_STATUS.PROCESSING}>
                                Đang xử lý
                                <Badge variant='secondary' className='ml-2'>
                                    {orders.filter((o) => o.status === ORDER_STATUS.PROCESSING).length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={ORDER_STATUS.SHIPPED}>
                                Đang giao
                                <Badge variant='secondary' className='ml-2'>
                                    {orders.filter((o) => o.status === ORDER_STATUS.SHIPPED).length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={ORDER_STATUS.COMPLETED}>
                                Hoàn thành
                                <Badge variant='secondary' className='ml-2'>
                                    {orders.filter((o) => o.status === ORDER_STATUS.COMPLETED).length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={ORDER_STATUS.CANCELLED}>
                                Đã hủy
                                <Badge variant='secondary' className='ml-2'>
                                    {orders.filter((o) => o.status === ORDER_STATUS.CANCELLED).length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Orders Table */}
                    {filteredOrders.length === 0 ? (
                        <div className='text-center py-12'>
                            <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                            <p className='text-muted-foreground'>
                                {searchQuery ? 'Không tìm thấy đơn hàng nào' : 'Chưa có đơn hàng nào'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã đơn</TableHead>
                                    <TableHead>Ngày đặt</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className='text-right'>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className='font-mono text-sm'>
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className='text-sm'>{formatDate(order.createdAt || '')}</TableCell>
                                        <TableCell className='text-sm'>
                                            <div className='max-w-[200px]'>
                                                <p className='font-medium truncate'>User #{order.userId.slice(0, 8)}</p>
                                                <p className='text-xs text-muted-foreground truncate'>
                                                    {order.deliveryAddress}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className='font-semibold'>{formatCurrency(order.total)}</TableCell>
                                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex justify-end gap-1'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => openDetailDialog(order.id)}
                                                >
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => openStatusDialog(order)}
                                                >
                                                    <Package className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => openDeleteDialog(order)}
                                                    disabled={deleting}
                                                >
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Order Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                    {orderDetails && (
                        <>
                            <DialogHeader>
                                <DialogTitle className='flex items-center gap-2 text-2xl'>
                                    <Package className='h-6 w-6' />
                                    Chi tiết đơn hàng #{orderDetails.order.id.slice(0, 8).toUpperCase()}
                                </DialogTitle>
                                <div className='flex items-center gap-2 pt-2'>
                                    {getOrderStatusBadge(orderDetails.order.status)}
                                    {orderDetails.payment && getPaymentStatusBadge(orderDetails.payment.status)}
                                </div>
                            </DialogHeader>

                            <div className='space-y-6'>
                                {/* Order Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-base'>Thông tin đơn hàng</CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-3'>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='flex items-start gap-2'>
                                                <Calendar className='h-4 w-4 mt-1 text-muted-foreground' />
                                                <div className='flex-1'>
                                                    <p className='text-sm text-muted-foreground'>Ngày đặt hàng</p>
                                                    <p className='font-medium'>
                                                        {formatDate(orderDetails.order.createdAt || '')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='flex items-start gap-2'>
                                                <Package className='h-4 w-4 mt-1 text-muted-foreground' />
                                                <div className='flex-1'>
                                                    <p className='text-sm text-muted-foreground'>Mã khách hàng</p>
                                                    <p className='font-medium font-mono'>
                                                        {orderDetails.order.userId.slice(0, 12)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className='flex items-start gap-2'>
                                            <MapPin className='h-4 w-4 mt-1 text-muted-foreground' />
                                            <div className='flex-1'>
                                                <p className='text-sm text-muted-foreground'>Địa chỉ giao hàng</p>
                                                <p className='font-medium'>{orderDetails.order.deliveryAddress}</p>
                                            </div>
                                        </div>
                                        {orderDetails.payment && (
                                            <>
                                                <Separator />
                                                <div className='flex items-start gap-2'>
                                                    <CreditCard className='h-4 w-4 mt-1 text-muted-foreground' />
                                                    <div className='flex-1'>
                                                        <p className='text-sm text-muted-foreground'>
                                                            Phương thức thanh toán
                                                        </p>
                                                        <p className='font-medium'>
                                                            {orderDetails.payment.method === 'COD'
                                                                ? 'Thanh toán khi nhận hàng (COD)'
                                                                : 'Chuyển khoản ngân hàng'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Order Items */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-base'>
                                            Sản phẩm ({orderDetails.items.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        {orderDetails.items.map((item, index) => (
                                            <div key={item.id || index}>
                                                <div className='flex gap-4'>
                                                    <div className='relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0'>
                                                        <img
                                                            src={item.imageUrl || PlaceHolderProduct}
                                                            alt='Product'
                                                            className='w-full h-full object-cover'
                                                            onError={(e) => {
                                                                if (e.currentTarget.src !== PlaceHolderProduct) {
                                                                    e.currentTarget.src = PlaceHolderProduct
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className='flex-1 space-y-1'>
                                                        <p className='font-medium line-clamp-2'>
                                                            Sản phẩm #{item.productId?.slice(0, 8)}
                                                        </p>
                                                        <div className='flex items-baseline gap-2'>
                                                            <span className='text-lg font-semibold text-primary'>
                                                                {formatCurrency(item.price)}
                                                            </span>
                                                            <span className='text-sm text-muted-foreground'>
                                                                x {item.quantity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className='text-right'>
                                                        <p className='text-sm text-muted-foreground'>Thành tiền</p>
                                                        <p className='text-lg font-bold'>
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {index < orderDetails.items.length - 1 && (
                                                    <Separator className='mt-4' />
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Order Summary */}
                                <Card className='bg-muted/50'>
                                    <CardContent className='pt-6'>
                                        <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>Tạm tính:</span>
                                                <span className='font-medium'>
                                                    {formatCurrency(orderDetails.order.total)}
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>Phí vận chuyển:</span>
                                                <span className='font-medium'>Miễn phí</span>
                                            </div>
                                            <Separator />
                                            <div className='flex justify-between text-lg'>
                                                <span className='font-semibold'>Tổng cộng:</span>
                                                <span className='font-bold text-primary text-2xl'>
                                                    {formatCurrency(orderDetails.order.total)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <div className='flex justify-end gap-2'>
                                    <Button
                                        variant='outline'
                                        onClick={() => {
                                            setDetailDialogOpen(false)
                                            openStatusDialog(orderDetails.order)
                                        }}
                                    >
                                        Cập nhật trạng thái
                                    </Button>
                                    {orderDetails.payment && (
                                        <Button
                                            variant='outline'
                                            onClick={() => {
                                                setDetailDialogOpen(false)
                                                openPaymentDialog(orderDetails.order)
                                            }}
                                        >
                                            Cập nhật thanh toán
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
                        <DialogDescription>
                            Thay đổi trạng thái cho đơn hàng #{orderToUpdate?.id.slice(0, 8).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='status'>Trạng thái mới *</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger id='status'>
                                    <SelectValue placeholder='Chọn trạng thái' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ORDER_STATUS.PENDING}>Chờ xác nhận</SelectItem>
                                    <SelectItem value={ORDER_STATUS.PROCESSING}>Đang xử lý</SelectItem>
                                    <SelectItem value={ORDER_STATUS.SHIPPED}>Đang giao</SelectItem>
                                    <SelectItem value={ORDER_STATUS.COMPLETED}>Hoàn thành</SelectItem>
                                    <SelectItem value={ORDER_STATUS.CANCELLED}>Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='bg-muted p-3 rounded-lg text-sm'>
                            <p className='text-muted-foreground'>
                                <strong>Lưu ý:</strong> Khi hủy đơn hàng, hệ thống sẽ tự động hoàn lại số lượng sản phẩm
                                vào kho.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setStatusDialogOpen(false)} disabled={updatingStatus}>
                            Hủy
                        </Button>
                        <Button onClick={handleUpdateStatus} disabled={updatingStatus || !newStatus}>
                            {updatingStatus ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Payment Status Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
                        <DialogDescription>
                            Thay đổi trạng thái thanh toán cho đơn hàng #{orderToUpdate?.id.slice(0, 8).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='payment-status'>Trạng thái thanh toán *</Label>
                            <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                                <SelectTrigger id='payment-status'>
                                    <SelectValue placeholder='Chọn trạng thái thanh toán' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={PAYMENT_STATUS.UNPAID}>Chưa thanh toán</SelectItem>
                                    <SelectItem value={PAYMENT_STATUS.PAID}>Đã thanh toán</SelectItem>
                                    <SelectItem value={PAYMENT_STATUS.FAILED}>Thanh toán thất bại</SelectItem>
                                    <SelectItem value={PAYMENT_STATUS.REFUNDED}>Đã hoàn tiền</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setPaymentDialogOpen(false)}
                            disabled={updatingPayment}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleUpdatePayment} disabled={updatingPayment || !newPaymentStatus}>
                            {updatingPayment ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đơn hàng{' '}
                            <strong>#{orderToDelete?.id.slice(0, 8).toUpperCase()}</strong>?
                            <br />
                            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến đơn hàng.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
