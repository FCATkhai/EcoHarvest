import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import useCartStore from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PlaceHolderProduct from '@/assets/placeholder-product.svg'
import AppPath from '@/constants/AppPath'

export default function CartDetail() {
    const navigate = useNavigate()
    const items = useCartStore((state) => state.items)
    const loading = useCartStore((state) => state.loading)

    const fetchCart = useCartStore((state) => state.fetchCart)
    const updateItem = useCartStore((state) => state.updateItem)
    const removeItem = useCartStore((state) => state.removeItem)
    const toggleItemChecked = useCartStore((state) => state.toggleItemChecked)
    const toggleAllItemsChecked = useCartStore((state) => state.toggleAllItemsChecked)

    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        fetchCart().catch((err) => {
            console.error('Failed to fetch cart:', err)
        })
    }, [fetchCart])

    const checkedItems = items.filter((item) => item.isChecked)
    const allSelected = items.length > 0 && checkedItems.length === items.length
    const someSelected = checkedItems.length > 0 && checkedItems.length < items.length

    const selectedTotal = useMemo(() => {
        return checkedItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0)
    }, [checkedItems])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    const handleSelectAll = (checked: boolean) => {
        toggleAllItemsChecked(checked)
    }

    const handleSelectItem = (itemId: number) => {
        toggleItemChecked(itemId)
    }

    const handleQuantityChange = async (itemId: number, currentQuantity: number, delta: number) => {
        const newQuantity = currentQuantity + delta
        if (newQuantity < 1) return

        try {
            setIsUpdating(true)
            await updateItem(itemId, newQuantity)
            toast.success('Đã cập nhật số lượng')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật số lượng')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleRemoveItem = async (itemId: number) => {
        try {
            setIsUpdating(true)
            await removeItem(itemId)
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xóa sản phẩm')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleRemoveSelected = async () => {
        if (checkedItems.length === 0) return

        try {
            setIsUpdating(true)
            await Promise.all(checkedItems.map((item) => removeItem(item.id)))
            toast.success(`Đã xóa ${checkedItems.length} sản phẩm`)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCheckout = () => {
        if (checkedItems.length === 0) {
            toast.error('Vui lòng chọn sản phẩm để thanh toán')
            return
        }
        navigate(AppPath.checkout)
    }

    if (loading && items.length === 0) {
        return (
            <div className='container mx-auto py-8'>
                <div className='animate-pulse space-y-4'>
                    <div className='h-8 bg-muted rounded w-1/4' />
                    <div className='h-32 bg-muted rounded' />
                    <div className='h-32 bg-muted rounded' />
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className='container mx-auto py-8'>
                <Card>
                    <CardContent className='py-12 text-center'>
                        <ShoppingCart className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Giỏ hàng trống</h3>
                        <p className='text-muted-foreground mb-4'>
                            Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm sản phẩm yêu thích!
                        </p>
                        <Button asChild>
                            <Link to={AppPath.products}>Mua sắm ngay</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className='container mx-auto py-6 space-y-6'>
            <h1 className='text-2xl font-bold'>Giỏ Hàng</h1>

            <div className='grid lg:grid-cols-3 gap-6'>
                {/* Cart Items */}
                <div className='lg:col-span-2 space-y-4'>
                    {/* Header */}
                    <Card>
                        <CardContent className='px-4'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        className='data-[state=indeterminate]:bg-primary'
                                        {...(someSelected && !allSelected ? { 'data-state': 'indeterminate' } : {})}
                                    />
                                    <span className='font-medium'>Chọn tất cả ({items.length} sản phẩm)</span>
                                </div>
                                {checkedItems.length > 0 && (
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={handleRemoveSelected}
                                        disabled={isUpdating}
                                    >
                                        <Trash2 className='h-4 w-4 mr-2' />
                                        Xóa ({checkedItems.length})
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cart Items List */}
                    {items.map((item) => (
                        <Card key={item.id}>
                            <CardContent className='px-4'>
                                <div className='flex gap-4'>
                                    {/* Checkbox */}
                                    <div className='flex items-center pt-2'>
                                        <Checkbox
                                            checked={item.isChecked}
                                            onCheckedChange={() => handleSelectItem(item.id)}
                                        />
                                    </div>

                                    {/* Product Image */}
                                    <Link
                                        to={AppPath.productDetail(item.productId as string)}
                                        className='shrink-0 w-24 h-24 rounded-lg overflow-hidden border'
                                    >
                                        <img
                                            src={item.image || PlaceHolderProduct}
                                            alt={item.name || 'Product'}
                                            className='w-full h-full object-cover hover:scale-105 transition-transform'
                                            onError={(e) => {
                                                if (e.currentTarget.src !== PlaceHolderProduct) {
                                                    e.currentTarget.src = PlaceHolderProduct
                                                }
                                            }}
                                        />
                                    </Link>

                                    {/* Product Info */}
                                    <div className='flex-1 min-w-0'>
                                        <Link
                                            to={AppPath.productDetail(item.productId as string)}
                                            className='font-medium hover:text-primary transition-colors line-clamp-2'
                                        >
                                            {item.name}
                                        </Link>

                                        <div className='mt-2 flex items-center justify-between'>
                                            <div className='space-y-1'>
                                                <div className='text-lg font-semibold text-primary'>
                                                    {formatCurrency(Number(item.price || 0))}
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className='flex items-center gap-4'>
                                                <div className='flex items-center border rounded-lg'>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8'
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                                        disabled={isUpdating || item.quantity <= 1}
                                                    >
                                                        <Minus className='h-3 w-3' />
                                                    </Button>
                                                    <span className='w-12 text-center font-medium'>
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-8 w-8'
                                                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                                        disabled={isUpdating}
                                                    >
                                                        <Plus className='h-3 w-3' />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant='ghost'
                                                    size='icon'
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={isUpdating}
                                                >
                                                    <Trash2 className='h-4 w-4 text-destructive' />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className='mt-2 text-sm text-muted-foreground'>
                                            Tổng:{' '}
                                            <span className='font-semibold text-foreground'>
                                                {formatCurrency(Number(item.price || 0) * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Order Summary */}
                <div className='lg:col-span-1'>
                    <Card className='sticky top-6'>
                        <CardContent className='p-6 space-y-4'>
                            <h2 className='text-lg font-semibold'>Tóm tắt đơn hàng</h2>

                            <Separator />

                            <div className='space-y-2'>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>Sản phẩm đã chọn:</span>
                                    <span className='font-medium'>{checkedItems.length}</span>
                                </div>
                                <div className='flex justify-between'>
                                    <span className='font-medium'>Tổng cộng:</span>
                                    <span className='text-xl font-bold text-primary'>
                                        {formatCurrency(selectedTotal)}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {checkedItems.length === 0 && (
                                <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                                    <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                                    <span>Vui lòng chọn sản phẩm để thanh toán</span>
                                </div>
                            )}

                            <Button
                                onClick={handleCheckout}
                                disabled={checkedItems.length === 0 || isUpdating}
                                className='w-full'
                                size='lg'
                            >
                                Mua Hàng ({checkedItems.length})
                            </Button>

                            <Button variant='outline' asChild className='w-full'>
                                <Link to={AppPath.products}>Tiếp tục mua sắm</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
