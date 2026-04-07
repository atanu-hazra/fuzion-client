import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Bookmark, Heart, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import { formatNumber, getUploadAge, shuffleElements } from '@/lib/helpers';
import api from '@/lib/api';
import { Video } from '@/types';
import useUserInfo from '@/hooks/user/useUserInfo';
import UserCard from '../user/UserCard';
import ToggleSaveVideo from '../playlist/ToggleSaveVideo';
import VideoComments from '../comment/VideoComments';
import LoadVideos from './LoadVideos';
import VideoPreviewCard from './VideoPreviewCard';
import useUserVideos from '@/hooks/user/useUserVideos';
import VideoPlayer from './VideoPlayer';

const PlayVideoCard: React.FC<{ video: Video }> = ({ video }) => {
    const { _id, title, description, videoFile, owner, isLikedByUser, views, createdAt, likesCount } = video;
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const videoOwner = useUserInfo(owner.username);
    const router = useRouter();
    const [likeStatus, setLikeStatus] = useState(isLikedByUser);
    const [likesCountState, setLikesCountState] = useState(Number(likesCount));
    const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [showFullDescription, setShowFullDescription] = useState(false)
    const ownerVideos = useUserVideos(String(owner._id)).filter((v) => v._id !== _id)
    const recommendedVideos = shuffleElements(ownerVideos).slice(0, 4)

    const isLongDescription = description.length > 100;

    const secureVideoFile = videoFile.replace(/^http:\/\//, 'https://');

    const uploadAge = getUploadAge(createdAt);

    const toggleLike = async () => {
        if (!isLoggedIn) {
            router.push('/user/auth/login');
            return;
        }

        setLikeStatus(!likeStatus);
        setLikesCountState((prev) => (likeStatus ? prev - 1 : prev + 1));

        try {
            await api.post(`/api/v1/likes/toggle/video/${_id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
        } catch (error: any) {
            setLikeStatus(!likeStatus);
            setLikesCountState((prev) => (likeStatus ? prev + 1 : prev - 1));
            console.error(error.response?.data?.message || 'Error toggling like status.');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url: window.location.href });
            } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <>
            {/* Video Player */}
            <div className="bg-black rounded-none overflow-hidden shadow-lg">
                <VideoPlayer src={secureVideoFile} />
            </div>

            {/* Video Info Section */}
            <div className="px-3 sm:px-4 pt-3 pb-1">
                {/* Title */}
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {title}
                </h1>

                {/* Meta + Actions row */}
                <div className="flex items-center justify-between mt-2">
                    {/* Views & Age */}
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatNumber(views)} views <span className="mx-1">·</span> {uploadAge}
                    </p>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        {/* Like */}
                        <button
                            onClick={toggleLike}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 active:scale-95"
                        >
                            <Heart
                                className={`w-5 h-5 transition-colors ${likeStatus ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {formatNumber(likesCountState)}
                            </span>
                        </button>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 active:scale-95"
                        >
                            <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">Share</span>
                        </button>

                        {/* Save */}
                        <button
                            onClick={() => {
                                if (isLoggedIn) {
                                    setShowSaveModal(true)
                                } else {
                                    router.push('/user/auth/login')
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150 active:scale-95"
                        >
                            <Bookmark className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">Save</span>
                        </button>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div
                        className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors"
                        onClick={() => setShowFullDescription(prev => !prev)}
                    >
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {showFullDescription ? description : (isLongDescription ? description.slice(0, 100) : description)}
                            {isLongDescription && !showFullDescription && (
                                <span className="text-slate-500 dark:text-slate-400">...</span>
                            )}
                        </p>
                        {isLongDescription && (
                            <button className="mt-1 flex items-center gap-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                {showFullDescription ? (
                                    <>Show less <ChevronUp className="w-3.5 h-3.5" /></>
                                ) : (
                                    <>Show more <ChevronDown className="w-3.5 h-3.5" /></>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Owner Card */}
            {videoOwner && (
                <div className="px-2 sm:px-3">
                    <UserCard fetchedUser={videoOwner} enableBio={false} />
                </div>
            )}

            {showSaveModal && (
                <ToggleSaveVideo videoId={_id} onDone={() => setShowSaveModal(false)} />
            )}

            {/* Comments */}
            <VideoComments />

            {/* You Might Also Like */}
            <div className="mt-4 mb-3 px-3">
                <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2">
                        You Might Also Like
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
            {recommendedVideos.length > 0
                ? (
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:mx-2">
                        {recommendedVideos.map((video) => {
                            return <VideoPreviewCard key={video._id} {...video} />
                        })}
                    </div>
                )
                : <></>
            }
            <LoadVideos />
        </>
    );
};

export default PlayVideoCard;
