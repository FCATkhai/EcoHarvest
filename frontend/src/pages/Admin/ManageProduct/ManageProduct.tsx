import { useState } from 'react'
import { useProducts } from '@/hooks/useProduct'
import { useCategories } from '@/hooks/useCategory'
import { useSubCategories } from '@/hooks/useSubcategory'
import { useProductImages } from '@/hooks/useProductImage'
import { useProductCertifications } from '@/hooks/useProductCertification'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus, Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product, ProductImage, ProductCertification } from '@/types/schema.type'
import { supabase } from '@/lib/supabase'
import { SUPABASE_BUCKETS } from '@/constants/supabaseBucket'

export default function ManageProduct() {
    const { products, isLoading, createProduct, updateProduct, deleteProduct, creating, updating, deleting } =
        useProducts()
    const { categories } = useCategories()

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [manageImagesDialogOpen, setManageImagesDialogOpen] = useState(false)
    const [manageCertsDialogOpen, setManageCertsDialogOpen] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        subCategoryId: '',
        price: '',
        unit: '',
        origin: '',
        status: '1'
    })
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
    const [selectedProductForImages, setSelectedProductForImages] = useState<Product | null>(null)
    const [selectedProductForCerts, setSelectedProductForCerts] = useState<Product | null>(null)

    // Subcategory selection
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const { subCategories } = useSubCategories(selectedCategoryId ?? 0, { enabled: !!selectedCategoryId })

    // Handlers
    const handleCreate = async () => {
        if (!formData.name.trim() || !formData.subCategoryId) {
            toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
            return
        }
        try {
            await createProduct({
                name: formData.name,
                description: formData.description,
                categoryId: formData.categoryId,
                price: formData.price,
                unit: formData.unit,
                origin: formData.origin,
                status: formData.status,
                quantity: 0
            })
            toast.success('Tạo sản phẩm thành công!')
            setCreateDialogOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi tạo sản phẩm')
        }
    }

    const handleEdit = async () => {
        if (!editingProduct || !formData.name.trim()) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }
        try {
            await updateProduct({
                id: editingProduct.id,
                data: {
                    name: formData.name,
                    description: formData.description,
                    categoryId: formData.categoryId,
                    price: formData.price,
                    unit: formData.unit,
                    origin: formData.origin,
                    status: formData.status
                }
            })
            toast.success('Cập nhật sản phẩm thành công!')
            setEditDialogOpen(false)
            setEditingProduct(null)
            resetForm()
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm')
        }
    }

    const handleDelete = async () => {
        if (!deletingProduct) return
        try {
            await deleteProduct(deletingProduct.id)
            toast.success('Xóa sản phẩm thành công!')
            setDeleteDialogOpen(false)
            setDeletingProduct(null)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xóa sản phẩm')
        }
    }

    const openCreateDialog = () => {
        resetForm()
        setCreateDialogOpen(true)
    }

    const openEditDialog = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description || '',
            categoryId: String(product.categoryId),
            subCategoryId: '',
            price: String(product.price || ''),
            unit: product.unit || '',
            origin: product.origin || '',
            status: String(product.status)
        })
        setSelectedCategoryId(product.categoryId)
        setEditDialogOpen(true)
    }

    const openDeleteDialog = (product: Product) => {
        setDeletingProduct(product)
        setDeleteDialogOpen(true)
    }

    const openManageImages = (product: Product) => {
        setSelectedProductForImages(product)
        setManageImagesDialogOpen(true)
    }

    const openManageCerts = (product: Product) => {
        setSelectedProductForCerts(product)
        setManageCertsDialogOpen(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            categoryId: '',
            subCategoryId: '',
            price: '',
            unit: '',
            origin: '',
            status: '1'
        })
        setSelectedCategoryId(null)
    }

    const handleCategoryChange = (value: string) => {
        setFormData({ ...formData, categoryId: value, subCategoryId: '' })
        setSelectedCategoryId(Number(value))
    }

    if (isLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <p className='text-muted-foreground'>Đang tải sản phẩm...</p>
            </div>
        )
    }

    return (
        <div className='container mx-auto py-8'>
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle>Quản lý sản phẩm</CardTitle>
                            <CardDescription>Thêm, sửa, xóa sản phẩm và quản lý hình ảnh, chứng nhận</CardDescription>
                        </div>
                        <Button onClick={openCreateDialog}>
                            <Plus className='mr-2 h-4 w-4' />
                            Thêm sản phẩm
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên sản phẩm</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Số lượng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className='text-right'>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className='text-center text-muted-foreground'>
                                        Chưa có sản phẩm nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className='font-medium'>{product.name}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('vi-VN').format(Number(product.price || 0))} đ
                                        </TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === 1 ? 'default' : 'secondary'}>
                                                {product.status === 1 ? 'Hoạt động' : 'Ẩn'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex justify-end gap-2'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => openManageImages(product)}
                                                    title='Quản lý hình ảnh'
                                                >
                                                    <ImageIcon className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => openManageCerts(product)}
                                                    title='Quản lý chứng nhận'
                                                >
                                                    <FileText className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => openEditDialog(product)}
                                                >
                                                    <Pencil className='h-4 w-4' />
                                                </Button>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => openDeleteDialog(product)}
                                                >
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Thêm sản phẩm mới</DialogTitle>
                        <DialogDescription>Nhập thông tin sản phẩm</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='create-name'>Tên sản phẩm *</Label>
                            <Input
                                id='create-name'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder='Ví dụ: Cà chua hữu cơ'
                            />
                        </div>
                        <div>
                            <Label htmlFor='create-desc'>Mô tả</Label>
                            <Textarea
                                id='create-desc'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder='Mô tả chi tiết về sản phẩm...'
                                rows={3}
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='create-category'>Danh mục *</Label>
                                <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                                    <SelectTrigger id='create-category'>
                                        <SelectValue placeholder='Chọn danh mục' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor='create-subcategory'>Danh mục con *</Label>
                                <Select
                                    value={formData.subCategoryId}
                                    onValueChange={(val) => setFormData({ ...formData, subCategoryId: val })}
                                    disabled={!selectedCategoryId}
                                >
                                    <SelectTrigger id='create-subcategory'>
                                        <SelectValue placeholder='Chọn danh mục con' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subCategories.map((sub) => (
                                            <SelectItem key={sub.id} value={String(sub.id)}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='create-price'>Giá (VNĐ)</Label>
                                <Input
                                    id='create-price'
                                    type='number'
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder='50000'
                                />
                            </div>
                            <div>
                                <Label htmlFor='create-unit'>Đơn vị</Label>
                                <Input
                                    id='create-unit'
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    placeholder='kg, gói, hộp'
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='create-origin'>Xuất xứ</Label>
                                <Input
                                    id='create-origin'
                                    value={formData.origin}
                                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                    placeholder='Đà Lạt, Việt Nam'
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor='create-status'>Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger id='create-status'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='1'>Hoạt động</SelectItem>
                                    <SelectItem value='0'>Ẩn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setCreateDialogOpen(false)} disabled={creating}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? 'Đang tạo...' : 'Tạo sản phẩm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
                        <DialogDescription>Cập nhật thông tin sản phẩm</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='edit-name'>Tên sản phẩm *</Label>
                            <Input
                                id='edit-name'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor='edit-desc'>Mô tả</Label>
                            <Textarea
                                id='edit-desc'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='edit-category'>Danh mục</Label>
                                <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                                    <SelectTrigger id='edit-category'>
                                        <SelectValue placeholder='Chọn danh mục' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor='edit-subcategory'>Danh mục con</Label>
                                <Select
                                    value={formData.subCategoryId}
                                    onValueChange={(val) => setFormData({ ...formData, subCategoryId: val })}
                                    disabled={!selectedCategoryId}
                                >
                                    <SelectTrigger id='edit-subcategory'>
                                        <SelectValue placeholder='Chọn danh mục con' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subCategories.map((sub) => (
                                            <SelectItem key={sub.id} value={String(sub.id)}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='edit-price'>Giá (VNĐ)</Label>
                                <Input
                                    id='edit-price'
                                    type='number'
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor='edit-unit'>Đơn vị</Label>
                                <Input
                                    id='edit-unit'
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label htmlFor='edit-origin'>Xuất xứ</Label>
                                <Input
                                    id='edit-origin'
                                    value={formData.origin}
                                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor='edit-status'>Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger id='edit-status'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='1'>Hoạt động</SelectItem>
                                    <SelectItem value='0'>Ẩn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setEditDialogOpen(false)} disabled={updating}>
                            Hủy
                        </Button>
                        <Button onClick={handleEdit} disabled={updating}>
                            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa sản phẩm <strong>{deletingProduct?.name}</strong>? Hành động này
                            không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Manage Images Dialog */}
            {selectedProductForImages && (
                <ManageImagesDialog
                    product={selectedProductForImages}
                    open={manageImagesDialogOpen}
                    onOpenChange={setManageImagesDialogOpen}
                />
            )}

            {/* Manage Certifications Dialog */}
            {selectedProductForCerts && (
                <ManageCertificationsDialog
                    product={selectedProductForCerts}
                    open={manageCertsDialogOpen}
                    onOpenChange={setManageCertsDialogOpen}
                />
            )}
        </div>
    )
}

// Manage Images Dialog Component
function ManageImagesDialog({
    product,
    open,
    onOpenChange
}: {
    product: Product
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { images, createImage, removeImage, creating, deleting } = useProductImages(product.id)
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${product.id}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError, data } = await supabase.storage
                .from(SUPABASE_BUCKETS.PRODUCT_IMAGES)
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const {
                data: { publicUrl }
            } = supabase.storage.from(SUPABASE_BUCKETS.PRODUCT_IMAGES).getPublicUrl(filePath)

            await createImage({
                productId: product.id,
                fileUrl: publicUrl,
                isPrimary,
                altText: file.name
            })

            toast.success('Tải ảnh lên thành công!')
            e.target.value = ''
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi khi tải ảnh lên')
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = async (image: ProductImage) => {
        try {
            await removeImage({ id: image.id, productId: product.id })
            toast.success('Xóa ảnh thành công!')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi khi xóa ảnh')
        }
    }

    const primaryImage = images.find((img) => img.isPrimary)
    const otherImages = images.filter((img) => !img.isPrimary)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Quản lý hình ảnh - {product.name}</DialogTitle>
                    <DialogDescription>Thêm, xóa hình ảnh sản phẩm</DialogDescription>
                </DialogHeader>
                <div className='space-y-6'>
                    {/* Primary Image */}
                    <div>
                        <Label>Ảnh chính</Label>
                        <div className='mt-2 flex items-center gap-4'>
                            {primaryImage ? (
                                <div className='relative group'>
                                    <img
                                        src={primaryImage.imageUrl}
                                        alt='Primary'
                                        className='h-32 w-32 rounded object-cover border'
                                    />
                                    <Button
                                        variant='destructive'
                                        size='sm'
                                        className='absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100'
                                        onClick={() => handleRemove(primaryImage)}
                                        disabled={deleting}
                                    >
                                        <X className='h-4 w-4' />
                                    </Button>
                                </div>
                            ) : (
                                <label className='flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed hover:bg-muted'>
                                    <Upload className='h-8 w-8 text-muted-foreground' />
                                    <span className='mt-2 text-xs text-muted-foreground'>Tải ảnh chính</span>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        className='hidden'
                                        onChange={(e) => handleUpload(e, true)}
                                        disabled={uploading || creating}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Other Images */}
                    <div>
                        <Label>Ảnh khác</Label>
                        <div className='mt-2 grid grid-cols-4 gap-4'>
                            {otherImages.map((image) => (
                                <div key={image.id} className='relative group'>
                                    <img
                                        src={image.imageUrl}
                                        alt='Product'
                                        className='h-32 w-full rounded object-cover border'
                                    />
                                    <Button
                                        variant='destructive'
                                        size='sm'
                                        className='absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100'
                                        onClick={() => handleRemove(image)}
                                        disabled={deleting}
                                    >
                                        <X className='h-4 w-4' />
                                    </Button>
                                </div>
                            ))}
                            <label className='flex h-32 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed hover:bg-muted'>
                                <Upload className='h-8 w-8 text-muted-foreground' />
                                <span className='mt-2 text-xs text-muted-foreground'>Thêm ảnh</span>
                                <input
                                    type='file'
                                    accept='image/*'
                                    className='hidden'
                                    onChange={(e) => handleUpload(e, false)}
                                    disabled={uploading || creating}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Manage Certifications Dialog Component
function ManageCertificationsDialog({
    product,
    open,
    onOpenChange
}: {
    product: Product
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { certifications, createCertification, removeCertification, creating, deleting } = useProductCertifications(
        product.id
    )
    const [uploading, setUploading] = useState(false)
    const [certForm, setCertForm] = useState({
        certName: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        description: ''
    })

    const handleUploadCert = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!certForm.certName.trim()) {
            toast.error('Vui lòng nhập tên chứng nhận trước')
            return
        }

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${product.id}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(SUPABASE_BUCKETS.PRODUCT_CERTIFICATIONS)
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const {
                data: { publicUrl }
            } = supabase.storage.from(SUPABASE_BUCKETS.PRODUCT_CERTIFICATIONS).getPublicUrl(filePath)

            await createCertification({
                productId: product.id,
                certName: certForm.certName,
                issuer: certForm.issuer || undefined,
                issueDate: certForm.issueDate || undefined,
                expiryDate: certForm.expiryDate || undefined,
                description: certForm.description || undefined,
                fileUrl: publicUrl
            })

            toast.success('Thêm chứng nhận thành công!')
            setCertForm({
                certName: '',
                issuer: '',
                issueDate: '',
                expiryDate: '',
                description: ''
            })
            e.target.value = ''
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi khi thêm chứng nhận')
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = async (cert: ProductCertification) => {
        try {
            await removeCertification({ id: cert.id, productId: product.id })
            toast.success('Xóa chứng nhận thành công!')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi khi xóa chứng nhận')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Quản lý chứng nhận - {product.name}</DialogTitle>
                    <DialogDescription>Thêm, xóa chứng nhận sản phẩm</DialogDescription>
                </DialogHeader>
                <div className='space-y-6'>
                    {/* Add Certification Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-base'>Thêm chứng nhận mới</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div>
                                <Label htmlFor='cert-name'>Tên chứng nhận *</Label>
                                <Input
                                    id='cert-name'
                                    value={certForm.certName}
                                    onChange={(e) => setCertForm({ ...certForm, certName: e.target.value })}
                                    placeholder='VD: Chứng nhận hữu cơ VietGAP'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='cert-issuer'>Đơn vị cấp</Label>
                                    <Input
                                        id='cert-issuer'
                                        value={certForm.issuer}
                                        onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                                        placeholder='Bộ Nông nghiệp'
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='cert-issue-date'>Ngày cấp</Label>
                                    <Input
                                        id='cert-issue-date'
                                        type='date'
                                        value={certForm.issueDate}
                                        onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='cert-expiry-date'>Ngày hết hạn</Label>
                                    <Input
                                        id='cert-expiry-date'
                                        type='date'
                                        value={certForm.expiryDate}
                                        onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor='cert-file'>File chứng nhận</Label>
                                    <Input
                                        id='cert-file'
                                        type='file'
                                        accept='.pdf,.jpg,.jpeg,.png'
                                        onChange={handleUploadCert}
                                        disabled={uploading || creating}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor='cert-desc'>Mô tả</Label>
                                <Textarea
                                    id='cert-desc'
                                    value={certForm.description}
                                    onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                                    placeholder='Mô tả chi tiết về chứng nhận...'
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* List Certifications */}
                    <div>
                        <Label>Danh sách chứng nhận ({certifications.length})</Label>
                        <div className='mt-2 space-y-2'>
                            {certifications.length === 0 ? (
                                <p className='text-sm text-muted-foreground'>Chưa có chứng nhận nào</p>
                            ) : (
                                certifications.map((cert) => (
                                    <Card key={cert.id}>
                                        <CardContent className='flex items-start justify-between p-4'>
                                            <div className='flex-1'>
                                                <p className='font-medium'>{cert.certName}</p>
                                                {cert.issuer && (
                                                    <p className='text-sm text-muted-foreground'>
                                                        Đơn vị cấp: {cert.issuer}
                                                    </p>
                                                )}
                                                {cert.issueDate && (
                                                    <p className='text-sm text-muted-foreground'>
                                                        Ngày cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN')}
                                                    </p>
                                                )}
                                                {cert.fileUrl && (
                                                    <a
                                                        href={cert.fileUrl}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='text-sm text-blue-600 hover:underline'
                                                    >
                                                        Xem file
                                                    </a>
                                                )}
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => handleRemove(cert)}
                                                disabled={deleting}
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
