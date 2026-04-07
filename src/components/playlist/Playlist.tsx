"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import usePlaylist from '@/hooks/playlist/usePlaylist';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Image from 'next/image';
import { Trash, Edit, LockKeyhole } from 'lucide-react';
import { Button } from '../ui/button';
import api from '@/lib/api';
import PlaylistVideoCard from '../video/PlaylistVideoCard';

const Playlist: React.FC = () => {
    const { id } = useParams()
    const playlist = usePlaylist(String(id))
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const [isOwner, setIsOwner] = useState(false)
    const [showRemoveModal, setShowRemoveModal] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (currentUserData && currentUserData?._id === playlist?.owner._id) setIsOwner(true);
    }, [currentUserData, playlist]);

    if (!playlist) {
        return (
            <div className='text-center text-gray-500 p-4'>
                Loading...
            </div>
        )
    }

    const { name, description, isPublic, owner, videos, _id } = playlist
    const { avatar, fullName, username } = owner

    if (!isPublic && !isOwner) {
        return (
            <div>
                This playlist is private.
            </div>
        )
    }

    const accessibleVideos = videos.filter(
        (video) => video.isPublished || currentUserData?._id === video.owner._id
    );

    const playlistThumbnail = accessibleVideos[0]?.thumbnail || process.env.NEXT_PUBLIC_DEFAULT_PLAYLIST_THUMBNAIL

    const ownerAvatar = avatar || process.env.NEXT_PUBLIC_DEFAULT_USER_AVATAR

    return (
        <>
            <div className='mx-2'>
                <div
                    className="space-y-1 mb-6 md:mb-8 relative p-4 md:p-6 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm"
                    style={{
                        backgroundImage: `url(${playlistThumbnail})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    {/* Background Overlay */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/70 backdrop-blur-xl md:backdrop-blur-2xl"
                    ></div>

                    {/* Content */}
                        <div className="space-y-2 relative z-10 text-white flex flex-col h-full justify-end">
                            <div className='flex gap-3 items-center'>
                                <div className="text-2xl md:text-3xl font-semibold tracking-tight">{name}</div>
                                {!playlist.isPublic && (
                                    <LockKeyhole
                                        className="opacity-70 mt-1"
                                        style={{ height: '22px', width: '22px' }}
                                    />
                                )}
                            </div>
                            <div className="text-sm md:text-base font-light text-slate-200 dark:text-slate-300 max-w-2xl">
                                {description}
                            </div>
                            <div className='flex justify-between items-end mt-4'>
                                <div className='flex items-center gap-3 bg-white/10 dark:bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10'>
                                    <Image
                                        src={String(ownerAvatar)}
                                        alt={`${username}'s avatar`}
                                        width={32}
                                        height={32}
                                        className="aspect-square rounded-full object-cover shadow-sm"
                                    />
                                    <span className="text-sm font-medium text-white/90">
                                        {fullName}
                                    </span>
                                </div>

                            {isOwner && (
                                <div className='flex items-center gap-1'>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Edit Playlist"
                                        onClick={() => {
                                            router.push(`/playlists/update/${_id}`);
                                        }}
                                    >
                                        <Edit
                                            style={{ height: "24px", width: "24px" }}
                                            className="h-5 w-5"
                                        />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Delete playlist"
                                        onClick={() => setShowRemoveModal(true)}
                                    >
                                        <Trash
                                            style={{ height: "24px", width: "24px" }}
                                            className="h-5 w-5"
                                        />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    {accessibleVideos.length > 0
                        ? (
                            <div className="pb-[30%] md:pb-[10%] grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-5 w-full mx-auto px-1 sm:px-2">
                                {accessibleVideos.map((video) => {
                                    return <PlaylistVideoCard key={video._id} video={video} isPlaylistOwner={isOwner} />
                                })}
                            </div>
                        )
                        : (
                            <div className='text-center text-gray-500 p-4'>
                                No videos.
                            </div>
                        )}
                </div>
                {showRemoveModal ? (
                    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col justify-center gap-2 mx-4 p-6 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 max-w-sm w-full">
                            <div className="font-semibold text-lg text-slate-900 dark:text-slate-100 text-center">
                                Delete playlist?
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 text-sm text-center mb-4">
                                Once you delete the playlist, it will no longer be available to you and other users.
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 rounded-full transition-colors"
                                    onClick={async () => {
                                        try {
                                            await api.delete(`/api/v1/playlists/${_id}`, {
                                                headers: {
                                                    Authorization: `Bearer ${accessToken}`,
                                                },
                                            });
                                            router.push('/playlists');
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }}
                                >
                                    Delete
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => setShowRemoveModal(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    )
}

export default Playlist;