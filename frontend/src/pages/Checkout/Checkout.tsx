//TODO: xử lý lỗi gọi API nhiều lần khi chỉnh address
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import useCartStore from '@/store/useCartStore'
import useAuthStore from '@/store/useAuthStore'
import useAddresses from '@/hooks/useAddress'
import useOrders from '@/hooks/useOrder'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { MapPin, Plus, Trash2, Edit2, ShoppingCart, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PlaceHolderProduct from '@/assets/placeholder-product.svg'
import AppPath from '@/constants/AppPath'
import type { Address } from '@/types/schema.type'

export default function Checkout() {
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)
    const items = useCartStore((state) => state.items)
    const removeItem = useCartStore((state) => state.removeItem)

    const checkedItems = items.filter((item) => item.isChecked)

    const {
        addresses,
        isLoading: loadingAddresses,
        createAddress,
        updateAddress,
        deleteAddress
    } = useAddresses(user?.id)
    const { createOrder, creating } = useOrders()

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    // Address form state
    const [addressForm, setAddressForm] = useState({
        label: '',
        province: '',
        ward: '',
        detailAddress: ''
    })

    // Auto-select first address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id)
        }
    }, [addresses, selectedAddressId])

    const selectedAddress = useMemo(() => {
        return addresses.find((addr) => addr.id === selectedAddressId)
    }, [addresses, selectedAddressId])

    const orderTotal = useMemo(() => {
        return checkedItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0)
    }, [checkedItems])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    const formatAddress = (addr: Address) => {
        const parts = [addr.detailAddress, addr.ward, addr.province].filter(Boolean)
        return parts.join(', ')
    }

    const handleOpenAddressDialog = (address?: Address) => {
        if (address) {
            setEditingAddress(address)
            setAddressForm({
                label: address.label || '',
                province: address.province || '',
                ward: address.ward || '',
                detailAddress: address.detailAddress || ''
            })
        } else {
            setEditingAddress(null)
            setAddressForm({ label: '', province: '', ward: '', detailAddress: '' })
        }
        setIsAddressDialogOpen(true)
    }

    const handleSaveAddress = async () => {
        if (!user?.id) return

        try {
            if (editingAddress) {
                await updateAddress({ id: editingAddress.id, payload: addressForm })
                toast.success('Đã cập nhật địa chỉ')
            } else {
                const result = await createAddress(addressForm)
                toast.success('Đã thêm địa chỉ mới')
                // Auto-select newly created address
                if (result?.data?.id) {
                    setSelectedAddressId(result.data.id)
                }
            }
            setIsAddressDialogOpen(false)
            setAddressForm({ label: '', province: '', ward: '', detailAddress: '' })
            setEditingAddress(null)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra')
        }
    }

    const handleDeleteAddress = async (addressId: number) => {
        try {
            await deleteAddress(addressId)
            if (selectedAddressId === addressId) {
                setSelectedAddressId(addresses[0]?.id || null)
            }
            toast.success('Đã xóa địa chỉ')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xóa địa chỉ')
        }
    }

    const handleRemoveItem = async (itemId: number) => {
        try {
            await removeItem(itemId)
            toast.success('Đã xóa sản phẩm')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra')
        }
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Vui lòng chọn địa chỉ giao hàng')
            return
        }

        if (checkedItems.length === 0) {
            toast.error('Không có sản phẩm nào để đặt hàng')
            return
        }

        try {
            const orderData = {
                items: checkedItems.map((item) => ({
                    productId: item.productId!,
                    quantity: item.quantity,
                    price: Number(item.price || 0),
                    cartItemId: item.id
                })),
                total: orderTotal,
                //TODO: hardcode phương thức thanh toán
                paymentMethod: 'COD',
                deliveryAddress: formatAddress(selectedAddress)
            }

            await createOrder(orderData)
            toast.success('Đặt hàng thành công!')
            navigate(AppPath.orders)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi đặt hàng')
        }
    }

    if (!user) {
        return (
            <div className='container mx-auto py-8'>
                <Card>
                    <CardContent className='py-12 text-center'>
                        <AlertCircle className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Vui lòng đăng nhập</h3>
                        <p className='text-muted-foreground mb-4'>Bạn cần đăng nhập để thực hiện thanh toán</p>
                        <Button asChild>
                            <a href={AppPath.signIn}>Đăng nhập</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (checkedItems.length === 0) {
        return (
            <div className='container mx-auto py-8'>
                <Card>
                    <CardContent className='py-12 text-center'>
                        <ShoppingCart className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Không có sản phẩm nào được chọn</h3>
                        <p className='text-muted-foreground mb-4'>
                            Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán
                        </p>
                        <Button asChild>
                            <a href={AppPath.cart}>Quay lại giỏ hàng</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className='container mx-auto py-6 space-y-6'>
            <h1 className='text-2xl font-bold'>Thanh Toán</h1>

            <div className='grid lg:grid-cols-3 gap-6'>
                {/* Main Content */}
                <div className='lg:col-span-2 space-y-6'>
                    {/* Delivery Address */}
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between'>
                            <CardTitle className='flex items-center gap-2'>
                                <MapPin className='h-5 w-5' />
                                Địa Chỉ Giao Hàng
                            </CardTitle>
                            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant='outline' size='sm' onClick={() => handleOpenAddressDialog()}>
                                        <Plus className='h-4 w-4 mr-2' />
                                        Thêm địa chỉ
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                                        </DialogTitle>
                                        <DialogDescription>Nhập thông tin địa chỉ giao hàng của bạn</DialogDescription>
                                    </DialogHeader>
                                    <div className='space-y-4'>
                                        <div className='space-y-2'>
                                            <Label htmlFor='label'>Nhãn địa chỉ (Nhà riêng, Văn phòng...)</Label>
                                            <Input
                                                id='label'
                                                value={addressForm.label}
                                                onChange={(e) =>
                                                    setAddressForm({ ...addressForm, label: e.target.value })
                                                }
                                                placeholder='Nhà riêng'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label htmlFor='province'>Tỉnh/Thành phố</Label>
                                            <Input
                                                id='province'
                                                value={addressForm.province}
                                                onChange={(e) =>
                                                    setAddressForm({ ...addressForm, province: e.target.value })
                                                }
                                                placeholder='TP. Hồ Chí Minh'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label htmlFor='ward'>Quận/Huyện/Phường</Label>
                                            <Input
                                                id='ward'
                                                value={addressForm.ward}
                                                onChange={(e) =>
                                                    setAddressForm({ ...addressForm, ward: e.target.value })
                                                }
                                                placeholder='Quận 1'
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <Label htmlFor='detailAddress'>Địa chỉ chi tiết</Label>
                                            <Input
                                                id='detailAddress'
                                                value={addressForm.detailAddress}
                                                onChange={(e) =>
                                                    setAddressForm({ ...addressForm, detailAddress: e.target.value })
                                                }
                                                placeholder='Số nhà, tên đường...'
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant='outline' onClick={() => setIsAddressDialogOpen(false)}>
                                            Hủy
                                        </Button>
                                        <Button onClick={handleSaveAddress}>Lưu</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {loadingAddresses ? (
                                <div className='animate-pulse space-y-2'>
                                    <div className='h-16 bg-muted rounded' />
                                    <div className='h-16 bg-muted rounded' />
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className='text-center py-8 text-muted-foreground'>
                                    <p>Chưa có địa chỉ nào. Vui lòng thêm địa chỉ giao hàng.</p>
                                </div>
                            ) : (
                                <RadioGroup
                                    value={String(selectedAddressId)}
                                    onValueChange={(val) => setSelectedAddressId(Number(val))}
                                >
                                    <div className='space-y-3'>
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                className={`flex items-start gap-3 p-4 border rounded-lg ${
                                                    selectedAddressId === addr.id ? 'border-primary bg-primary/5' : ''
                                                }`}
                                            >
                                                <RadioGroupItem value={String(addr.id)} id={`addr-${addr.id}`} />
                                                <div className='flex-1 min-w-0'>
                                                    <Label htmlFor={`addr-${addr.id}`} className='cursor-pointer'>
                                                        {addr.label && (
                                                            <span className='font-semibold'>{addr.label}</span>
                                                        )}
                                                        <p className='text-sm text-muted-foreground mt-1'>
                                                            {formatAddress(addr)}
                                                        </p>
                                                    </Label>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => handleOpenAddressDialog(addr)}
                                                    >
                                                        <Edit2 className='h-4 w-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                    >
                                                        <Trash2 className='h-4 w-4 text-destructive' />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sản Phẩm Đã Chọn ({checkedItems.length})</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {checkedItems.map((item) => (
                                <div key={item.id} className='flex gap-4 pb-4 border-b last:border-0 items-center'>
                                    <img
                                        src={item.image || PlaceHolderProduct}
                                        alt={item.name || 'Product'}
                                        className='w-20 h-20 object-cover rounded-lg border'
                                        onError={(e) => {
                                            if (e.currentTarget.src !== PlaceHolderProduct) {
                                                e.currentTarget.src = PlaceHolderProduct
                                            }
                                        }}
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <h4 className='font-medium line-clamp-2'>{item.name}</h4>
                                        <div className='mt-2 flex items-center justify-between'>
                                            <div className='text-sm text-muted-foreground'>x{item.quantity}</div>
                                            <div className='font-semibold text-primary'>
                                                {formatCurrency(Number(item.price || 0) * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant='ghost' size='icon' onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className='h-4 w-4 text-destructive' />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className='lg:col-span-1'>
                    <Card className='sticky top-6'>
                        <CardHeader>
                            <CardTitle>Thông Tin Đơn Hàng</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>Tạm tính:</span>
                                    <span>{formatCurrency(orderTotal)}</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>Phương thức thanh toán:</span>
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>Phí vận chuyển:</span>
                                    <span>Miễn phí</span>
                                </div>
                            </div>

                            <Separator />

                            <div className='flex justify-between'>
                                <span className='font-semibold'>Tổng cộng:</span>
                                <span className='text-xl font-bold text-primary'>{formatCurrency(orderTotal)}</span>
                            </div>

                            {!selectedAddress && (
                                <div className='flex items-start gap-2 text-sm text-muted-foreground'>
                                    <AlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                                    <span>Vui lòng chọn địa chỉ giao hàng</span>
                                </div>
                            )}

                            <Button
                                onClick={handlePlaceOrder}
                                disabled={!selectedAddress || creating || checkedItems.length === 0}
                                className='w-full'
                                size='lg'
                            >
                                {creating ? 'Đang xử lý...' : 'Đặt Hàng'}
                            </Button>

                            <Button variant='outline' asChild className='w-full'>
                                <a href={AppPath.cart}>Quay lại giỏ hàng</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
