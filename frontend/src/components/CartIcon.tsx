import { useEffect } from 'react'
import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import useCartStore, { selectItems, selectItemCount, selectSubtotal, selectCartActions } from '@/store/useCartStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

export default function CartIcon() {
    const items = useCartStore((state) => selectItems(state))
    const itemCount = useCartStore((state) => selectItemCount(state))
    const subtotal = useCartStore((state) => selectSubtotal(state))
    const fetchCart = useCartStore((state) => selectCartActions(state))

    const displayItems = items.slice(0, 5)
    const hasMore = items.length > 5

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <Link to='/cart' className='relative inline-flex items-center'>
                    <Button variant='ghost' size='icon' className='relative'>
                        <ShoppingCart className='h-5 w-5' />
                        {itemCount > 0 && (
                            <Badge
                                variant='destructive'
                                className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs'
                            >
                                {itemCount > 99 ? '99+' : itemCount}
                            </Badge>
                        )}
                    </Button>
                </Link>
            </HoverCardTrigger>
            <HoverCardContent className='w-80' align='end'>
                {items.length === 0 ? (
                    <div className='text-center py-4'>
                        <ShoppingCart className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                        <p className='text-sm text-muted-foreground'>Giỏ hàng trống</p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                            <h4 className='font-semibold'>Giỏ hàng của bạn</h4>
                            <span className='text-sm text-muted-foreground'>{itemCount} sản phẩm</span>
                        </div>

                        <div className='space-y-2 max-h-64 overflow-y-auto'>
                            {displayItems.map((item) => (
                                <div key={item.id} className='flex items-center gap-3 py-2 border-b last:border-0'>
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name || 'Product'}
                                            className='h-12 w-12 object-cover rounded'
                                        />
                                    ) : (
                                        <div className='h-12 w-12 bg-muted rounded flex items-center justify-center'>
                                            <ShoppingCart className='h-6 w-6 text-muted-foreground' />
                                        </div>
                                    )}
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium truncate'>{item.name}</p>
                                        <p className='text-xs text-muted-foreground'>
                                            {item.quantity} x {formatCurrency(Number(item.price || 0))}
                                        </p>
                                    </div>
                                    <div className='text-sm font-semibold'>
                                        {formatCurrency(Number(item.price || 0) * item.quantity)}
                                    </div>
                                </div>
                            ))}
                            {hasMore && (
                                <p className='text-xs text-center text-muted-foreground py-2'>
                                    +{items.length - 5} sản phẩm khác
                                </p>
                            )}
                        </div>

                        <div className='pt-3 border-t space-y-2'>
                            <div className='flex items-center justify-between font-semibold'>
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <Button asChild className='w-full'>
                                <Link to='/cart'>Xem giỏ hàng</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    )
}
