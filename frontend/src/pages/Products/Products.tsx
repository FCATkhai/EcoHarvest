import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useProducts } from '@/hooks/useProduct'
import { useCategories } from '@/hooks/useCategory'
import { useSubCategories } from '@/hooks/useSubcategory'
import FindProducts from '@/components/FindProducts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis
} from '@/components/ui/pagination'
import { ChevronDown, ShoppingCart, Filter, ArrowUpDown } from 'lucide-react'
import type { Product } from '@/types/schema.type'
import PlaceHoderProduct from '@/assets/placeholder-product.svg'

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams()

    // Extract query params
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 12
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const subCategoryId = searchParams.get('subCategoryId') || ''
    const sortBy = (searchParams.get('sort_by') as 'price' | 'created_at') || 'created_at'
    const sortOrder = (searchParams.get('sort') as 'asc' | 'desc') || 'desc'

    const { categories } = useCategories()
    const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null)
    const { subCategories } = useSubCategories(hoveredCategoryId || 0, {
        enabled: !!hoveredCategoryId
    })

    // Fetch products with filters
    const { products, total, totalPages, isLoading } = useProducts({
        page,
        limit,
        search,
        categoryId: categoryId || undefined,
        subCategoryId: subCategoryId || undefined,
        sort_by: sortBy,
        sort: sortOrder
    })

    // Get selected category/subcategory names for display
    const selectedCategory = useMemo(
        () => categories.find((c) => String(c.id) === categoryId),
        [categories, categoryId]
    )

    // Update URL params
    const updateParams = (updates: Record<string, string | number | undefined>) => {
        const newParams = new URLSearchParams(searchParams)
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === '') {
                newParams.delete(key)
            } else {
                newParams.set(key, String(value))
            }
        })
        setSearchParams(newParams)
    }

    const handleSearch = (searchTerm: string) => {
        updateParams({ search: searchTerm, page: 1 })
    }

    const handleCategorySelect = (catId: number) => {
        updateParams({ categoryId: catId, subCategoryId: undefined, page: 1 })
    }

    const handleSubCategorySelect = (subCatId: number) => {
        updateParams({ subCategoryId: subCatId, page: 1 })
    }

    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split('-')
        updateParams({ sort_by: newSortBy, sort: newSortOrder, page: 1 })
    }

    const handlePageChange = (newPage: number) => {
        updateParams({ page: newPage })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const clearFilters = () => {
        setSearchParams({})
    }

    const hasActiveFilters = search || categoryId || subCategoryId

    return (
        <div className='container mx-auto py-6 space-y-6'>
            {/* Header */}
            <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tight'>Sản Phẩm</h1>
                <p className='text-muted-foreground'>Khám phá các sản phẩm nông sản sạch của chúng tôi</p>
            </div>

            {/* Category Navigation Bar */}
            <Card>
                <CardContent className='py-4'>
                    <div className='flex items-center gap-4 flex-wrap'>
                        <div className='flex items-center gap-2'>
                            <Filter className='h-5 w-5 text-muted-foreground' />
                            <span className='font-medium'>Danh mục:</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' className='gap-2'>
                                    {selectedCategory ? selectedCategory.name : 'Tất cả danh mục'}
                                    <ChevronDown className='h-4 w-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-56'>
                                <DropdownMenuItem onClick={clearFilters}>Tất cả danh mục</DropdownMenuItem>
                                {categories.map((category) => (
                                    <DropdownMenuSub key={category.id}>
                                        <DropdownMenuSubTrigger
                                            onMouseEnter={() => setHoveredCategoryId(category.id)}
                                            onClick={() => handleCategorySelect(category.id)}
                                        >
                                            {category.name}
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            {hoveredCategoryId === category.id &&
                                                subCategories.map((subCat) => (
                                                    <DropdownMenuItem
                                                        key={subCat.id}
                                                        onClick={() => {
                                                            handleCategorySelect(category.id)
                                                            handleSubCategorySelect(subCat.id)
                                                        }}
                                                    >
                                                        {subCat.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            {hoveredCategoryId === category.id && subCategories.length === 0 && (
                                                <DropdownMenuItem disabled>Không có danh mục con</DropdownMenuItem>
                                            )}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {hasActiveFilters && (
                            <Button variant='ghost' size='sm' onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Search and Sort Bar */}
            <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                    <FindProducts onSearch={handleSearch} />
                </div>
                <div className='flex items-center gap-2'>
                    <ArrowUpDown className='h-4 w-4 text-muted-foreground' />
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                        <SelectTrigger className='w-[200px]'>
                            <SelectValue placeholder='Sắp xếp' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='created_at-desc'>Mới nhất</SelectItem>
                            <SelectItem value='created_at-asc'>Cũ nhất</SelectItem>
                            <SelectItem value='price-asc'>Giá tăng dần</SelectItem>
                            <SelectItem value='price-desc'>Giá giảm dần</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-sm text-muted-foreground'>Bộ lọc đang áp dụng:</span>
                    {search && <Badge variant='secondary'>Tìm kiếm: "{search}"</Badge>}
                    {selectedCategory && <Badge variant='secondary'>{selectedCategory.name}</Badge>}
                </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
                <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className='animate-pulse'>
                            <div className='h-48 bg-muted' />
                            <CardHeader>
                                <div className='h-4 bg-muted rounded' />
                            </CardHeader>
                            <CardContent>
                                <div className='h-3 bg-muted rounded mb-2' />
                                <div className='h-3 bg-muted rounded w-2/3' />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <Card>
                    <CardContent className='py-12 text-center'>
                        <ShoppingCart className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>Không tìm thấy sản phẩm</h3>
                        <p className='text-muted-foreground mb-4'>Không có sản phẩm nào phù hợp với bộ lọc của bạn</p>
                        {hasActiveFilters && <Button onClick={clearFilters}>Xóa bộ lọc</Button>}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className='flex items-center justify-between'>
                        <p className='text-sm text-muted-foreground'>
                            Hiển thị {products.length} trong {total} sản phẩm
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Card>
                            <CardContent className='py-4'>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(page - 1)}
                                                className={
                                                    page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                                                }
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                            // Show first, last, current, and adjacent pages
                                            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                                return (
                                                    <PaginationItem key={p}>
                                                        <PaginationLink
                                                            onClick={() => handlePageChange(p)}
                                                            isActive={p === page}
                                                            className='cursor-pointer'
                                                        >
                                                            {p}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                )
                                            } else if (p === page - 2 || p === page + 2) {
                                                return (
                                                    <PaginationItem key={p}>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )
                                            }
                                            return null
                                        })}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(page + 1)}
                                                className={
                                                    page >= totalPages
                                                        ? 'pointer-events-none opacity-50'
                                                        : 'cursor-pointer'
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(Number(amount))
    }

    const imageUrl = product.image?.imageUrl || PlaceHoderProduct
    const isOutOfStock = product.quantity === 0

    return (
        <Card className='group hover:shadow-lg transition-shadow duration-200 flex flex-col pt-0'>
            <Link to={`/products/${product.id}`}>
                <div className='relative overflow-hidden rounded-t-lg'>
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className='w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200'
                        onError={(e) => {
                            e.currentTarget.src = PlaceHoderProduct
                        }}
                    />
                    {isOutOfStock && (
                        <div className='absolute inset-0 bg-black/60 opacity-70 flex items-center justify-center'>
                            <Badge variant='destructive' className='text-sm'>
                                Hết hàng
                            </Badge>
                        </div>
                    )}
                </div>
            </Link>
            <CardHeader className='flex-1'>
                <Link to={`/products/${product.id}`}>
                    <h3 className='font-semibold line-clamp-2 group-hover:text-primary transition-colors'>
                        {product.name}
                    </h3>
                </Link>
            </CardHeader>
            <CardContent className='space-y-2'>
                {product.description && (
                    <p className='text-sm text-muted-foreground line-clamp-2'>{product.description}</p>
                )}
                <div className='flex items-baseline gap-2'>
                    <span className='text-lg font-bold text-primary'>{formatCurrency(product.price || 0)}</span>
                    {product.unit && <span className='text-sm text-muted-foreground'>/ {product.unit}</span>}
                </div>
                {product.origin && <p className='text-xs text-muted-foreground'>Xuất xứ: {product.origin}</p>}
            </CardContent>
            <CardFooter>
                <Button
                    asChild
                    className='w-full'
                    disabled={isOutOfStock}
                    variant={isOutOfStock ? 'secondary' : 'default'}
                >
                    <Link to={`/products/${product.id}`}>
                        <ShoppingCart className='h-4 w-4 mr-2' />
                        {isOutOfStock ? 'Hết hàng' : 'Xem chi tiết'}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
