"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserFollowers from './UserFollowers';
import UserFollowings from './UserFollowings';
import useUserInfo from '@/hooks/user/useUserInfo';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

const UserConnectionsPage: React.FC = () => {
    const { channelId } = useParams()
    const [serachFor, setSerachFor] = useState<"followers" | "followings">("followers")
    const router = useRouter()

    const channel = useUserInfo(String(channelId))

    if (!channelId) {
        console.error('Channel Id is required.')
        return (
            <div className="text-center text-gray-500 p-4">
                Page not found.
            </div>
        )
    }

    if (!channel) {
        return (
            <div className="text-center text-gray-500 p-4">
                Loading...
            </div>
        )
    }
    const { fullName, username } = channel

    return (
        <>
            <div
                className='flex items-center mb-3 ml-2'
                onClick={() => router.push(`/user/${username}`)}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label='Back to user profile'
                >
                    <ArrowLeft
                        style={{ height: '24px', width: '24px' }}
                        className='h-5 w-5 mr-2'
                    />
                </Button>
                <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">
                        {fullName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">
                        @{username}
                    </div>
                </div>
            </div>
            <div className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center px-1 sm:px-3">
                    <button
                        onClick={() => setSerachFor('followers')}
                        className={`relative px-4 sm:px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 focus:outline-none
                            ${serachFor === 'followers'
                                ? 'text-slate-900 dark:text-slate-100'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Followers
                        <span
                            className={`absolute bottom-0 inset-x-0 h-[2.5px] rounded-full transition-all duration-300
                                ${serachFor === 'followers'
                                    ? 'bg-slate-900 dark:bg-slate-100 opacity-100'
                                    : 'opacity-0'
                                }`}
                        />
                    </button>
                    <button
                        onClick={() => setSerachFor('followings')}
                        className={`relative px-4 sm:px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 focus:outline-none
                            ${serachFor === 'followings'
                                ? 'text-slate-900 dark:text-slate-100'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Following
                        <span
                            className={`absolute bottom-0 inset-x-0 h-[2.5px] rounded-full transition-all duration-300
                                ${serachFor === 'followings'
                                    ? 'bg-slate-900 dark:bg-slate-100 opacity-100'
                                    : 'opacity-0'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {serachFor === "followers" ? <UserFollowers channelId={String(channelId)} /> : <UserFollowings channelId={String(channelId)} />}
        </>
    )
}

export default UserConnectionsPage
