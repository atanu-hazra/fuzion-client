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
    const { avatar, bio, fullName, isSubscribed, username, subscribersCount } = fetchedUser
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
        <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer"
            onClick={() => router.push(`/user/${username}`)}
        >
            {/* Avatar */}
            <Image
                src={String(avatarUrl)}
                alt={`${username} avatar`}
                className="rounded-full w-10 h-10 object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                width={40}
                height={40}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {fullName}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>@{username}</span>
                    {subscribersCount !== undefined && (
                        <>
                            <span>·</span>
                            <span>{subscribersCount} {subscribersCount === 1 ? 'follower' : 'followers'}</span>
                        </>
                    )}
                </div>
                {enableBio && bio && (
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        {bio}
                    </p>
                )}
            </div>

            {/* Follow button */}
            {!isOwnProfile && (
                <Button
                    variant="ghost"
                    className={`h-8 px-4 rounded-full text-sm font-medium shrink-0 transition-all duration-200
                        ${isLoggedIn && isFollowing
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-80'
                        }`}
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
    )
}

export default UserCard;
