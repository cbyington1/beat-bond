'use client'
import { useUser } from '@clerk/nextjs'
import { Skeleton } from './ui/skeleton'

export function ClerkUser() {
    const { isLoaded, isSignedIn, user } = useUser()

    if (!isLoaded || !isSignedIn) {
        return (
            <div className='inline-flex space-x-2'>
                <Skeleton className="h-7 w-7 rounded-full"></Skeleton>
                <Skeleton className='h-4 w-[150px] self-center'></Skeleton>
            </div>
        )
    }
    return (
        <div className='content-center'>{(user.username)}</div>
    )
}
    