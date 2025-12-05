import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useChatSessions, useChatMessages } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

//TODO: xem lại chỗ button lồng span (button xoá phiên chat)
export default function Chat() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [inputMessage, setInputMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { sessions, createSession, deletingSession, creating } = useChatSessions()
    const { messages, sendMessage, sending, isLoading } = useChatMessages(currentSessionId || undefined)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // Auto-select first session or create new one on open
    useEffect(() => {
        if (isOpen && !currentSessionId) {
            if (sessions.length > 0) {
                setCurrentSessionId(sessions[0].id)
            }
        }
    }, [isOpen, sessions, currentSessionId])

    const handleCreateSession = async () => {
        try {
            const newSession = await createSession()
            setCurrentSessionId(newSession.id)
            toast.success('Tạo phiên chat mới thành công')
        } catch (error) {
            toast.error('Không thể tạo phiên chat mới')
        }
    }

    const handleDeleteSession = async (id: string) => {
        try {
            await deletingSession(id)
            if (currentSessionId === id) {
                // Find remaining sessions (filter out the deleted one)
                const remainingSessions = sessions.filter((s) => s.id !== id)
                setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null)
            }
            toast.success('Đã xóa phiên chat')
        } catch (error) {
            toast.error('Không thể xóa phiên chat')
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputMessage.trim()) return

        try {
            let sessionId = currentSessionId

            // Validate that the current session still exists, or create new one
            const sessionExists = sessionId && sessions.some((s) => s.id === sessionId)

            if (!sessionExists) {
                const newSession = await createSession()
                sessionId = newSession.id
                setCurrentSessionId(sessionId)
            }

            await sendMessage({
                sessionId,
                content: inputMessage.trim(),
                sender: 'user'
            })

            setInputMessage('')
        } catch (error) {
            console.error('❌ Error sending message:', error)
            toast.error('Không thể gửi tin nhắn')
        }
    }

    const formatTime = (date: string | Date) => {
        const d = new Date(date)
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <>
            {/* Floating Chat Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110',
                    isOpen && 'scale-0 opacity-0'
                )}
                size='icon'
            >
                <MessageCircle className='h-6 w-6' />
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className='fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] flex-col shadow-2xl'>
                    {/* Header */}
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 border-b pb-4'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <MessageCircle className='h-5 w-5' />
                            Trợ lý AI
                        </CardTitle>
                        <Button variant='ghost' size='icon' onClick={() => setIsOpen(false)}>
                            <X className='h-5 w-5' />
                        </Button>
                    </CardHeader>

                    <CardContent className='flex flex-1 flex-col gap-3 overflow-hidden p-4'>
                        {/* Sessions Sidebar - Collapsed to tabs */}
                        {sessions.length > 0 && (
                            <div className='flex items-center gap-2 overflow-x-auto pb-2'>
                                {sessions.slice(0, 3).map((session) => (
                                    <Button
                                        key={session.id}
                                        variant={currentSessionId === session.id ? 'default' : 'outline'}
                                        size='sm'
                                        onClick={() => setCurrentSessionId(session.id)}
                                        className='relative shrink-0'
                                    >
                                        Chat {sessions.indexOf(session) + 1}
                                        {currentSessionId === session.id && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteSession(session.id)
                                                }}
                                                className='ml-2 inline-flex cursor-pointer'
                                                role='button'
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.stopPropagation()
                                                        handleDeleteSession(session.id)
                                                    }
                                                }}
                                            >
                                                <Trash2 className='h-3 w-3' />
                                            </span>
                                        )}
                                    </Button>
                                ))}
                                <Button variant='outline' size='sm' onClick={handleCreateSession} disabled={creating}>
                                    <Plus className='h-4 w-4' />
                                </Button>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className='flex-1 overflow-y-auto pr-4'>
                            {isLoading ? (
                                <div className='flex h-full items-center justify-center text-muted-foreground'>
                                    Đang tải...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className='flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground'>
                                    <MessageCircle className='h-12 w-12 opacity-50' />
                                    <p className='text-sm'>Chưa có tin nhắn nào</p>
                                    <p className='text-xs'>Gửi tin nhắn để bắt đầu trò chuyện với trợ lý AI</p>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'flex',
                                                message.sender === 'user' ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[80%] rounded-lg px-4 py-2',
                                                    message.sender === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted',
                                                    message.id.startsWith('temp-') && 'opacity-60'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'prose prose-sm max-w-none',
                                                        message.sender === 'user' ? 'text-white' : 'prose-slate'
                                                    )}
                                                >
                                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                                </div>
                                                <span className='mt-1 block text-xs opacity-70'>
                                                    {formatTime(message.createdAt || new Date())}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className='flex gap-2 border-t pt-3'>
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder='Nhập tin nhắn...'
                                disabled={sending}
                                className='flex-1'
                            />
                            <Button type='submit' size='icon' disabled={sending || !inputMessage.trim()}>
                                <Send className='h-4 w-4' />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </>
    )
}
