//TODO: change "mua ngay" behavior to go to checkout directly
import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useProduct } from '@/hooks/useProduct'
import useCartStore from '@/store/useCartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeft,
    ShoppingCart,
    Minus,
    Plus,
    Package,
    MapPin,
    Award,
    Calendar,
    FileCheck,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import PlaceHolderProduct from '@/assets/placeholder-product.svg'

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [quantity, setQuantity] = useState(1)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [imageBarStartIndex, setImageBarStartIndex] = useState(0)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    const { product, isLoading, isError } = useProduct(id)
    const addItem = useCartStore((state) => state.addItem)

    // Get images and certifications from product
    const images = product?.images || []
    const certifications = product?.certifications || []

    // Organize images: primary first, then others
    const displayImages = useMemo(() => {
        if (!images || images.length === 0) return [{ imageUrl: PlaceHolderProduct, altText: 'Product' }]
        const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        return sorted
    }, [images])
    // const displayImages = useMemo(() => {
    //     if (!images || images.length === 0) {
    //         return [{ imageUrl: PlaceHolderProduct, altText: 'Product', isPrimary: false }]
    //     }
    //     return [...images]
    //         .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    //         .map((img) => ({
    //             ...img,
    //             imageUrl: img.imageUrl || PlaceHolderProduct // đảm bảo luôn có URL hợp lệ
    //         }))
    // }, [images])

    // Ensure selectedImageIndex is within bounds
    const safeSelectedImageIndex = Math.min(selectedImageIndex, displayImages.length - 1)
    const selectedImage = displayImages[safeSelectedImageIndex]
    const maxVisibleImages = 4
    const hasMultipleImages = displayImages.length > 1
    const visibleImages = displayImages.slice(imageBarStartIndex, imageBarStartIndex + maxVisibleImages)

    // Reset image selection when product changes or when displayImages changes
    useEffect(() => {
        setSelectedImageIndex(0)
        setImageBarStartIndex(0)
    }, [id])

    // Keep selectedImageIndex in bounds when displayImages changes
    // useEffect(() => {
    //     if (selectedImageIndex >= displayImages.length) {
    //         setSelectedImageIndex(Math.max(0, displayImages.length - 1))
    //     }
    // }, [displayImages.length, selectedImageIndex])
    useEffect(() => {
        if (selectedImageIndex >= displayImages.length) {
            setSelectedImageIndex(displayImages.length > 0 ? displayImages.length - 1 : 0)
        }
    }, [displayImages.length]) // Không cần selectedImageIndex vào deps nếu logic chỉ phụ thuộc vào displayImages.length

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Number(amount))
    }

    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('vi-VN')
    }

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta
        if (newQuantity >= 1 && newQuantity <= (product?.quantity || 0)) {
            setQuantity(newQuantity)
        }
    }

    const handleImageNavigation = (direction: 'prev' | 'next') => {
        if (displayImages.length <= 1) return

        if (direction === 'prev') {
            // Go to previous image
            const newIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : displayImages.length - 1
            setSelectedImageIndex(newIndex)

            // Adjust image bar if needed
            if (newIndex < imageBarStartIndex) {
                setImageBarStartIndex(Math.max(0, newIndex))
            } else if (newIndex >= displayImages.length - maxVisibleImages && displayImages.length > maxVisibleImages) {
                setImageBarStartIndex(Math.max(0, displayImages.length - maxVisibleImages))
            }
        } else {
            // Go to next image
            const newIndex = selectedImageIndex < displayImages.length - 1 ? selectedImageIndex + 1 : 0
            setSelectedImageIndex(newIndex)

            // Adjust image bar if needed
            if (newIndex >= imageBarStartIndex + maxVisibleImages) {
                setImageBarStartIndex(Math.min(newIndex, displayImages.length - maxVisibleImages))
            } else if (newIndex === 0) {
                setImageBarStartIndex(0)
            }
        }
    }

    const handleImageSelect = (index: number) => {
        const safeIndex = Math.max(0, Math.min(index, displayImages.length - 1))
        setSelectedImageIndex(safeIndex)
    }

    const handleAddToCart = async () => {
        if (!product || !id) return

        try {
            setIsAddingToCart(true)
            await addItem({ productId: id, quantity })
            toast.success(`Đã thêm ${quantity} ${product.unit || 'sản phẩm'} vào giỏ hàng!`)
            setQuantity(1)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng')
        } finally {
            setIsAddingToCart(false)
        }
    }

    const handleBuyNow = async () => {
        await handleAddToCart()
        navigate('/cart')
    }

    if (isLoading) {
        return (
            <div className='container mx-auto py-8'>
                <div className='animate-pulse space-y-6'>
                    <div className='h-8 bg-muted rounded w-1/4' />
                    <div className='grid md:grid-cols-2 gap-8'>
                        <div className='space-y-4'>
                            <div className='h-96 bg-muted rounded' />
                            <div className='flex gap-2'>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className='h-20 w-20 bg-muted rounded' />
                                ))}
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <div className='h-8 bg-muted rounded' />
                            <div className='h-6 bg-muted rounded w-3/4' />
                            <div className='h-4 bg-muted rounded w-1/2' />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isError || !product) {
        return (
            <div className='container mx-auto py-8'>
                <Card>
                    <CardContent className='py-12 text-center'>
                        <AlertCircle className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Không tìm thấy sản phẩm</h3>
                        <p className='text-muted-foreground mb-4'>
                            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
                        </p>
                        <Button asChild>
                            <Link to='/products'>
                                <ArrowLeft className='h-4 w-4 mr-2' />
                                Quay lại danh sách sản phẩm
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isOutOfStock = product.quantity === 0 || (product.quantity !== undefined && product.quantity <= 0)
    const isLowStock = product.quantity > 0 && product.quantity <= 10

    return (
        <div className='container mx-auto py-6 px-10 space-y-6'>
            {/* Breadcrumb */}
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Link to='/products' className='hover:text-foreground transition-colors'>
                    Sản phẩm
                </Link>
                <span>/</span>
                <span className='text-foreground'>{product.name}</span>
            </div>

            {/* Back Button */}
            <Button variant='ghost' asChild className='gap-2'>
                <Link to='/products'>
                    <ArrowLeft className='h-4 w-4' />
                    Quay lại
                </Link>
            </Button>

            {/* Main Content */}
            <div className='grid md:grid-cols-6 gap-8'>
                {/* Image Gallery */}
                <div className='space-y-4 col-span-2'>
                    <Card className='overflow-hidden py-0'>
                        <CardContent className='p-0'>
                            <div className='relative aspect-square bg-muted'>
                                <img
                                    src={selectedImage.imageUrl}
                                    alt={selectedImage.altText || product.name}
                                    className='w-full h-full object-cover'
                                    onError={(e) => {
                                        if (e.currentTarget.src !== PlaceHolderProduct) {
                                            e.currentTarget.src = PlaceHolderProduct
                                        }
                                    }}
                                />
                                {isOutOfStock && (
                                    <div className='absolute inset-0 bg-black/60 opacity-70 flex items-center justify-center'>
                                        <Badge variant='destructive' className='text-lg px-4 py-2'>
                                            Hết hàng
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thumbnail Gallery */}
                    {hasMultipleImages && (
                        <div className='flex items-center gap-2 justify-center'>
                            {/* Previous Button */}
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => handleImageNavigation('prev')}
                                className='shrink-0'
                            >
                                <ChevronLeft className='h-4 w-4' />
                            </Button>

                            {/* Image Thumbnails */}
                            <div className='flex gap-2 overflow-hidden'>
                                {visibleImages.map((img, visibleIndex) => {
                                    const actualIndex = imageBarStartIndex + visibleIndex
                                    return (
                                        <button
                                            key={actualIndex}
                                            onClick={() => handleImageSelect(actualIndex)}
                                            className={`shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                                actualIndex === selectedImageIndex
                                                    ? 'border-primary'
                                                    : 'border-transparent hover:border-muted-foreground'
                                            }`}
                                        >
                                            <img
                                                src={img.imageUrl || PlaceHolderProduct}
                                                alt={img.altText || `Image ${actualIndex + 1}`}
                                                className='w-full h-full object-cover'
                                                onError={(e) => {
                                                    if (e.currentTarget.src !== PlaceHolderProduct) {
                                                        e.currentTarget.src = PlaceHolderProduct
                                                    }
                                                }}
                                            />
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Next Button */}
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={() => handleImageNavigation('next')}
                                className='shrink-0'
                            >
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className='space-y-6 col-span-4'>
                    {/* Price */}
                    <div className='flex items-baseline gap-2'>
                        <span className='text-4xl font-bold text-primary'>{formatCurrency(product.price || 0)}</span>
                        {product.unit && <span className='text-lg text-muted-foreground'>/ {product.unit}</span>}
                    </div>

                    <Separator />

                    {/* Product Details */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                            <Package className='h-5 w-5 text-muted-foreground' />
                            <div>
                                <span className='text-sm text-muted-foreground'>Tình trạng:</span>
                                <span className='ml-2 font-medium'>
                                    {isOutOfStock ? (
                                        <Badge variant='destructive'>Hết hàng</Badge>
                                    ) : isLowStock ? (
                                        <Badge variant='secondary'>
                                            Còn {product.quantity} {product.unit}
                                        </Badge>
                                    ) : (
                                        <Badge variant='default'>Còn hàng</Badge>
                                    )}
                                </span>
                            </div>
                        </div>

                        {product.origin && (
                            <div className='flex items-center gap-3'>
                                <MapPin className='h-5 w-5 text-muted-foreground' />
                                <div>
                                    <span className='text-sm text-muted-foreground'>Xuất xứ:</span>
                                    <span className='ml-2 font-medium'>{product.origin}</span>
                                </div>
                            </div>
                        )}

                        {certifications.length > 0 && (
                            <div className='flex items-center gap-3'>
                                <Award className='h-5 w-5 text-muted-foreground' />
                                <div>
                                    <span className='text-sm text-muted-foreground'>Chứng nhận:</span>
                                    <span className='ml-2 font-medium'>{certifications.length} chứng nhận</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Quantity Selector */}
                    {!isOutOfStock && (
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Số lượng:</label>
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center border rounded-lg'>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className='h-4 w-4' />
                                    </Button>
                                    <span className='w-16 text-center font-medium'>{quantity}</span>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= product.quantity}
                                    >
                                        <Plus className='h-4 w-4' />
                                    </Button>
                                </div>
                                <span className='text-sm text-muted-foreground'>
                                    {product.quantity} {product.unit} có sẵn
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className='flex gap-3'>
                        <Button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || isAddingToCart}
                            variant='outline'
                            className='flex-1'
                        >
                            <ShoppingCart className='h-4 w-4 mr-2' />
                            Thêm vào giỏ
                        </Button>
                        <Button onClick={handleBuyNow} disabled={isOutOfStock || isAddingToCart} className='flex-1'>
                            Mua ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* Additional Information Tabs */}
            <Card>
                <CardContent className='pt-6'>
                    <Tabs defaultValue='description'>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='description'>Mô tả chi tiết</TabsTrigger>
                            <TabsTrigger value='specs'>Thông tin sản phẩm</TabsTrigger>
                        </TabsList>
                        <TabsContent value='description' className='space-y-4 mt-6'>
                            {product.description ? (
                                <div className='prose prose-sm max-w-none'>
                                    <p>{product.description}</p>
                                </div>
                            ) : (
                                <p className='text-muted-foreground text-center py-8'>
                                    Chưa có mô tả chi tiết cho sản phẩm này
                                </p>
                            )}
                        </TabsContent>
                        <TabsContent value='specs' className='space-y-4 mt-6'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <span className='text-sm text-muted-foreground'>Tên sản phẩm:</span>
                                    <p className='font-medium'>{product.name}</p>
                                </div>
                                {product.unit && (
                                    <div>
                                        <span className='text-sm text-muted-foreground'>Đơn vị:</span>
                                        <p className='font-medium'>{product.unit}</p>
                                    </div>
                                )}
                                {product.origin && (
                                    <div>
                                        <span className='text-sm text-muted-foreground'>Xuất xứ:</span>
                                        <p className='font-medium'>{product.origin}</p>
                                    </div>
                                )}
                                <div>
                                    <span className='text-sm text-muted-foreground'>Số lượng còn:</span>
                                    <p className='font-medium'>
                                        {product.quantity} {product.unit}
                                    </p>
                                </div>
                                <div>
                                    <span className='text-sm text-muted-foreground'>Đã bán:</span>
                                    <p className='font-medium'>{product.sold || 0}</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Product Certifications */}
            {certifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <FileCheck className='h-5 w-5' />
                            Chứng nhận sản phẩm
                        </CardTitle>
                        <CardDescription>Sản phẩm này có {certifications.length} chứng nhận chất lượng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid md:grid-cols-2 gap-6'>
                            {certifications.map((cert) => (
                                <Card key={cert.id} className='overflow-hidden'>
                                    <CardHeader>
                                        <CardTitle className='text-lg flex items-center gap-2'>
                                            <Award className='h-5 w-5 text-primary' />
                                            {cert.certName}
                                        </CardTitle>
                                        {cert.issuer && <CardDescription>Cấp bởi: {cert.issuer}</CardDescription>}
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        {cert.description && (
                                            <p className='text-sm text-muted-foreground'>{cert.description}</p>
                                        )}

                                        <div className='grid grid-cols-2 gap-3 text-sm'>
                                            {cert.issueDate && (
                                                <div className='flex items-center gap-2'>
                                                    <Calendar className='h-4 w-4 text-muted-foreground' />
                                                    <div>
                                                        <p className='text-muted-foreground'>Ngày cấp:</p>
                                                        <p className='font-medium'>{formatDate(cert.issueDate)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {cert.expiryDate && (
                                                <div className='flex items-center gap-2'>
                                                    <Calendar className='h-4 w-4 text-muted-foreground' />
                                                    <div>
                                                        <p className='text-muted-foreground'>Hết hạn:</p>
                                                        <p className='font-medium'>{formatDate(cert.expiryDate)}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {cert.fileUrl && (
                                            <div className='border rounded-lg overflow-hidden'>
                                                <img
                                                    src={cert.fileUrl}
                                                    alt={cert.certName}
                                                    className='w-full h-48 object-cover hover:scale-105 transition-transform duration-200 cursor-pointer'
                                                    onClick={() => window.open(cert.fileUrl!, '_blank')}
                                                    onError={(e) => {
                                                        // If image fails to load, show file icon
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                                <div className='p-3 bg-muted'>
                                                    <Button variant='link' className='p-0 h-auto' asChild>
                                                        <a
                                                            href={cert.fileUrl}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                        >
                                                            Xem chứng nhận
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
