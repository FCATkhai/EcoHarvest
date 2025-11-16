import { useState } from 'react'
import { useCategories } from '@/hooks/useCategory'
import { useSubCategories } from '@/hooks/useSubcategory'
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
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Category, SubCategory } from '@/types/schema.type'

export default function ManageCategory() {
    const { categories, isLoading, createCategory, updateCategory, deleteCategory, creating, updating, deleting } =
        useCategories()

    // Use subcategory hook for the currently expanded category
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null)
    const {
        createSubCategory,
        updateSubCategory,
        deleteSubCategory,
        creating: creatingSubCategory,
        updating: updatingSubCategory,
        deleting: deletingSubCategoryMutation
    } = useSubCategories(expandedCategoryId ?? 0, { enabled: false })

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    // Form states
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

    // Subcategory expansion - already declared above with hook

    // Subcategory dialog states
    const [createSubDialogOpen, setCreateSubDialogOpen] = useState(false)
    const [editSubDialogOpen, setEditSubDialogOpen] = useState(false)
    const [deleteSubDialogOpen, setDeleteSubDialogOpen] = useState(false)
    const [subFormData, setSubFormData] = useState({ name: '', description: '', parentId: 0 })
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
    const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategory | null>(null)

    // Handlers
    const handleCreate = async () => {
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục')
            return
        }
        try {
            await createCategory(formData)
            toast.success('Tạo danh mục thành công!')
            setCreateDialogOpen(false)
            setFormData({ name: '', description: '' })
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi tạo danh mục')
        }
    }

    const handleEdit = async () => {
        if (!editingCategory || !formData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục')
            return
        }
        try {
            await updateCategory({ id: editingCategory.id, data: formData })
            toast.success('Cập nhật danh mục thành công!')
            setEditDialogOpen(false)
            setEditingCategory(null)
            setFormData({ name: '', description: '' })
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật danh mục')
        }
    }

    const handleDelete = async () => {
        if (!deletingCategory) return
        try {
            await deleteCategory(deletingCategory.id)
            toast.success('Xóa danh mục thành công!')
            setDeleteDialogOpen(false)
            setDeletingCategory(null)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xóa danh mục')
        }
    }

    const openEditDialog = (category: Category) => {
        setEditingCategory(category)
        setFormData({ name: category.name, description: category.description || '' })
        setEditDialogOpen(true)
    }

    const openDeleteDialog = (category: Category) => {
        setDeletingCategory(category)
        setDeleteDialogOpen(true)
    }

    const toggleExpand = (categoryId: number) => {
        setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId))
    }

    // Subcategory handlers
    const openCreateSubDialog = (parentId: number) => {
        setSubFormData({ name: '', description: '', parentId })
        setCreateSubDialogOpen(true)
    }

    const handleCreateSub = async () => {
        if (!subFormData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục con')
            return
        }
        try {
            await createSubCategory(subFormData)
            toast.success('Tạo danh mục con thành công!')
            setCreateSubDialogOpen(false)
            setSubFormData({ name: '', description: '', parentId: 0 })
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi tạo danh mục con')
        }
    }

    const openEditSubDialog = (sub: SubCategory, parentId: number) => {
        setEditingSubCategory(sub)
        setSubFormData({ name: sub.name, description: sub.description || '', parentId })
        setEditSubDialogOpen(true)
    }

    const handleEditSub = async () => {
        if (!editingSubCategory || !subFormData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục con')
            return
        }
        try {
            await updateSubCategory({ id: editingSubCategory.id, data: subFormData })
            toast.success('Cập nhật danh mục con thành công!')
            setEditSubDialogOpen(false)
            setEditingSubCategory(null)
            setSubFormData({ name: '', description: '', parentId: 0 })
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật danh mục con')
        }
    }

    const openDeleteSubDialog = (sub: SubCategory) => {
        setDeletingSubCategory(sub)
        setDeleteSubDialogOpen(true)
    }

    const handleDeleteSub = async () => {
        if (!deletingSubCategory) return
        try {
            await deleteSubCategory(deletingSubCategory.id)
            toast.success('Xóa danh mục con thành công!')
            setDeleteSubDialogOpen(false)
            setDeletingSubCategory(null)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xóa danh mục con')
        }
    }

    if (isLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <p className='text-muted-foreground'>Đang tải danh mục...</p>
            </div>
        )
    }

    return (
        <div className='container mx-auto py-8'>
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle>Quản lý danh mục</CardTitle>
                            <CardDescription>Thêm, sửa, xóa danh mục sản phẩm</CardDescription>
                        </div>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className='mr-2 h-4 w-4' />
                            Thêm danh mục
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-12'></TableHead>
                                <TableHead>Tên danh mục</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead className='text-right'>Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className='text-center text-muted-foreground'>
                                        Chưa có danh mục nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <CategoryRow
                                        key={category.id}
                                        category={category}
                                        isExpanded={expandedCategoryId === category.id}
                                        onToggleExpand={() => toggleExpand(category.id)}
                                        onEdit={() => openEditDialog(category)}
                                        onDelete={() => openDeleteDialog(category)}
                                        onCreateSub={() => openCreateSubDialog(category.id)}
                                        onEditSub={(sub) => openEditSubDialog(sub, category.id)}
                                        onDeleteSub={openDeleteSubDialog}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm danh mục mới</DialogTitle>
                        <DialogDescription>Nhập thông tin danh mục sản phẩm</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='create-name'>Tên danh mục *</Label>
                            <Input
                                id='create-name'
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder='Ví dụ: Rau củ'
                            />
                        </div>
                        <div>
                            <Label htmlFor='create-desc'>Mô tả</Label>
                            <Textarea
                                id='create-desc'
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder='Mô tả chi tiết về danh mục...'
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setCreateDialogOpen(false)} disabled={creating}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreate} disabled={creating}>
                            {creating ? 'Đang tạo...' : 'Tạo danh mục'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
                        <DialogDescription>Cập nhật thông tin danh mục</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='edit-name'>Tên danh mục *</Label>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa danh mục <strong>{deletingCategory?.name}</strong>? Hành động này
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

            {/* Create Subcategory Dialog */}
            <Dialog open={createSubDialogOpen} onOpenChange={setCreateSubDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm danh mục con</DialogTitle>
                        <DialogDescription>Nhập thông tin danh mục con</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='create-sub-name'>Tên danh mục con *</Label>
                            <Input
                                id='create-sub-name'
                                value={subFormData.name}
                                onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                                placeholder='Ví dụ: Rau xanh'
                            />
                        </div>
                        <div>
                            <Label htmlFor='create-sub-desc'>Mô tả</Label>
                            <Textarea
                                id='create-sub-desc'
                                value={subFormData.description}
                                onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                                placeholder='Mô tả chi tiết...'
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setCreateSubDialogOpen(false)}
                            disabled={creatingSubCategory}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleCreateSub} disabled={creatingSubCategory}>
                            {creatingSubCategory ? 'Đang tạo...' : 'Tạo danh mục con'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Subcategory Dialog */}
            <Dialog open={editSubDialogOpen} onOpenChange={setEditSubDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa danh mục con</DialogTitle>
                        <DialogDescription>Cập nhật thông tin danh mục con</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div>
                            <Label htmlFor='edit-sub-name'>Tên danh mục con *</Label>
                            <Input
                                id='edit-sub-name'
                                value={subFormData.name}
                                onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor='edit-sub-desc'>Mô tả</Label>
                            <Textarea
                                id='edit-sub-desc'
                                value={subFormData.description}
                                onChange={(e) => setSubFormData({ ...subFormData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => setEditSubDialogOpen(false)}
                            disabled={updatingSubCategory}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleEditSub} disabled={updatingSubCategory}>
                            {updatingSubCategory ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Subcategory Confirmation Dialog */}
            <AlertDialog open={deleteSubDialogOpen} onOpenChange={setDeleteSubDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa danh mục con</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa danh mục con <strong>{deletingSubCategory?.name}</strong>? Hành
                            động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingSubCategoryMutation}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSub} disabled={deletingSubCategoryMutation}>
                            {deletingSubCategoryMutation ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

// Category row with subcategory expansion
function CategoryRow({
    category,
    isExpanded,
    onToggleExpand,
    onEdit,
    onDelete,
    onCreateSub,
    onEditSub,
    onDeleteSub
}: {
    category: Category
    isExpanded: boolean
    onToggleExpand: () => void
    onEdit: () => void
    onDelete: () => void
    onCreateSub: () => void
    onEditSub: (sub: SubCategory) => void
    onDeleteSub: (sub: SubCategory) => void
}) {
    const { subCategories, isLoading } = useSubCategories(category.id, { enabled: isExpanded })

    return (
        <>
            <TableRow>
                <TableCell>
                    <Button variant='ghost' size='sm' onClick={onToggleExpand}>
                        {isExpanded ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
                    </Button>
                </TableCell>
                <TableCell className='font-medium'>{category.name}</TableCell>
                <TableCell className='text-muted-foreground'>{category.description || '—'}</TableCell>
                <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                        <Button variant='ghost' size='sm' onClick={onEdit}>
                            <Pencil className='h-4 w-4' />
                        </Button>
                        <Button variant='ghost' size='sm' onClick={onDelete}>
                            <Trash2 className='h-4 w-4' />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={4} className='bg-muted/50 p-4'>
                        {isLoading ? (
                            <p className='text-sm text-muted-foreground'>Đang tải danh mục con...</p>
                        ) : (
                            <div className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm font-medium'>Danh mục con:</p>
                                    <Button size='sm' variant='outline' onClick={onCreateSub}>
                                        <Plus className='mr-1 h-3 w-3' />
                                        Thêm danh mục con
                                    </Button>
                                </div>
                                {subCategories.length === 0 ? (
                                    <p className='text-sm text-muted-foreground'>Chưa có danh mục con</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className='h-8'>Tên</TableHead>
                                                <TableHead className='h-8'>Mô tả</TableHead>
                                                <TableHead className='h-8 w-24 text-right'>Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subCategories.map((sub) => (
                                                <TableRow key={sub.id}>
                                                    <TableCell className='py-2 text-sm'>{sub.name}</TableCell>
                                                    <TableCell className='py-2 text-sm text-muted-foreground'>
                                                        {sub.description || '—'}
                                                    </TableCell>
                                                    <TableCell className='py-2 text-right'>
                                                        <div className='flex justify-end gap-1'>
                                                            <Button
                                                                variant='ghost'
                                                                size='sm'
                                                                onClick={() => onEditSub(sub)}
                                                            >
                                                                <Pencil className='h-3 w-3' />
                                                            </Button>
                                                            <Button
                                                                variant='ghost'
                                                                size='sm'
                                                                onClick={() => onDeleteSub(sub)}
                                                            >
                                                                <Trash2 className='h-3 w-3' />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        )}
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}
