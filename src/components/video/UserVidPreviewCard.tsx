"use client";
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import Image from 'next/image';
import { EllipsisVertical, Lock, X } from 'lucide-react';
import { formatDuration, formatNumber, getUploadAge } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { Video } from '@/types';
import api from '@/lib/api';
import ToggleSaveVideo from '../playlist/ToggleSaveVideo';

interface UserVidPreviewCardProps {
    video: Video
}

const UserVidPreviewCard: React.FC<UserVidPreviewCardProps> = ({ video }) => {
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showReportMenu, setShowReportMenu] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState('');
    const [reportStatus, setReportStatus] = useState('');
    const [showReportStatus, setShowReportStatus] = useState(false);
    const [ownContent, setOwnContent] = useState(false)
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData)
    const [showRemoveModal, setShowRemoveModal] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
    const [privateVideo, setPrivateVideo] = useState(false)
    const duration: string = formatDuration(video.duration);
    const views: string = formatNumber(video.views);
    const videoAge: string = getUploadAge(video.createdAt);
    const { _id, thumbnail, title, owner, isPublished } = video

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

    const handleDeleteVideo = async () => {
        setMenuOpen(false)
        setShowRemoveModal(false)
        await api.delete(`/api/v1/videos/${_id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data",
            },
        });

        setIsDeleted(true)
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
                            {!isPublished && (
                                <div className="mt-2 text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[10px] sm:text-xs bg-slate-100 dark:bg-white/10 w-fit px-2 py-0.5 rounded-md">
                                    <Lock className="w-3 h-3" />
                                    <span>Private</span>
                                </div>
                            )}
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
                                    <button
                                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50 transition-colors"
                                        onClick={() => {
                                            if (isLoggedIn) {
                                                setShowSaveModal(true);
                                                setMenuOpen(false);
                                            } else {
                                                router.push('/user/auth/login');
                                            }
                                        }}
                                    >
                                        Save video
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

                                    {ownContent && (
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                setShowRemoveModal(true);
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

                    {showSaveModal ? (
                        <ToggleSaveVideo videoId={_id} onDone={() => setShowSaveModal(false)} />
                    ) : null}

                    {showRemoveModal ? (
                        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/40 z-50">
                            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex flex-col justify-center gap-2 mx-4 p-6 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 max-w-sm w-full">
                                <div className="font-semibold text-lg text-slate-900 dark:text-slate-100 text-center">
                                    Delete video?
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 text-sm text-center mb-4">
                                    Once you delete this video, it will no longer be available to you and other users.
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 rounded-full transition-colors"
                                        onClick={() => handleDeleteVideo()}
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
            ) : null}
        </>
    );
}

export default UserVidPreviewCard;
