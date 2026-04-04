"use client";
import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import Image from 'next/image';
import { EllipsisVertical, X } from 'lucide-react';
import { formatDuration, formatNumber, getUploadAge } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { Video } from '@/types';
import api from '@/lib/api';
import ToggleSaveVideo from '../playlist/ToggleSaveVideo';
import { enhanceAvatarResolution } from '@/lib/utils';

const VideoPreviewCard: React.FC<Video> = (video) => {
    const { _id, createdAt, thumbnail, title, owner, views, duration, isPublished } = video
    const [menuOpen, setMenuOpen] = useState(false);
    const [showReportMenu, setShowReportMenu] = useState(false)
    const [reportStatus, setReportStatus] = useState('')
    const [showReportStatus, setShowReportStatus] = useState(false)
    const [selectedIssue, setSelectedIssue] = useState('');
    const [ownContent, setOwnContent] = useState(false)
    const router = useRouter()
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData)
    const accessToken = useSelector((state: RootState) => state.user.accessToken)
    const [showSaveModal, setShowSaveModal] = useState(false)
    const formatedDuration = formatDuration(duration)
    const uploadAge = getUploadAge(createdAt)
    const formatedViews = formatNumber(views)
    const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
    const [privateVideo, setPrivateVideo] = useState(false)

    let shortTitle = title
    if (title.length > 100) {
        shortTitle = title.slice(0, 100) + '...'
    }

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


    const handleReport = () => {
        setMenuOpen(false)
        setShowReportMenu(true)
    }

    const handleCancelReport = () => {
        setShowReportMenu(false);
        setSelectedIssue('');
    };

    const handleSubmitReport = async () => {
        try {
            setShowReportMenu(false);
            const response = await api.post(`/api/v1/reports/${_id}`, { issue: selectedIssue }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setSelectedIssue('');
            setReportStatus(response.data.message)
            setShowReportStatus(true)
        } catch (error: any) {
            setReportStatus(error.response?.data?.message || 'Failed to submit report.')
            setShowReportStatus(true)
        }
    };

    const avatar = enhanceAvatarResolution(owner.avatar);

    return (
        <>
            {!privateVideo && (
                <div className='mb-6'>
                    <div
                        className="relative h-auto cursor-pointer"
                        onClick={() => router.push(`/video/${_id}`)}
                    >
                        <Image
                            src={thumbnail}
                            alt={title}
                            width={1280}
                            height={720}
                            className="aspect-[16/9] object-cover sm:rounded-xl shadow-md"
                            priority
                        />

                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs font-semibold px-2 py-1 rounded">
                            {formatedDuration}
                        </div>
                    </div>

                    <div className='flex m-2'>
                        <div
                            onClick={() => router.push(`/user/${owner.username}`)}
                            className="mr-3 cursor-pointer"
                        >
                            <Image
                                src={avatar}
                                alt={`${owner.username} avatar`}
                                className="rounded-full w-10 h-10 object-cover"
                                width={40}
                                height={40}
                            />
                        </div>

                        <div className="flex-1 cursor-pointer" onClick={() => router.push(`/video/${_id}`)}>
                            <div className="font-medium text-base">{shortTitle}</div>
                            <div className="text-xs text-gray-600 dark:text-slate-400">
                                {owner.fullName} • {formatedViews} views • {uploadAge}
                            </div>
                        </div>

                        <div className="relative">
                            <Button
                                size={'icon'}
                                onClick={() => setMenuOpen(prev => !prev)}
                                className="ml-4"
                            >
                                <EllipsisVertical className='h-6 w-6' />
                            </Button>
                            {menuOpen && (
                                <div className="absolute right-0 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-10 transition-transform transform translate-y-2">
                                    <button
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                        onClick={() => {
                                            setMenuOpen(false)
                                            router.push(`/video/${_id}`)
                                        }}
                                    >
                                        Play video
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                        onClick={() => {
                                            setMenuOpen(false)
                                            if (isLoggedIn) {
                                                setShowSaveModal(true)
                                            } else {
                                                router.push('/user/auth/login')
                                            }
                                        }}
                                    >
                                        Save video
                                    </button>
                                    {!ownContent && (
                                        <button
                                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                            onClick={() => handleReport()}
                                        >
                                            Report video
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {showReportMenu && (
                        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-[#0b3644] bg-opacity-50 z-50">
                            <div className="bg-white dark:bg-[#103c4b] mx-6 p-4 rounded-xl shadow-lg text-[#0b3644] dark:text-gray-200 w-full max-w-sm">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Report Content</h3>
                                <label htmlFor="issue" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Select an issue:
                                </label>
                                <select
                                    id="issue"
                                    value={selectedIssue}
                                    onChange={(e) => setSelectedIssue(e.target.value)}
                                    className="block w-full p-2 mb-4 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#0c2e39] text-gray-900 dark:text-gray-200 rounded-2xl focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="" disabled>Select an issue</option>
                                    {issueOptions.map((issue) => (
                                        <option key={issue} value={issue}>{issue}</option>
                                    ))}
                                </select>
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button
                                        onClick={() => handleCancelReport()}
                                        className="bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-full"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleSubmitReport()}
                                        disabled={!selectedIssue}
                                        className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 rounded-full"
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showReportStatus && (
                        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-[#0b3644] bg-opacity-50 z-50">
                            <div className="bg-white dark:bg-[#103c4b] mx-6 p-6 rounded-xl shadow-lg text-[#0b3644] dark:text-gray-200 w-full max-w-sm relative">
                                <button
                                    onClick={() => setShowReportStatus(false)}
                                    className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-400 focus:outline-none"
                                >
                                    <X className='h-6 w-6' />
                                </button>
                                <div className="text-center">
                                    <p className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                                        Report Status
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {reportStatus}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {showSaveModal && (
                        <ToggleSaveVideo videoId={_id} onDone={() => setShowSaveModal(false)} />
                    )}
                </div>
            )}
        </>
    )
}

export default VideoPreviewCard;
