"use client";

import React from 'react';
import useUserPlaylists from '@/hooks/playlist/useUserPlaylists';
import PlaylistCard from './PlaylistCard';

interface UserPlaylistsProps {
    userId: string
}

const UserPlaylists: React.FC<UserPlaylistsProps> = ({ userId }) => {
    const userPlaylists = useUserPlaylists(userId)
    if (!userPlaylists.length) {
        return (
            <div className="text-center text-slate-500 dark:text-slate-400 p-8">
                <div className="text-4xl mb-3">📂</div>
                <div className="text-sm font-medium">No playlists found</div>
            </div>
        )
    }

    return (
        <div className="pb-[30%] md:pb-[10%] grid grid-cols-1 xl:grid-cols-2 gap-2 lg:gap-4 w-full mx-auto px-1 sm:px-2">
            {userPlaylists.map((playlist) => {
                return <PlaylistCard key={playlist._id} playlist={playlist} />
            })}
        </div>
    )
}

export default UserPlaylists;
