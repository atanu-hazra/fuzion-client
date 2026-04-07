"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import usePlaylist from '@/hooks/playlist/usePlaylist';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Image from 'next/image';
import { Trash, Edit, LockKeyhole, Play, ListVideo } from 'lucide-react';
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
            <div className="mx-2 md:mx-4">
                {/* Desktop: side-by-side layout like YouTube */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                    {/* Header Card — sticky sidebar on desktop */}
                    <div className="lg:w-[380px] xl:w-[420px] lg:shrink-0 lg:sticky lg:top-4 lg:self-start">
                        <div
                            className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-lg"
                            style={{
                                backgroundImage: `url(${playlistThumbnail})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        >
                            {/* Blur overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/60 to-slate-900/80 backdrop-blur-2xl" />

                            {/* Content */}
                            <div className="relative z-10 p-5 md:p-6 flex flex-col gap-4">
                                {/* Main thumbnail */}
                                <div
                                    className="relative rounded-xl overflow-hidden shadow-xl cursor-pointer group/thumb"
                                    onClick={() => {
                                        if (accessibleVideos.length > 0) {
                                            router.push(`/video/${accessibleVideos[0]._id}`);
                                        }
                                    }}
                                >
                                    <Image
                                        src={String(playlistThumbnail)}
                                        alt={name}
                                        width={640}
                                        height={360}
                                        className="aspect-[16/9] object-cover w-full transition-transform duration-500 group-hover/thumb:scale-105"
                                        priority
                                    />

                                    {/* Play overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 scale-75 group-hover/thumb:scale-100 transition-all duration-300 shadow-lg">
                                            <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Video count */}
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-xs font-medium">
                                        <ListVideo className="w-3.5 h-3.5" />
                                        {accessibleVideos.length} {accessibleVideos.length === 1 ? 'video' : 'videos'}
                                    </div>
                                </div>

                                {/* Playlist info */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start gap-2">
                                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight flex-1">
                                            {name}
                                        </h1>
                                        {!playlist.isPublic && (
                                            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2 py-1 rounded-md mt-1 shrink-0">
                                                <LockKeyhole className="w-3 h-3" />
                                                <span>Private</span>
                                            </div>
                                        )}
                                    </div>

                                    {description && (
                                        <p className="text-sm text-slate-300 dark:text-slate-300 leading-relaxed line-clamp-3">
                                            {description}
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-white/10" />

                                {/* Owner info + Actions */}
                                <div className="flex items-center justify-between">
                                    <div
                                        className="flex items-center gap-3 cursor-pointer group/owner"
                                        onClick={() => router.push(`/user/${username}`)}
                                    >
                                        <Image
                                            src={String(ownerAvatar)}
                                            alt={`${username}'s avatar`}
                                            width={36}
                                            height={36}
                                            className="aspect-square rounded-full object-cover ring-2 ring-white/20 group-hover/owner:ring-white/40 transition-all"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-white/90 group-hover/owner:text-white transition-colors">
                                                {fullName}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                @{username}
                                            </div>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Edit Playlist"
                                                className="h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                                                onClick={() => {
                                                    router.push(`/playlists/update/${_id}`);
                                                }}
                                            >
                                                <Edit className="h-[18px] w-[18px]" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Delete playlist"
                                                className="h-9 w-9 rounded-full text-white/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                                onClick={() => setShowRemoveModal(true)}
                                            >
                                                <Trash className="h-[18px] w-[18px]" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Play All button */}
                                {accessibleVideos.length > 0 && (
                                    <Button
                                        className="w-full bg-white text-slate-900 hover:bg-white/90 rounded-full font-semibold shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                                        onClick={() => router.push(`/video/${accessibleVideos[0]._id}`)}
                                    >
                                        <Play className="w-5 h-5 mr-2" fill="currentColor" />
                                        Play All
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Video list */}
                    <div className="flex-1 min-w-0">
                        {accessibleVideos.length > 0
                            ? (
                                <div className="pb-[30%] md:pb-[10%] flex flex-col gap-1">
                                    {accessibleVideos.map((video, index) => (
                                        <div key={video._id} className="flex items-start gap-0">
                                            {/* Index number */}
                                            <div className="hidden sm:flex items-center justify-center w-8 shrink-0 pt-5 text-sm text-slate-400 dark:text-slate-500 font-medium">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <PlaylistVideoCard video={video} isPlaylistOwner={isOwner} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                            : (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-16">
                                    <div className="text-4xl mb-3">🎬</div>
                                    <div className="text-sm font-medium">No videos in this playlist yet</div>
                                </div>
                            )}
                    </div>
                </div>

                {/* Delete modal */}
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