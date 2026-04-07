"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import Image from 'next/image';
import { EllipsisVertical, X } from 'lucide-react';
import { formatDuration, formatNumber, getUploadAge } from '@/lib/helpers';
import { useParams, useRouter } from 'next/navigation';
import { Video } from '@/types';
import api from '@/lib/api';

interface PlaylistVideoCardProps {
    video: Video
    isPlaylistOwner: boolean
}

const PlaylistVideoCard: React.FC<PlaylistVideoCardProps> = ({ video, isPlaylistOwner }) => {
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData)
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const router = useRouter();
    const { id: playlistId } = useParams()
    const [menuOpen, setMenuOpen] = useState(false);
    const [showReportMenu, setShowReportMenu] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState('');
    const [reportStatus, setReportStatus] = useState('');
    const [showReportStatus, setShowReportStatus] = useState(false);
    const [ownContent, setOwnContent] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const duration: string = formatDuration(video.duration);
    const views: string = formatNumber(video.views);
    const videoAge: string = getUploadAge(video.createdAt);
    const { _id, thumbnail, title, owner, isPublished } = video
    const [privateVideo, setPrivateVideo] = useState(false)

    useEffect(() => {
        if (currentUserData?._id === owner._id) {
            setOwnContent(true);
        } else {
            setOwnContent(false);
        }
    }, [currentUserData, owner._id]);
    
    useEffect(() => {
        if (!isPublished && !ownContent) {
            setPrivateVideo(true);
        } else {
            setPrivateVideo(false);
        }
    }, [isPublished, ownContent]);


    const issueOptions = [
        "Sexual content",
        "Spam or misleading",
        "Hateful or abusive content",
        "Violent content",
        "Copyright violation",
        "Privacy violation",
        "Harmful or dangerous acts",
        "Scams/fraud",
        "Others"
    ];

    const handleMenuToggle = () => {
        setMenuOpen(prev => !prev);
    };

    const handleReport = () => {
        setMenuOpen(false)
        setShowReportMenu(true);
    };

    const handleCancelReport = () => {
        setShowReportMenu(false);
        setSelectedIssue(''); // Reset selected issue
    };

    const handleSubmitReport = async () => {
        try {
            setShowReportMenu(false);
            const response = await api.post(`/api/v1/reports/${_id}`, { issue: selectedIssue }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setSelectedIssue('');
            setReportStatus(response.data.message);
            setShowReportStatus(true);
        } catch (error: any) {
            setReportStatus(error.response?.data?.message || 'Failed to submit report.');
            setShowReportStatus(true);
        }
    };

    const removeVidFromPlaylist = async () => {
        setIsDeleted(true)
        await api.patch(`/api/v1/playlists/remove/${_id}/${playlistId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
    }


    return (
        <>
            {(!isDeleted && !privateVideo) ? (
                <div className="relative md:my-2 w-full">
                    <div className="group relative flex flex-row gap-3 p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors duration-300 rounded-2xl">
                        {/* Thumbnail Section */}
                        <div
                            className="relative flex-none w-[150px] sm:w-[200px] md:w-[240px] cursor-pointer rounded-xl overflow-hidden shadow-sm shrink-0"
                            onClick={() => router.push(`/video/${_id}`)}
                        >
                            <Image
                                src={thumbnail}
                                alt={title}
                                width={640}
                                height={360}
                                className="object-cover aspect-[16/9] w-full h-full transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                                priority
                            />
                            {/* Duration Overlay */}
                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-md">
                                {duration}
                            </div>
                        </div>

                        {/* Video Details */}
                        <div
                            className="flex-1 flex flex-col min-w-0 pr-6 py-0.5 sm:py-1 cursor-pointer"
                            onClick={() => router.push(`/video/${_id}`)}
                        >
                            <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight mb-1">
                                {video.title}
                            </div>
                            <div className="text-[11px] sm:text-[13px] text-slate-500 dark:text-slate-400">
                                {views} views <span className="mx-0.5 sm:mx-1">•</span> {videoAge}
                            </div>
                        </div>

                        {/* Options Button */}
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 m-0 p-0"
                                onClick={() => handleMenuToggle()}
                            >
                                <EllipsisVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            {menuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl shadow-xl overflow-hidden py-1 transform transition-all z-20">
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            router.push(`/video/${_id}`);
                                        }}
                                    >
                                        Play video
                                    </button>
                                    {!ownContent && (
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors"
                                            onClick={() => handleReport()}
                                        >
                                            Report video
                                        </button>
                                    )}

                                    {ownContent && (
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                router.push(`/video/edit/${_id}`);
                                            }}
                                        >
                                            Edit video
                                        </button>
                                    )}
                                    {isPlaylistOwner && (
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                removeVidFromPlaylist();
                                            }}
                                        >
                                            Remove from playlist
                                        </button>
                                    )}

                                    {ownContent && (
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                            onClick={async () => {
                                                setMenuOpen(false);
                                                try {
                                                    await api.delete(`/api/v1/videos/${_id}`, {
                                                        headers: {
                                                            Authorization: `Bearer ${accessToken}`,
                                                            "Content-Type": "multipart/form-data",
                                                        },
                                                    });
                                                    setIsDeleted(true);
                                                } catch (error) {
                                                    console.error("Failed to delete video");
                                                }
                                            }}
                                        >
                                            Delete video
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {showReportMenu ? (
                        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl mx-6 p-6 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-sm">
                                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Report Video</h3>

                                <label htmlFor="issue" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select an issue:
                                </label>
                                <select
                                    id="issue"
                                    value={selectedIssue}
                                    onChange={(e) => setSelectedIssue(e.target.value)}
                                    className="block w-full p-2.5 mb-6 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                                >
                                    <option value="" disabled>Select an issue</option>
                                    {issueOptions.map((issue) => (
                                        <option key={issue} value={issue}>{issue}</option>
                                    ))}
                                </select>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleCancelReport()}
                                        className="rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleSubmitReport()}
                                        disabled={!selectedIssue}
                                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-md shadow-blue-500/20"
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {showReportStatus ? (
                        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl mx-6 p-6 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-sm relative">
                                <button
                                    onClick={() => setShowReportStatus(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="text-center">
                                    <p className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                                        Report Status
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {reportStatus}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}

export default PlaylistVideoCard;
