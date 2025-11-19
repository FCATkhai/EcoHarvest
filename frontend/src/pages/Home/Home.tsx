import { Link } from 'react-router'
import { useCategories } from '@/hooks/useCategory'
import { useProducts } from '@/hooks/useProduct'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Leaf, Award, Truck, Shield, ArrowRight, Star } from 'lucide-react'
import AppPath from '@/constants/AppPath'
import PlaceHolderProduct from '@/assets/placeholder-product.svg'

export default function Home() {
    const { categories } = useCategories()
    const { products: featuredProducts, isLoading } = useProducts({ limit: 8, sort_by: 'created_at', sort: 'desc' })

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Number(amount))
    }

    return (
        <div className='min-h-screen'>
            {/* Hero Section */}
            <section className='bg-linear-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 py-20'>
                <div className='container mx-auto px-4'>
                    <div className='grid md:grid-cols-2 gap-12 items-center'>
                        <div className='space-y-6'>
                            <div className='inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium'>
                                <Leaf className='h-4 w-4' />
                                Nông sản sạch 100% organic
                            </div>
                            <h1 className='text-5xl font-bold text-gray-900 dark:text-white leading-tight'>
                                Nông Sản Sạch
                                <br />
                                <span className='text-green-600 dark:text-green-400'>Từ Trang Trại</span>
                                <br />
                                Đến Bàn Ăn
                            </h1>
                            <p className='text-xl text-gray-600 dark:text-gray-300'>
                                Chuyên cung cấp rau củ quả tươi ngon, an toàn, được trồng theo phương pháp hữu cơ và
                                kiểm định chất lượng nghiêm ngặt.
                            </p>
                            <div className='flex gap-4'>
                                <Button asChild size='lg' className='text-lg px-8'>
                                    <Link to={AppPath.products}>
                                        Mua sắm ngay
                                        <ArrowRight className='ml-2 h-5 w-5' />
                                    </Link>
                                </Button>
                                <Button asChild size='lg' variant='outline' className='text-lg px-8'>
                                    <Link to={AppPath.products}>Khám phá sản phẩm</Link>
                                </Button>
                            </div>
                        </div>
                        <div className='relative'>
                            <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
                                <img
                                    src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop'
                                    alt='Fresh organic vegetables'
                                    className='w-full h-[500px] object-cover'
                                    onError={(e) => {
                                        e.currentTarget.src = PlaceHolderProduct
                                    }}
                                />
                                <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent' />
                            </div>
                            <div className='absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg'>
                                <div className='flex items-center gap-3'>
                                    <div className='bg-green-100 dark:bg-green-900 p-3 rounded-full'>
                                        <Award className='h-8 w-8 text-green-600 dark:text-green-400' />
                                    </div>
                                    <div>
                                        <div className='text-2xl font-bold text-gray-900 dark:text-white'>100%</div>
                                        <div className='text-sm text-gray-600 dark:text-gray-300'>
                                            Chứng nhận organic
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='py-16 bg-white dark:bg-gray-900'>
                <div className='container mx-auto px-4'>
                    <div className='grid md:grid-cols-4 gap-8'>
                        <Card className='border-none shadow-md hover:shadow-xl transition-shadow'>
                            <CardContent className='pt-6 text-center space-y-3'>
                                <div className='w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                                    <Leaf className='h-8 w-8 text-green-600 dark:text-green-400' />
                                </div>
                                <h3 className='font-semibold text-lg'>100% Organic</h3>
                                <p className='text-sm text-muted-foreground'>
                                    Không sử dụng hóa chất, thuốc trừ sâu độc hại
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='border-none shadow-md hover:shadow-xl transition-shadow'>
                            <CardContent className='pt-6 text-center space-y-3'>
                                <div className='w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
                                    <Shield className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                                </div>
                                <h3 className='font-semibold text-lg'>An Toàn</h3>
                                <p className='text-sm text-muted-foreground'>
                                    Kiểm định chất lượng nghiêm ngặt, đảm bảo vệ sinh an toàn thực phẩm
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='border-none shadow-md hover:shadow-xl transition-shadow'>
                            <CardContent className='pt-6 text-center space-y-3'>
                                <div className='w-16 h-16 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center'>
                                    <Truck className='h-8 w-8 text-orange-600 dark:text-orange-400' />
                                </div>
                                <h3 className='font-semibold text-lg'>Giao Hàng Nhanh</h3>
                                <p className='text-sm text-muted-foreground'>
                                    Giao hàng tận nơi trong ngày, đảm bảo độ tươi ngon
                                </p>
                            </CardContent>
                        </Card>

                        <Card className='border-none shadow-md hover:shadow-xl transition-shadow'>
                            <CardContent className='pt-6 text-center space-y-3'>
                                <div className='w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center'>
                                    <Award className='h-8 w-8 text-purple-600 dark:text-purple-400' />
                                </div>
                                <h3 className='font-semibold text-lg'>Chứng Nhận</h3>
                                <p className='text-sm text-muted-foreground'>
                                    Có đầy đủ giấy chứng nhận VietGAP, GlobalGAP
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className='py-16 bg-gray-50 dark:bg-gray-950'>
                <div className='container mx-auto px-4'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold mb-4'>Danh Mục Sản Phẩm</h2>
                        <p className='text-muted-foreground text-lg'>Khám phá các loại nông sản sạch của chúng tôi</p>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'>
                        {categories.slice(0, 6).map((category) => (
                            <Link
                                key={category.id}
                                to={`${AppPath.products}?categoryId=${category.id}`}
                                className='group'
                            >
                                <Card className='hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer'>
                                    <CardContent className='pt-6 text-center'>
                                        <div className='w-20 h-20 mx-auto mb-3 bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform'>
                                            <Leaf className='h-10 w-10 text-green-600 dark:text-green-400' />
                                        </div>
                                        <h3 className='font-semibold text-sm'>{category.name}</h3>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                    <div className='text-center mt-8'>
                        <Button asChild variant='outline' size='lg'>
                            <Link to={AppPath.products}>
                                Xem tất cả danh mục
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className='py-16 bg-white dark:bg-gray-900'>
                <div className='container mx-auto px-4'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold mb-4'>Sản Phẩm Nổi Bật</h2>
                        <p className='text-muted-foreground text-lg'>Những sản phẩm mới nhất và được yêu thích nhất</p>
                    </div>

                    {isLoading ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className='animate-pulse'>
                                    <CardContent className='p-0'>
                                        <div className='h-48 bg-muted' />
                                        <div className='p-4 space-y-3'>
                                            <div className='h-4 bg-muted rounded' />
                                            <div className='h-4 bg-muted rounded w-2/3' />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                            {featuredProducts.map((product) => (
                                <Link key={product.id} to={AppPath.productDetail(product.id)}>
                                    <Card className='hover:shadow-xl transition-all hover:-translate-y-1 h-full'>
                                        <CardHeader className='p-0'>
                                            <div className='relative aspect-square overflow-hidden rounded-t-lg'>
                                                <img
                                                    src={
                                                        (product.image as any)?.imageUrl ||
                                                        (product.images && product.images[0]?.imageUrl) ||
                                                        PlaceHolderProduct
                                                    }
                                                    alt={product.name}
                                                    className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                                                    onError={(e) => {
                                                        if (e.currentTarget.src !== PlaceHolderProduct) {
                                                            e.currentTarget.src = PlaceHolderProduct
                                                        }
                                                    }}
                                                />
                                                {product.quantity <= 0 && (
                                                    <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                                                        <Badge variant='destructive'>Hết hàng</Badge>
                                                    </div>
                                                )}
                                                {product.quantity > 0 && product.quantity <= 10 && (
                                                    <Badge className='absolute top-2 right-2' variant='secondary'>
                                                        Sắp hết
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className='p-4'>
                                            <h3 className='font-semibold line-clamp-2 mb-2'>{product.name}</h3>
                                            <div className='flex items-center gap-1 mb-2'>
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                                                ))}
                                                <span className='text-xs text-muted-foreground ml-1'>
                                                    (Đã bán {product.sold || 0})
                                                </span>
                                            </div>
                                            <div className='flex items-baseline gap-2'>
                                                <span className='text-xl font-bold text-primary'>
                                                    {formatCurrency(product.price || 0)}
                                                </span>
                                                {product.unit && (
                                                    <span className='text-sm text-muted-foreground'>
                                                        / {product.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className='p-4 pt-0'>
                                            <Button className='w-full' disabled={product.quantity <= 0}>
                                                <ShoppingCart className='h-4 w-4 mr-2' />
                                                {product.quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className='text-center mt-12'>
                        <Button asChild size='lg'>
                            <Link to={AppPath.products}>
                                Xem tất cả sản phẩm
                                <ArrowRight className='ml-2 h-4 w-4' />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-20 bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-800 dark:to-emerald-800'>
                <div className='container mx-auto px-4 text-center text-white'>
                    <h2 className='text-4xl font-bold mb-4'>Bắt Đầu Mua Sắm Ngay Hôm Nay</h2>
                    <p className='text-xl mb-8 opacity-90'>
                        Đăng ký ngay để nhận ưu đãi đặc biệt và cập nhật sản phẩm mới nhất
                    </p>
                    <div className='flex justify-center gap-4'>
                        <Button asChild size='lg' variant='secondary' className='text-lg px-8'>
                            <Link to={AppPath.signUp}>Đăng ký ngay</Link>
                        </Button>
                        <Button asChild size='lg' variant='default' className='text-lg px-8'>
                            <Link to={AppPath.products}>Khám phá ngay</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
