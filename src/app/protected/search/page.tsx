'use client'
import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { ShadInput } from '@/components/ui/shadcnInput';
import { Button } from '@/components/ui/button';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const users = useQuery(api.users.searchUsersByUsername, { name: query }) || [];

    const search = () => {
        setQuery(query);
    };

    return (
        <div className='w-full h-full flex justify-center items-center'>
            <ShadInput
                placeholder='Search for users'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={search}>Search</Button>
        </div>
    );
};

export default SearchPage;