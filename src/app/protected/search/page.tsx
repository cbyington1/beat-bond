'use client'
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { ShadInput } from '@/components/ui/shadcnInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const SearchPage = () => {
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

    return (
        <div className='w-full h-full flex justify-center items-center'>
            <Card className='rounded-md shadow bg-white'>
                <div className='flex gap-2'>
                    <ShadInput
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => handleInputChange(e.target.value)}
                    />
                    <Button onClick={() => handleSearch(search)}>Search</Button>
                </div>
                <ul className='text-white'>
                    {users.map((user) => (
                        <li key={user.userID}>{user.username}</li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default SearchPage;