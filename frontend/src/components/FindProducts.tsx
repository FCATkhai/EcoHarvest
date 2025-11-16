import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FindProductsProps {
    onSearch: (searchTerm: string) => void
    placeholder?: string
    className?: string
}

export default function FindProducts({
    onSearch,
    placeholder = 'Tìm kiếm sản phẩm...',
    className = ''
}: FindProductsProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(searchTerm.trim())
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    return (
        <form onSubmit={handleSearch} className={`flex gap-2 ${className}`}>
            <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                    type='text'
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    className='pl-9'
                />
            </div>
            <Button type='submit' variant='default'>
                Tìm kiếm
            </Button>
        </form>
    )
}
