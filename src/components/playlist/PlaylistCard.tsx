"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import { EllipsisVertical, ListVideo, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Playlist } from '@/types';
import Image from 'next/image';

interface PlaylistCardProps {
    playlist: Playlist;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const [isOwner, setIsOwner] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [showPlaylist, setShowPlaylist] = useState(true)
    const { _id, name, description, owner, videos, isPublic } = playlist
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter()
    const [showRemoveModal, setShowRemoveModal] = useState(false)

    useEffect(() => {
        if (currentUserData && currentUserData?._id === owner._id) setIsOwner(true);
    }, [currentUserData, owner._id]);

    useEffect(() => {
        if (!isPublic) {
            setShowPlaylist(false);
            if (isOwner) setShowPlaylist(true);
        }
    }, [playlist, isOwner, isPublic])

    let shortDescription = description
    if (description.length > 65) {
        shortDescription = description.slice(0, 65) + '...'
    }

    const handleMenuToggle = () => {
        setMenuOpen(prev => !prev);
    };

    const handleDelete = async () => {
        await api.delete(`/api/v1/playlists/${_id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        setIsDeleted(true)
    }

    const publicVideos = videos.filter(
        (video) => video.isPublished || currentUserData?._id === video.owner._id
    );

    const playlistThumbnail = publicVideos[0]?.thumbnail || process.env.NEXT_PUBLIC_DEFAULT_PLAYLIST_THUMBNAIL

    return (
        <>
            {!(isDeleted || !showPlaylist) && (
                <div
                    className="group relative flex flex-row gap-4 p-2.5 md:p-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-300 rounded-2xl cursor-pointer"
                >
                    {/* Thumbnail with stacked card effect */}
                    <div
                        className="relative flex-none w-[160px] sm:w-[200px] md:w-[220px] shrink-0"
                        onClick={() => router.push(`/playlists/${_id}`)}
                    >
                        {/* Stacked look behind */}
                        <div className="absolute -top-1 left-1 right-1 h-full rounded-xl bg-slate-300/40 dark:bg-slate-700/30 scale-[0.96] -z-10" />
                        <div className="absolute -top-2 left-2 right-2 h-full rounded-xl bg-slate-300/25 dark:bg-slate-700/20 scale-[0.92] -z-20" />

                        {/* Image */}
                        <div className="rounded-xl overflow-hidden shadow-md relative">
                            <Image
                                src={String(playlistThumbnail)}
                                alt={name}
                                width={640}
                                height={360}
                                className="aspect-[16/9] object-cover w-full transition-transform duration-300 group-hover:scale-105"
                                priority
                            />

                            {/* Bottom gradient overlay for video count */}
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />

                            {/* Video count badge */}
                            <div className="absolute bottom-1.5 right-2 flex items-center gap-1 text-white text-[11px] sm:text-xs font-medium z-10">
                                <ListVideo className="w-3.5 h-3.5" />
                                <span>
                                    {publicVideos.length} {publicVideos.length === 1 ? 'video' : 'videos'}
                                </span>
                            </div>

                            {/* Private badge */}
                            {!isPublic && (
                                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md z-10">
                                    <LockKeyhole className="w-3 h-3" />
                                    <span>Private</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details section */}
                    <div
                        className="flex-1 flex flex-col min-w-0 py-1"
                        onClick={() => router.push(`/playlists/${_id}`)}
                    >
                        <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mb-1">
                            {name}
                        </div>
                        <div className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-1.5">
                            {shortDescription}
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
                            @{owner.username}
                        </div>
                    </div>

                    {/* Menu button */}
                    {isOwner && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 m-0 p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMenuToggle();
                                }}
                            >
                                <EllipsisVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl shadow-xl overflow-hidden py-1 z-20">
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(false);
                                            router.push(`/playlists/update/${_id}`);
                                        }}
                                    >
                                        Edit Playlist
                                    </button>

                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(false);
                                            setShowRemoveModal(true);
                                        }}
                                    >
                                        Delete Playlist
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delete modal */}
                    {showRemoveModal ? (
                        <div
                            className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
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
                                        onClick={() => handleDelete()}
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
            )}
        </>
    )
}

export default PlaylistCard;
