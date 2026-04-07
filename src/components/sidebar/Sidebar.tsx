"use client";
import React, { useMemo, useState } from 'react';
import { Search, CircleUserRound, SidebarIcon, ListVideo, Bookmark, Settings, UserRoundCog, TvMinimalPlay, LogIn, UserRoundPlus, Home, Feather, CirclePlus, Video, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface SidebarProps {
    hideSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ hideSidebar }) => {
    const router = useRouter()
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData)
    const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const onProfileClick = () => {
        if (hideSidebar) hideSidebar();
        if (isLoggedIn) {
            router.push(`/user/${currentUserData?.username}`)
        } else {
            router.push('/user/auth/login')
        }
    }

    return (
        <>
            <div className='lg:fixed min-h-screen lg:w-[22%] text-slate-900 dark:text-slate-200'>
                <div className='w-full py-1 border-b border-[#46626f7a]'>
                    <Button
                        className='flex w-full justify-start hover:bg-slate-200 hover:dark:bg-slate-700 items-center text-lg gap-3 px-3 lg:mr-[0.6%]'
                        onClick={() => {
                            if (hideSidebar) hideSidebar();
                        }}
                    >
                        <SidebarIcon
                            style={{ height: '24px', width: '24px' }}
                        />
                        <span>
                            Menu
                        </span>
                    </Button>
                </div>

                <div className='w-full py-1 flex flex-col gap-2 border-b border-[#46626f7a]'>
                    <Button
                        className='flex w-full justify-start hover:bg-slate-200 hover:dark:bg-slate-700 items-center text-lg gap-3 px-3 lg:mr-[0.6%]'
                        onClick={() => {
                            if (hideSidebar) hideSidebar();
                            router.push("/")
                        }}
                    >
                        <Home
                            style={{ height: '24px', width: '24px' }}
                        />
                        <span>
                            Home
                        </span>
                    </Button>

                    <Button
                        className='flex w-full justify-start hover:bg-slate-200 hover:dark:bg-slate-700 items-center text-lg gap-3 px-3 lg:mr-[0.6%]'
                        onClick={() => {
                            if (hideSidebar) hideSidebar();
                            router.push("/tweet")
                        }}
                    >
                        <Feather
                            style={{ height: '24px', width: '24px' }}
                        />
                        <span>
                            Tweets
                        </span>
                    </Button>

                    <Button
                        className='flex w-full justify-start hover:bg-slate-200 hover:dark:bg-slate-700 items-center text-lg gap-3 px-3 lg:mr-[0.6%]'
                        onClick={() => {
                            setShowUploadModal(true)
                        }}
                    >
                        <CirclePlus
                            style={{ height: '24px', width: '24px' }}
                        />
                        <span>
                            Upload
                        </span>
                    </Button>

                    <Button
                        className='flex justify-start items-center hover:bg-slate-200 hover:dark:bg-slate-700 gap-3 text-lg px-3 lg:mr-[0.6%]'
                        onClick={() => {
                            if (hideSidebar) hideSidebar();
                            router.push('/search')
                        }}
                    >
                        <Search
                            style={{ height: '24px', width: '24px' }}
                        />
                        <span>
                            Explore
                        </span>
                    </Button>
                </div>

                <div className='w-full flex flex-col py-1 gap-2 border-b border-[#46626f7a]'>
                    {!isLoggedIn && (
                        <>
                            <Button
                                className='flex justify-start items-center hover:text-slate-50 bg-slate-200 dark:bg-slate-700 hover:bg-blue-400 hover:dark:bg-blue-600 gap-3 text-lg px-3 lg:mr-[0.6%]'
                                onClick={() => {
                                    if (hideSidebar) hideSidebar();
                                    router.push('/user/auth/login')
                                }}
                            >
                                <LogIn
                                    style={{ height: '24px', width: '24px' }}
                                />
                                <span>
                                    Login
                                </span>
                            </Button>

                            <Button
                                className='flex justify-start items-center hover:text-slate-50 bg-slate-200 dark:bg-slate-700 hover:bg-blue-400 hover:dark:bg-blue-600 gap-3 text-lg px-3 lg:mr-[0.6%]'
                                onClick={() => {
                                    if (hideSidebar) hideSidebar();
                                    router.push('/user/auth/register-email')
                                }}
                            >
                                <UserRoundPlus
                                    style={{ height: '24px', width: '24px' }}
                                />
                                <span>
                                    Create account
                                </span>
                            </Button>
                        </>
                    )}
                    {isLoggedIn && (
                        <>
                            <Button
                                className=' flex justify-start items-center hover:bg-slate-200 hover:dark:bg-slate-700 gap-3 text-lg px-3 lg:mr-[0.6%]'
                                onClick={() => onProfileClick()}
                            >
                                <CircleUserRound
                                    style={{ height: '24px', width: '24px' }}
                                />
                                <span>
                                    Profile
                                </span>
                            </Button>
                            <Button
                                className='flex justify-start items-center hover:bg-slate-200 hover:dark:bg-slate-700 gap-3 text-lg px-3 lg:mr-[0.6%]'
                                onClick={() => {
                                    if (hideSidebar) hideSidebar();
                                    if (isLoggedIn) {
                                        router.push('/playlists')
                                    } else {
                                        router.push('/user/auth/login')
                                    }
                                }}
                            >
                                <ListVideo
                                    style={{ height: '24px', width: '24px' }}
                                />
                                <span>
                                    Playlists
                                </span>
                            </Button>

                            <Button
                                className='flex justify-start items-center hover:bg-slate-200 hover:dark:bg-slate-700 gap-3 text-lg px-3 lg:mr-[0.6%]'
                                onClick={() => {
                                    if (hideSidebar) hideSidebar();
                                    if (isLoggedIn) {
                                        router.push('/saved-tweets')
                                    } else {
                                        router.push('/user/auth/login')
                                    }
                                }}
                            >
                                <Bookmark
                                    style={{ height: '24px', width: '24px' }}
                                />
                                <span>
                                    Saved tweets
                                </span>
                            </Button>

                            <Button
                                className='flex justify-start items-center hover:bg-slate-200 hover:dark:bg-slate-700 gap-3 text-lg px-3 lg:mr-[0.6%]'
                                onClick={() => onProfileClick()}
                            >
                                <TvMinimalPlay
                                    style={{ height: '24px', width: '24px' }}
                                />
                                <span>
                                    Your videos
                                </span>
                            </Button>

                            <Button
                                className='flex justify-start items-center hover:bg-slate-200 hover:dark:bg-slate-700 gap-3 text-lg px-3 lg:mr-[0.6%]'
                                onClick={() => {
                                    if (hideSidebar) hideSidebar();
                                    if (isLoggedIn) {
                                        router.push('/settings')
                                    } else {
                                        router.push('/user/auth/login')
                                    }
                                }}
                            >
                                <Settings
                                    style={{ height: '24px', width: '24px' }}
                                />
                                <span>
                                    Settings
                                </span>
                            </Button>
                        </>
                    )}

                    <Button
                        className='flex justify-start items-center hover:text-slate-50 bg-slate-200 dark:bg-slate-700 hover:bg-blue-400 hover:dark:bg-blue-600 gap-3 text-lg px-3 lg:mr-[0.6%]'
                        onClick={() => {
                            if (hideSidebar) hideSidebar();
                            window.open('https://atanuhazra.vercel.app/', '_blank');
                        }}
                    >
                        <UserRoundCog
                            style={{ height: '24px', width: '24px' }}
                        />
                        <span>
                            Developer
                        </span>
                    </Button>
                </div>
                
            </div>

            {showUploadModal && (
                <div
                    className="fixed z-50 inset-0 flex items-center justify-center backdrop-blur-sm bg-[#0b3644] bg-opacity-30"
                    onClick={() => setShowUploadModal(false)}
                >
                    <div className="bg-slate-50 dark:bg-[#225a6d] flex flex-col justify-center m-4 w-[80%] md:w-[50%] lg:w-[30%] p-6 rounded-xl shadow-md text-[#0b3644] dark:text-slate-100">
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <Button
                                variant="outline"
                                className="w-full rounded-full text-base dark:bg-[#134454] border-blue-600 dark:border-blue-400"
                                onClick={() => {
                                    setShowUploadModal(false);
                                    if (hideSidebar) hideSidebar();
                                    router.push("/video/upload/new");
                                }}
                            >
                                <Video
                                    className="text-blue-600 dark:text-blue-400"
                                    style={{ height: "24px", width: "24px" }}
                                />
                                <span>Upload a video</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full text-base dark:bg-[#134454] border-blue-600 dark:border-blue-400"
                                onClick={() => {
                                    setShowUploadModal(false);
                                    if (hideSidebar) hideSidebar();
                                    router.push("/tweet/upload/new");
                                }}
                            >
                                <Feather
                                    className="text-blue-600 dark:text-blue-400"
                                    style={{ height: "24px", width: "24px" }}
                                />
                                <span>Upload a tweet</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full text-base dark:bg-[#134454] border-blue-600 dark:border-blue-400"
                                onClick={() => {
                                    setShowUploadModal(false);
                                    if (hideSidebar) hideSidebar();
                                    router.push("/playlists/new");
                                }}
                            >
                                <ListVideo
                                    className="text-blue-600 dark:text-blue-400"
                                    style={{ height: "24px", width: "24px" }}
                                />
                                <span>Create a playlist</span>
                            </Button>
                            <Button
                                variant="default"
                                className="w-full rounded-full bg-blue-500 hover:bg-blue-600 text-base border-blue-600 dark:border-blue-400 text-slate-100"
                                onClick={() => setShowUploadModal(false)}
                            >
                                <X style={{ height: "24px", width: "24px" }} />
                                <span>Cancel upload</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Sidebar;
