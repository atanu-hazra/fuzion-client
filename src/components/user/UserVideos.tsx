"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import useUserVideos from '@/hooks/user/useUserVideos';
import UserVidPreviewCard from '../video/UserVidPreviewCard';

const UserVideos: React.FC = () => {
    const { usernameOrId } = useParams();
    const userVideos = useUserVideos(String(usernameOrId));

    if (!userVideos || !userVideos.length) {
        return (
            <div className="text-center text-gray-500 p-4">
                No videos found.
            </div>
        );
    }

    return (
        <div className="pb-[30%] md:pb-[10%] grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-5 w-full mx-auto px-1 sm:px-2">
            {userVideos.map((video) => {
                return <UserVidPreviewCard key={video._id} video={video}/>
            })}
        </div>
    );
};

export default UserVideos;
