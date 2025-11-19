import { useState } from 'react'
import { Link } from 'react-router'
import useOrders, { useOrder } from '@/hooks/useOrder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    ShoppingBag,
    Calendar,
    MapPin,
    CreditCard,
    AlertCircle
} from 'lucide-react'
import { ORDER_STATUS, PAYMENT_STATUS } from '@/constants/order'
import type { Order } from '@/types/schema.type'
import PlaceHolderProduct from '@/assets/placeholder-product.svg'
import AppPath from '@/constants/AppPath'
import toast from 'react-hot-toast'

export default function OrderPage() {
    const { orders, isLoading, updateOrderStatus, updatingStatus, refetch } = useOrders()
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

    const { orderDetails } = useOrder(selectedOrderId || undefined)

    const [filterStatus, setFilterStatus] = useState<string>('all')

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
                return (
                    <Badge variant='default' className='bg-green-500'>
                        Đã thanh toán
                    </Badge>
                )
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

    const handleCancelOrder = (order: Order) => {
        setOrderToCancel(order)
        setCancelDialogOpen(true)
    }

    const confirmCancelOrder = async () => {
        if (!orderToCancel) return

        try {
            await updateOrderStatus({
                id: orderToCancel.id,
                status: ORDER_STATUS.CANCELLED
            })
            toast.success('Đã hủy đơn hàng thành công')
            setCancelDialogOpen(false)
            setOrderToCancel(null)
            refetch()
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể hủy đơn hàng')
        }
    }

    const handleViewDetails = (orderId: string) => {
        setSelectedOrderId(orderId)
    }

    const filteredOrders = orders.filter((order) => {
        if (filterStatus === 'all') return true
        return order.status === filterStatus
    })

    if (isLoading) {
        return (
            <div className='container mx-auto px-4 py-8'>
                <div className='space-y-4'>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className='animate-pulse'>
                            <CardContent className='p-6'>
                                <div className='h-6 bg-muted rounded w-1/3 mb-4' />
                                <div className='h-4 bg-muted rounded w-2/3' />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='container mx-auto px-4 py-8'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold mb-2'>Đơn Hàng Của Tôi</h1>
                <p className='text-muted-foreground'>Theo dõi và quản lý các đơn hàng của bạn</p>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className='mb-6'>
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

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <Card>
                    <CardContent className='flex flex-col items-center justify-center py-16'>
                        <ShoppingBag className='h-16 w-16 text-muted-foreground mb-4' />
                        <h3 className='text-xl font-semibold mb-2'>Chưa có đơn hàng nào</h3>
                        <p className='text-muted-foreground mb-4'>
                            {filterStatus === 'all'
                                ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
                                : `Không có đơn hàng nào ở trạng thái này.`}
                        </p>
                        <Button asChild>
                            <Link to={AppPath.products}>Khám phá sản phẩm</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className='space-y-4'>
                    {filteredOrders.map((order) => (
                        <Card key={order.id} className='hover:shadow-lg transition-shadow'>
                            <CardHeader className='pb-3'>
                                <div className='flex items-start justify-between'>
                                    <div className='space-y-1'>
                                        <CardTitle className='text-lg flex items-center gap-2'>
                                            <Package className='h-5 w-5' />
                                            Đơn hàng #{order.id.slice(0, 8).toUpperCase()}
                                        </CardTitle>
                                        <CardDescription className='flex items-center gap-2'>
                                            <Calendar className='h-3 w-3' />
                                            {formatDate(order.createdAt || '')}
                                        </CardDescription>
                                    </div>
                                    <div className='text-right space-y-2'>{getOrderStatusBadge(order.status)}</div>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                    <MapPin className='h-4 w-4' />
                                    <span className='line-clamp-1'>{order.deliveryAddress}</span>
                                </div>

                                <Separator />

                                <div className='flex items-center justify-between'>
                                    <div className='space-y-1'>
                                        <p className='text-sm text-muted-foreground'>Tổng tiền:</p>
                                        <p className='text-2xl font-bold text-primary'>{formatCurrency(order.total)}</p>
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button variant='outline' onClick={() => handleViewDetails(order.id)}>
                                            Xem chi tiết
                                        </Button>
                                        {order.status === ORDER_STATUS.PENDING && (
                                            <Button
                                                variant='destructive'
                                                onClick={() => handleCancelOrder(order)}
                                                disabled={updatingStatus}
                                            >
                                                <XCircle className='h-4 w-4 mr-2' />
                                                Hủy đơn
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Cancel Order Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <AlertCircle className='h-5 w-5 text-destructive' />
                            Xác nhận hủy đơn hàng
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn hủy đơn hàng #{orderToCancel?.id.slice(0, 8).toUpperCase()}?
                            <br />
                            Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='bg-muted p-4 rounded-lg space-y-2'>
                        <div className='flex justify-between text-sm'>
                            <span className='text-muted-foreground'>Mã đơn hàng:</span>
                            <span className='font-medium'>#{orderToCancel?.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-muted-foreground'>Tổng tiền:</span>
                            <span className='font-medium'>{formatCurrency(orderToCancel?.total || 0)}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-muted-foreground'>Ngày đặt:</span>
                            <span className='font-medium'>{formatDate(orderToCancel?.createdAt || '')}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setCancelDialogOpen(false)} disabled={updatingStatus}>
                            Quay lại
                        </Button>
                        <Button variant='destructive' onClick={confirmCancelOrder} disabled={updatingStatus}>
                            {updatingStatus ? 'Đang xử lý...' : 'Xác nhận hủy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
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
                                        <div className='flex items-start gap-2'>
                                            <Calendar className='h-4 w-4 mt-1 text-muted-foreground' />
                                            <div className='flex-1'>
                                                <p className='text-sm text-muted-foreground'>Ngày đặt hàng</p>
                                                <p className='font-medium'>
                                                    {formatDate(orderDetails.order.createdAt || '')}
                                                </p>
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
                                                    <div className='relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0'>
                                                        <img
                                                            src={item.imageUrl || PlaceHolderProduct}
                                                            alt={'Sản phẩm ' + (item.productId?.slice(0, 8) || '')}
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

                                {/* Cancel Action in Detail View */}
                                {orderDetails.order.status === ORDER_STATUS.PENDING && (
                                    <div className='flex justify-end'>
                                        <Button
                                            variant='destructive'
                                            onClick={() => {
                                                setSelectedOrderId(null)
                                                handleCancelOrder(orderDetails.order)
                                            }}
                                            disabled={updatingStatus}
                                        >
                                            <XCircle className='h-4 w-4 mr-2' />
                                            Hủy đơn hàng này
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
