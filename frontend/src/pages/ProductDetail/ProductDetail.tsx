//TODO: fix repeatedly calls setState error
import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useProduct } from '@/hooks/useProduct'
import { useProductImages } from '@/hooks/useProductImage'
import { useProductCertifications } from '@/hooks/useProductCertification'
import useCartStore, { selectCartActions } from '@/store/useCartStore'
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
    AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [quantity, setQuantity] = useState(1)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    const { product, isLoading, isError } = useProduct(id)
    const { images } = useProductImages(id)
    const { certifications } = useProductCertifications(id)
    const { addItem } = useCartStore(selectCartActions)

    // Get primary image or first image
    const displayImages = useMemo(() => {
        if (!images || images.length === 0) return [{ imageUrl: '/placeholder-product.png', altText: 'Product' }]
        const sorted = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        return sorted
    }, [images])

    const selectedImage = displayImages[selectedImageIndex]

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

    const isOutOfStock = product.quantity && product.quantity <= 0
    const isLowStock = product.quantity > 0 && product.quantity <= 10

    return (
        <div className='container mx-auto py-6 space-y-6'>
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
            <div className='grid md:grid-cols-2 gap-8'>
                {/* Image Gallery */}
                <div className='space-y-4'>
                    <Card className='overflow-hidden'>
                        <CardContent className='p-0'>
                            <div className='relative aspect-square bg-muted'>
                                <img
                                    src={selectedImage.imageUrl}
                                    alt={selectedImage.altText || product.name}
                                    className='w-full h-full object-cover'
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder-product.png'
                                    }}
                                />
                                {isOutOfStock && (
                                    <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                                        <Badge variant='destructive' className='text-lg px-4 py-2'>
                                            Hết hàng
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thumbnail Gallery */}
                    {displayImages.length > 1 && (
                        <div className='flex gap-2 overflow-x-auto pb-2'>
                            {displayImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImageIndex(index)}
                                    className={`shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                        index === selectedImageIndex
                                            ? 'border-primary'
                                            : 'border-transparent hover:border-muted-foreground'
                                    }`}
                                >
                                    <img
                                        src={img.imageUrl}
                                        alt={img.altText || `Image ${index + 1}`}
                                        className='w-full h-full object-cover'
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className='space-y-6'>
                    <div>
                        <h1 className='text-3xl font-bold mb-2'>{product.name}</h1>
                        {product.description && <p className='text-muted-foreground'>{product.description}</p>}
                    </div>

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
