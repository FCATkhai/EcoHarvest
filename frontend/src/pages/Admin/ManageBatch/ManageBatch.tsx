import { useState } from 'react'
import { useBatches } from '@/hooks/batch/useBatch'
import { useImportReceipts } from '@/hooks/batch/useImportReceipt'
import { useBatchDocuments } from '@/hooks/batch/useBatchDocument'
import { useProducts } from '@/hooks/useProduct'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pencil, Trash2, Plus, FileText, Package, Receipt, FileCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ImportReceipt, Batch } from '@/types/schema.type'
import { supabase } from '@/lib/supabase'
import { SUPABASE_BUCKETS } from '@/constants/supabaseBucket'

export default function ManageBatch() {
    const [activeTab, setActiveTab] = useState<'receipts' | 'batches'>('receipts')

    // Import Receipt states
    const {
        receipts,
        isLoading: receiptsLoading,
        createImportReceipt,
        updateImportReceipt,
        deleteImportReceipt,
        creating: creatingReceipt,
        updating: updatingReceipt,
        deleting: isDeletingReceipt
    } = useImportReceipts()

    // Batch states
    const {
        batches,
        isLoading: batchesLoading,
        createBatch,
        updateBatch,
        deleteBatch,
        creating: creatingBatch,
        updating: updatingBatch,
        deleting: isDeletingBatch
    } = useBatches()

    const { products } = useProducts()

    // Dialog states
    const [createReceiptDialog, setCreateReceiptDialog] = useState(false)
    const [editReceiptDialog, setEditReceiptDialog] = useState(false)
    const [deleteReceiptDialog, setDeleteReceiptDialog] = useState(false)
    const [viewReceiptDialog, setViewReceiptDialog] = useState(false)

    const [createBatchDialog, setCreateBatchDialog] = useState(false)
    const [editBatchDialog, setEditBatchDialog] = useState(false)
    const [deleteBatchDialog, setDeleteBatchDialog] = useState(false)
    const [manageBatchDocsDialog, setManageBatchDocsDialog] = useState(false)

    // Form states
    const [receiptForm, setReceiptForm] = useState({
        supplierName: '',
        totalAmount: '',
        importDate: '',
        notes: ''
    })

    const [batchForm, setBatchForm] = useState({
        productId: '',
        importReceiptId: '',
        batchCode: '',
        expiryDate: '',
        quantityImported: '',
        quantityRemaining: '',
        unitCost: '',
        notes: ''
    })

    const [editingReceipt, setEditingReceipt] = useState<ImportReceipt | null>(null)
    const [deletingReceipt, setDeletingReceipt] = useState<ImportReceipt | null>(null)
    const [viewingReceipt, setViewingReceipt] = useState<ImportReceipt | null>(null)

    const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
    const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null)
    const [selectedBatchForDocs, setSelectedBatchForDocs] = useState<Batch | null>(null)

    // === Import Receipt Handlers ===
    const resetReceiptForm = () => {
        setReceiptForm({
            supplierName: '',
            totalAmount: '',
            importDate: '',
            notes: ''
        })
    }

    const handleCreateReceipt = async () => {
        if (!receiptForm.supplierName.trim()) {
            toast.error('Vui lòng nhập tên nhà cung cấp')
            return
        }
        try {
            await createImportReceipt({
                supplierName: receiptForm.supplierName,
                totalAmount: Number(receiptForm.totalAmount) || 0,
                importDate: receiptForm.importDate || undefined,
                notes: receiptForm.notes || undefined
            })
            toast.success('Tạo phiếu nhập thành công!')
            setCreateReceiptDialog(false)
            resetReceiptForm()
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi tạo phiếu nhập')
        }
    }

    const handleEditReceipt = async () => {
        if (!editingReceipt) return
        try {
            await updateImportReceipt({
                id: editingReceipt.id,
                payload: {
                    supplierName: receiptForm.supplierName,
                    totalAmount: Number(receiptForm.totalAmount),
                    importDate: receiptForm.importDate || undefined,
                    notes: receiptForm.notes || undefined
                }
            })
            toast.success('Cập nhật phiếu nhập thành công!')
            setEditReceiptDialog(false)
            setEditingReceipt(null)
            resetReceiptForm()
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật phiếu nhập')
        }
    }

    const handleDeleteReceipt = async () => {
        if (!deletingReceipt) return
        try {
            await deleteImportReceipt(deletingReceipt.id)
            toast.success('Xóa phiếu nhập thành công!')
            setDeleteReceiptDialog(false)
            setDeletingReceipt(null)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xóa phiếu nhập')
        }
    }

    const openEditReceiptDialog = (receipt: ImportReceipt) => {
        setEditingReceipt(receipt)
        setReceiptForm({
            supplierName: receipt.supplierName || '',
            totalAmount: String(receipt.totalAmount || ''),
            importDate: receipt.importDate ? new Date(receipt.importDate).toISOString().split('T')[0] : '',
            notes: receipt.notes || ''
        })
        setEditReceiptDialog(true)
    }

    const openViewReceiptDialog = (receipt: ImportReceipt) => {
        setViewingReceipt(receipt)
        setViewReceiptDialog(true)
    }

    // === Batch Handlers ===
    const resetBatchForm = () => {
        setBatchForm({
            productId: '',
            importReceiptId: '',
            batchCode: '',
            expiryDate: '',
            quantityImported: '',
            quantityRemaining: '',
            unitCost: '',
            notes: ''
        })
    }

    const handleCreateBatch = async () => {
        if (!batchForm.productId || !batchForm.importReceiptId) {
            toast.error('Vui lòng chọn sản phẩm và phiếu nhập')
            return
        }
        try {
            await createBatch({
                productId: batchForm.productId,
                importReceiptId: Number(batchForm.importReceiptId),
                batchCode: batchForm.batchCode || undefined,
                expiryDate: batchForm.expiryDate || undefined,
                quantityImported: Number(batchForm.quantityImported) || 0,
                quantityRemaining: Number(batchForm.quantityRemaining) || 0,
                unitCost: Number(batchForm.unitCost) || 0,
                notes: batchForm.notes || undefined
            })
            toast.success('Tạo lô hàng thành công!')
            setCreateBatchDialog(false)
            resetBatchForm()
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi tạo lô hàng')
        }
    }

    const handleEditBatch = async () => {
        if (!editingBatch) return
        try {
            await updateBatch({
                id: editingBatch.id,
                payload: {
                    productId: batchForm.productId || undefined,
                    importReceiptId: Number(batchForm.importReceiptId) || undefined,
                    batchCode: batchForm.batchCode || undefined,
                    expiryDate: batchForm.expiryDate || undefined,
                    quantityImported: Number(batchForm.quantityImported) || undefined,
                    quantityRemaining: Number(batchForm.quantityRemaining) || undefined,
                    unitCost: Number(batchForm.unitCost) || undefined,
                    notes: batchForm.notes || undefined
                }
            })
            toast.success('Cập nhật lô hàng thành công!')
            setEditBatchDialog(false)
            setEditingBatch(null)
            resetBatchForm()
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật lô hàng')
        }
    }

    const handleDeleteBatch = async () => {
        if (!deletingBatch) return
        try {
            await deleteBatch(deletingBatch.id)
            toast.success('Xóa lô hàng thành công!')
            setDeleteBatchDialog(false)
            setDeletingBatch(null)
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi xảy ra khi xóa lô hàng')
        }
    }

    const openEditBatchDialog = (batch: Batch) => {
        setEditingBatch(batch)
        setBatchForm({
            productId: batch.productId || '',
            importReceiptId: String(batch.importReceiptId || ''),
            batchCode: batch.batchCode || '',
            expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : '',
            quantityImported: String(batch.quantityImported || ''),
            quantityRemaining: String(batch.quantityRemaining || ''),
            unitCost: String(batch.unitCost || ''),
            notes: batch.notes || ''
        })
        setEditBatchDialog(true)
    }

    const openManageBatchDocsDialog = (batch: Batch) => {
        setSelectedBatchForDocs(batch)
        setManageBatchDocsDialog(true)
    }

    // Get product name helper
    const getProductName = (productId: string) => {
        const product = products.find((p) => p.id === productId)
        return product?.name || productId
    }

    // Get receipt supplier name helper
    const getReceiptSupplier = (receiptId: number) => {
        const receipt = receipts.find((r) => r.id === receiptId)
        return receipt?.supplierName || `#${receiptId}`
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    // Format date
    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('vi-VN')
    }

    return (
        <div className='container mx-auto py-6 space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>Quản lý Lô Hàng</h1>
                    <p className='text-muted-foreground'>Quản lý phiếu nhập và lô hàng sản phẩm</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className='grid w-full max-w-md grid-cols-2'>
                    <TabsTrigger value='receipts'>
                        <Receipt className='w-4 h-4 mr-2' />
                        Phiếu Nhập
                    </TabsTrigger>
                    <TabsTrigger value='batches'>
                        <Package className='w-4 h-4 mr-2' />
                        Lô Hàng
                    </TabsTrigger>
                </TabsList>

                {/* Import Receipts Tab */}
                <TabsContent value='receipts' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <CardTitle>Danh sách Phiếu Nhập</CardTitle>
                                    <CardDescription>Quản lý các phiếu nhập hàng từ nhà cung cấp</CardDescription>
                                </div>
                                <Button onClick={() => setCreateReceiptDialog(true)}>
                                    <Plus className='w-4 h-4 mr-2' />
                                    Tạo Phiếu Nhập
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {receiptsLoading ? (
                                <p>Đang tải...</p>
                            ) : receipts.length === 0 ? (
                                <p className='text-center text-muted-foreground py-8'>Chưa có phiếu nhập nào</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nhà Cung Cấp</TableHead>
                                            <TableHead>Tổng Tiền</TableHead>
                                            <TableHead>Ngày Nhập</TableHead>
                                            <TableHead>Ghi Chú</TableHead>
                                            <TableHead className='text-right'>Thao Tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {receipts.map((receipt) => (
                                            <TableRow key={receipt.id}>
                                                <TableCell>#{receipt.id}</TableCell>
                                                <TableCell className='font-medium'>
                                                    {receipt.supplierName || 'N/A'}
                                                </TableCell>
                                                <TableCell>{formatCurrency(receipt.totalAmount)}</TableCell>
                                                <TableCell>{formatDate(receipt.importDate)}</TableCell>
                                                <TableCell className='max-w-xs truncate'>
                                                    {receipt.notes || '-'}
                                                </TableCell>
                                                <TableCell className='text-right space-x-2'>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => openViewReceiptDialog(receipt)}
                                                    >
                                                        <FileText className='w-4 h-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => openEditReceiptDialog(receipt)}
                                                    >
                                                        <Pencil className='w-4 h-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => {
                                                            setDeletingReceipt(receipt)
                                                            setDeleteReceiptDialog(true)
                                                        }}
                                                    >
                                                        <Trash2 className='w-4 h-4 text-destructive' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Batches Tab */}
                <TabsContent value='batches' className='space-y-4'>
                    <Card>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <CardTitle>Danh sách Lô Hàng</CardTitle>
                                    <CardDescription>Quản lý các lô hàng theo từng sản phẩm</CardDescription>
                                </div>
                                <Button onClick={() => setCreateBatchDialog(true)}>
                                    <Plus className='w-4 h-4 mr-2' />
                                    Tạo Lô Hàng
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {batchesLoading ? (
                                <p>Đang tải...</p>
                            ) : batches.length === 0 ? (
                                <p className='text-center text-muted-foreground py-8'>Chưa có lô hàng nào</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã Lô</TableHead>
                                            <TableHead>Sản Phẩm</TableHead>
                                            <TableHead>Phiếu Nhập</TableHead>
                                            <TableHead>SL Nhập</TableHead>
                                            <TableHead>SL Còn</TableHead>
                                            <TableHead>Đơn Giá</TableHead>
                                            <TableHead>HSD</TableHead>
                                            <TableHead className='text-right'>Thao Tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batches.map((batch) => {
                                            const isExpiringSoon =
                                                batch.expiryDate &&
                                                new Date(batch.expiryDate) <
                                                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                            const isExpired =
                                                batch.expiryDate && new Date(batch.expiryDate) < new Date()

                                            return (
                                                <TableRow key={batch.id}>
                                                    <TableCell className='font-mono'>
                                                        {batch.batchCode || `#${batch.id}`}
                                                    </TableCell>
                                                    <TableCell className='font-medium'>
                                                        {getProductName(batch.productId)}
                                                    </TableCell>
                                                    <TableCell>{getReceiptSupplier(batch.importReceiptId)}</TableCell>
                                                    <TableCell>{batch.quantityImported}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                batch.quantityRemaining === 0
                                                                    ? 'destructive'
                                                                    : 'default'
                                                            }
                                                        >
                                                            {batch.quantityRemaining}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(batch.unitCost)}</TableCell>
                                                    <TableCell>
                                                        {batch.expiryDate ? (
                                                            <Badge
                                                                variant={
                                                                    isExpired
                                                                        ? 'destructive'
                                                                        : isExpiringSoon
                                                                          ? 'secondary'
                                                                          : 'outline'
                                                                }
                                                            >
                                                                {formatDate(batch.expiryDate)}
                                                            </Badge>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className='text-right space-x-2'>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => openManageBatchDocsDialog(batch)}
                                                        >
                                                            <FileCheck className='w-4 h-4' />
                                                        </Button>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => openEditBatchDialog(batch)}
                                                        >
                                                            <Pencil className='w-4 h-4' />
                                                        </Button>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => {
                                                                setDeletingBatch(batch)
                                                                setDeleteBatchDialog(true)
                                                            }}
                                                        >
                                                            <Trash2 className='w-4 h-4 text-destructive' />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Import Receipt Dialog */}
            <Dialog open={createReceiptDialog} onOpenChange={setCreateReceiptDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tạo Phiếu Nhập Mới</DialogTitle>
                        <DialogDescription>Nhập thông tin phiếu nhập hàng từ nhà cung cấp</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='supplierName'>
                                Nhà Cung Cấp <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='supplierName'
                                value={receiptForm.supplierName}
                                onChange={(e) => setReceiptForm({ ...receiptForm, supplierName: e.target.value })}
                                placeholder='Tên nhà cung cấp'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='totalAmount'>Tổng Tiền</Label>
                            <Input
                                id='totalAmount'
                                type='number'
                                value={receiptForm.totalAmount}
                                onChange={(e) => setReceiptForm({ ...receiptForm, totalAmount: e.target.value })}
                                placeholder='0'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='importDate'>Ngày Nhập</Label>
                            <Input
                                id='importDate'
                                type='date'
                                value={receiptForm.importDate}
                                onChange={(e) => setReceiptForm({ ...receiptForm, importDate: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='receiptNotes'>Ghi Chú</Label>
                            <Textarea
                                id='receiptNotes'
                                value={receiptForm.notes}
                                onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                                placeholder='Ghi chú về phiếu nhập'
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setCreateReceiptDialog(false)
                                resetReceiptForm()
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleCreateReceipt} disabled={creatingReceipt}>
                            {creatingReceipt ? 'Đang tạo...' : 'Tạo Phiếu Nhập'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Import Receipt Dialog */}
            <Dialog open={editReceiptDialog} onOpenChange={setEditReceiptDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Phiếu Nhập</DialogTitle>
                        <DialogDescription>Cập nhật thông tin phiếu nhập</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='editSupplierName'>
                                Nhà Cung Cấp <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='editSupplierName'
                                value={receiptForm.supplierName}
                                onChange={(e) => setReceiptForm({ ...receiptForm, supplierName: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editTotalAmount'>Tổng Tiền</Label>
                            <Input
                                id='editTotalAmount'
                                type='number'
                                value={receiptForm.totalAmount}
                                onChange={(e) => setReceiptForm({ ...receiptForm, totalAmount: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editImportDate'>Ngày Nhập</Label>
                            <Input
                                id='editImportDate'
                                type='date'
                                value={receiptForm.importDate}
                                onChange={(e) => setReceiptForm({ ...receiptForm, importDate: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editReceiptNotes'>Ghi Chú</Label>
                            <Textarea
                                id='editReceiptNotes'
                                value={receiptForm.notes}
                                onChange={(e) => setReceiptForm({ ...receiptForm, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setEditReceiptDialog(false)
                                setEditingReceipt(null)
                                resetReceiptForm()
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleEditReceipt} disabled={updatingReceipt}>
                            {updatingReceipt ? 'Đang cập nhật...' : 'Cập Nhật'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Import Receipt Dialog */}
            <AlertDialog open={deleteReceiptDialog} onOpenChange={setDeleteReceiptDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa phiếu nhập</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa phiếu nhập từ <strong>{deletingReceipt?.supplierName}</strong>?
                            Thao tác này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteReceiptDialog(false)
                                setDeletingReceipt(null)
                            }}
                        >
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReceipt} disabled={isDeletingReceipt}>
                            {isDeletingReceipt ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Receipt Details Dialog */}
            <Dialog open={viewReceiptDialog} onOpenChange={setViewReceiptDialog}>
                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>Chi Tiết Phiếu Nhập #{viewingReceipt?.id}</DialogTitle>
                    </DialogHeader>
                    {viewingReceipt && (
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <p className='text-sm text-muted-foreground'>Nhà Cung Cấp</p>
                                    <p className='font-medium'>{viewingReceipt.supplierName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-muted-foreground'>Tổng Tiền</p>
                                    <p className='font-medium'>{formatCurrency(viewingReceipt.totalAmount)}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-muted-foreground'>Ngày Nhập</p>
                                    <p className='font-medium'>{formatDate(viewingReceipt.importDate)}</p>
                                </div>
                                <div>
                                    <p className='text-sm text-muted-foreground'>Người Tạo</p>
                                    <p className='font-medium'>{viewingReceipt.createdBy || 'N/A'}</p>
                                </div>
                            </div>
                            {viewingReceipt.notes && (
                                <div>
                                    <p className='text-sm text-muted-foreground'>Ghi Chú</p>
                                    <p className='font-medium'>{viewingReceipt.notes}</p>
                                </div>
                            )}
                            <div>
                                <p className='text-sm font-medium mb-2'>Lô Hàng Thuộc Phiếu Nhập Này</p>
                                <ReceiptBatchesList receiptId={viewingReceipt.id} />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Batch Dialog */}
            <Dialog open={createBatchDialog} onOpenChange={setCreateBatchDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tạo Lô Hàng Mới</DialogTitle>
                        <DialogDescription>Thêm lô hàng mới cho sản phẩm</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='productId'>
                                Sản Phẩm <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={batchForm.productId}
                                onValueChange={(value) => setBatchForm({ ...batchForm, productId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Chọn sản phẩm' />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='importReceiptId'>
                                Phiếu Nhập <span className='text-destructive'>*</span>
                            </Label>
                            <Select
                                value={batchForm.importReceiptId}
                                onValueChange={(value) => setBatchForm({ ...batchForm, importReceiptId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Chọn phiếu nhập' />
                                </SelectTrigger>
                                <SelectContent>
                                    {receipts.map((receipt) => (
                                        <SelectItem key={receipt.id} value={String(receipt.id)}>
                                            #{receipt.id} - {receipt.supplierName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='batchCode'>Mã Lô</Label>
                            <Input
                                id='batchCode'
                                value={batchForm.batchCode}
                                onChange={(e) => setBatchForm({ ...batchForm, batchCode: e.target.value })}
                                placeholder='VD: BATCH-2024-001'
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='quantityImported'>Số Lượng Nhập</Label>
                                <Input
                                    id='quantityImported'
                                    type='number'
                                    value={batchForm.quantityImported}
                                    onChange={(e) => setBatchForm({ ...batchForm, quantityImported: e.target.value })}
                                    placeholder='0'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='quantityRemaining'>Số Lượng Còn</Label>
                                <Input
                                    id='quantityRemaining'
                                    type='number'
                                    value={batchForm.quantityRemaining}
                                    onChange={(e) =>
                                        setBatchForm({
                                            ...batchForm,
                                            quantityRemaining: e.target.value
                                        })
                                    }
                                    placeholder='0'
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='unitCost'>Đơn Giá Nhập</Label>
                            <Input
                                id='unitCost'
                                type='number'
                                value={batchForm.unitCost}
                                onChange={(e) => setBatchForm({ ...batchForm, unitCost: e.target.value })}
                                placeholder='0'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='expiryDate'>Hạn Sử Dụng</Label>
                            <Input
                                id='expiryDate'
                                type='date'
                                value={batchForm.expiryDate}
                                onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='batchNotes'>Ghi Chú</Label>
                            <Textarea
                                id='batchNotes'
                                value={batchForm.notes}
                                onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
                                placeholder='Ghi chú về lô hàng'
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setCreateBatchDialog(false)
                                resetBatchForm()
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleCreateBatch} disabled={creatingBatch}>
                            {creatingBatch ? 'Đang tạo...' : 'Tạo Lô Hàng'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Batch Dialog */}
            <Dialog open={editBatchDialog} onOpenChange={setEditBatchDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh Sửa Lô Hàng</DialogTitle>
                        <DialogDescription>Cập nhật thông tin lô hàng</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='editProductId'>Sản Phẩm</Label>
                            <Select
                                value={batchForm.productId}
                                onValueChange={(value) => setBatchForm({ ...batchForm, productId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editImportReceiptId'>Phiếu Nhập</Label>
                            <Select
                                value={batchForm.importReceiptId}
                                onValueChange={(value) => setBatchForm({ ...batchForm, importReceiptId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {receipts.map((receipt) => (
                                        <SelectItem key={receipt.id} value={String(receipt.id)}>
                                            #{receipt.id} - {receipt.supplierName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editBatchCode'>Mã Lô</Label>
                            <Input
                                id='editBatchCode'
                                value={batchForm.batchCode}
                                onChange={(e) => setBatchForm({ ...batchForm, batchCode: e.target.value })}
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='editQuantityImported'>Số Lượng Nhập</Label>
                                <Input
                                    id='editQuantityImported'
                                    type='number'
                                    value={batchForm.quantityImported}
                                    onChange={(e) => setBatchForm({ ...batchForm, quantityImported: e.target.value })}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='editQuantityRemaining'>Số Lượng Còn</Label>
                                <Input
                                    id='editQuantityRemaining'
                                    type='number'
                                    value={batchForm.quantityRemaining}
                                    onChange={(e) =>
                                        setBatchForm({
                                            ...batchForm,
                                            quantityRemaining: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editUnitCost'>Đơn Giá Nhập</Label>
                            <Input
                                id='editUnitCost'
                                type='number'
                                value={batchForm.unitCost}
                                onChange={(e) => setBatchForm({ ...batchForm, unitCost: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editExpiryDate'>Hạn Sử Dụng</Label>
                            <Input
                                id='editExpiryDate'
                                type='date'
                                value={batchForm.expiryDate}
                                onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='editBatchNotes'>Ghi Chú</Label>
                            <Textarea
                                id='editBatchNotes'
                                value={batchForm.notes}
                                onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant='outline'
                            onClick={() => {
                                setEditBatchDialog(false)
                                setEditingBatch(null)
                                resetBatchForm()
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleEditBatch} disabled={updatingBatch}>
                            {updatingBatch ? 'Đang cập nhật...' : 'Cập Nhật'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Batch Dialog */}
            <AlertDialog open={deleteBatchDialog} onOpenChange={setDeleteBatchDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa lô hàng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa lô hàng{' '}
                            <strong>{deletingBatch?.batchCode || `#${deletingBatch?.id}`}</strong>? Thao tác này không
                            thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteBatchDialog(false)
                                setDeletingBatch(null)
                            }}
                        >
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBatch} disabled={isDeletingBatch}>
                            {isDeletingBatch ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Manage Batch Documents Dialog */}
            {selectedBatchForDocs && (
                <BatchDocumentsDialog
                    batch={selectedBatchForDocs}
                    open={manageBatchDocsDialog}
                    onOpenChange={setManageBatchDocsDialog}
                />
            )}
        </div>
    )
}

// Helper component to display batches for a receipt
function ReceiptBatchesList({ receiptId }: { receiptId: number }) {
    const { batches, isLoading } = useBatches({ importReceiptId: receiptId })
    const { products } = useProducts()

    const getProductName = (productId: string) => {
        return products.find((p) => p.id === productId)?.name || productId
    }

    if (isLoading) return <p className='text-sm text-muted-foreground'>Đang tải...</p>
    if (batches.length === 0) return <p className='text-sm text-muted-foreground'>Chưa có lô hàng nào</p>

    return (
        <div className='space-y-2'>
            {batches.map((batch) => (
                <div key={batch.id} className='border rounded-lg p-3 text-sm'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='font-medium'>{getProductName(batch.productId)}</p>
                            <p className='text-muted-foreground'>Mã: {batch.batchCode || `#${batch.id}`}</p>
                        </div>
                        <Badge>{batch.quantityRemaining} còn lại</Badge>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Batch Documents Management Dialog
function BatchDocumentsDialog({
    batch,
    open,
    onOpenChange
}: {
    batch: Batch
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { documents, createDocument, removeDocument, creating, deleting } = useBatchDocuments(batch.id)
    const [uploading, setUploading] = useState(false)
    const [docForm, setDocForm] = useState({
        documentType: '',
        fileUrl: ''
    })

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const fileName = `${Date.now()}_${file.name}`
            const { data, error } = await supabase.storage.from(SUPABASE_BUCKETS.BATCH_DOCUMENTS).upload(fileName, file)

            if (error) throw error

            const {
                data: { publicUrl }
            } = supabase.storage.from(SUPABASE_BUCKETS.BATCH_DOCUMENTS).getPublicUrl(data.path)

            setDocForm({ ...docForm, fileUrl: publicUrl })
            toast.success('Tải file lên thành công!')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi khi tải file lên')
        } finally {
            setUploading(false)
        }
    }

    const handleAddDocument = async () => {
        if (!docForm.documentType || !docForm.fileUrl) {
            toast.error('Vui lòng nhập loại tài liệu và tải file lên')
            return
        }

        try {
            await createDocument({
                batchId: batch.id,
                documentType: docForm.documentType,
                fileUrl: docForm.fileUrl
            })
            toast.success('Thêm tài liệu thành công!')
            setDocForm({ documentType: '', fileUrl: '' })
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi khi thêm tài liệu')
        }
    }

    const handleDeleteDocument = async (docId: number) => {
        try {
            await removeDocument({ id: docId, batchId: batch.id })
            toast.success('Xóa tài liệu thành công!')
        } catch (error: any) {
            toast.error(error?.message || 'Có lỗi khi xóa tài liệu')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-3xl'>
                <DialogHeader>
                    <DialogTitle>Quản Lý Tài Liệu Lô Hàng</DialogTitle>
                    <DialogDescription>Lô hàng: {batch.batchCode || `#${batch.id}`}</DialogDescription>
                </DialogHeader>

                <div className='space-y-4'>
                    {/* Add Document Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-base'>Thêm Tài Liệu Mới</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='documentType'>Loại Tài Liệu</Label>
                                <Input
                                    id='documentType'
                                    value={docForm.documentType}
                                    onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                                    placeholder='VD: Giấy chứng nhận, Hóa đơn...'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='documentFile'>File Tài Liệu</Label>
                                <div className='flex gap-2'>
                                    <Input
                                        id='documentFile'
                                        type='file'
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
                                    />
                                    <Button
                                        onClick={handleAddDocument}
                                        disabled={!docForm.fileUrl || creating || uploading}
                                    >
                                        {creating ? 'Đang thêm...' : <Plus className='w-4 h-4' />}
                                    </Button>
                                </div>
                                {uploading && <p className='text-sm text-muted-foreground'>Đang tải lên...</p>}
                                {docForm.fileUrl && <p className='text-sm text-green-600'>✓ File đã được tải lên</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-base'>Danh Sách Tài Liệu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {documents.length === 0 ? (
                                <p className='text-center text-muted-foreground py-4'>Chưa có tài liệu nào</p>
                            ) : (
                                <div className='space-y-2'>
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className='flex items-center justify-between border rounded-lg p-3'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <FileText className='w-5 h-5 text-muted-foreground' />
                                                <div>
                                                    <p className='font-medium'>{doc.documentType}</p>
                                                    <a
                                                        href={doc.fileUrl}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className='text-sm text-blue-600 hover:underline'
                                                    >
                                                        Xem file
                                                    </a>
                                                </div>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                disabled={deleting}
                                            >
                                                <Trash2 className='w-4 h-4 text-destructive' />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
