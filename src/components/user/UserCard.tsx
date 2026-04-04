"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { FetchedUserData } from '@/types';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import { enhanceAvatarResolution } from '@/lib/utils';


interface UserCardProps {
    fetchedUser: FetchedUserData,
    enableBio?: boolean,
}

const UserCard: React.FC<UserCardProps> = ({ fetchedUser, enableBio = true }) => {
    const accessToken = useSelector((state: RootState) => state.user.accessToken)
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData)
    const { avatar, bio, fullName, isSubscribed, username } = fetchedUser
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isFollowing, setIsFollowing] = useState(isSubscribed);
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (currentUserData?.username) setIsLoggedIn(true);
        if (currentUserData?.username === username) setIsOwnProfile(true);
    }, [currentUserData, username])

    const toggleSubscription = async () => {
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);

        try {
            await api.post(`/api/v1/subscriptions/c/${username}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        } catch (error: any) {
            console.error("Failed to update subscription:", error.response?.data?.message || error.message);
            setIsFollowing(prev => !prev);
        }
    };

    const avatarUrl = enhanceAvatarResolution(avatar);

    return (
        <div className="flex items-start p-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
        onClick={() => router.push(`/user/${username}`)}
        >
            <div
                className="cursor-pointer"
            >
                <Image
                    src={String(avatarUrl)}
                    alt={`${username} avatar`}
                    className="rounded-full w-12 h-12 object-cover"
                    width={48}
                    height={48}
                />
            </div>
            <div className="flex-1 ml-4">
                <div className="flex items-center justify-between">
                    <div
                        onClick={() => router.push(`/user/${username}`)}
                        className="cursor-pointer"
                    >
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {fullName}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm">
                            @{username}
                        </div>
                    </div>
                    {!isOwnProfile && (
                        <Button
                            variant="outline"
                            className={`h-8 px-4 rounded-full text-sm shadow-md ${isLoggedIn && isSubscribed ? 'bg-blue-500 text-white' : 'text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white'} transition-colors`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isLoggedIn) {
                                    toggleSubscription();
                                } else {
                                    router.push('/user/auth/login');
                                }
                            }}
                        >
                            {isLoggedIn && isFollowing ? "Following" : "Follow"}
                        </Button>
                    )}
                </div>
                {enableBio && bio && (
                    <div
                        className="mt-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                        onClick={() => router.push(`/user/${username}`)}
                    >
                        {bio}
                    </div>
                )}
            </div>
        </div>

    )
}

export default UserCard;
