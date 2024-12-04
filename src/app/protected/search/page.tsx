'use client'
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { ShadInput } from '@/components/ui/shadcnInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const SearchPage = () => {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const users = useQuery(api.users.searchUsersByUsername, { name: query }) || [];

    const handleSearch = (value: string) => {
        setQuery(value);
        console.log('Searching for:', value);
    };

    const handleInputChange = (value: string) => {
        setSearch(value);
    }

    const redirectToProfile = (userId: string) => {
        router.push(`/protected/${userId}`);
    };

    return (
        <div className='w-full flex justify-center items-center p-4  bg-gray-800/50 border-gray-700 transition-colors group'>
            <Card className='w-full max-w-md'>
                <CardHeader>
                    <CardTitle>Search Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex gap-2 mb-4'>
                        <ShadInput
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
                        />
                        <Button onClick={() => handleSearch(search)}>Search</Button>
                    </div>
                    {users.length > 0 && (
                        <ul className='space-y-2'>
                            {users.map((user) => (
                                <li 
                                    key={user.userID} 
                                    className='
                                        bg-gray-100 
                                        p-2 
                                        rounded 
                                        hover:bg-gray-200 
                                        cursor-pointer 
                                        transition-colors
                                    '
                                    onClick={() => redirectToProfile(user.userID)}
                                >
                                    {user.username}
                                </li>
                            ))}
                        </ul>
                    )}
                    {users.length === 0 && query && (
                        <p className='text-gray-500 text-center'>No users found</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SearchPage;