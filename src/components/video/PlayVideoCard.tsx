import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Bookmark, Heart } from 'lucide-react';
import ReactPlayer from 'react-player';
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

const PlayVideoCard: React.FC<{ video: Video }> = ({ video }) => {
    const { _id, title, description, videoFile, owner, isLikedByUser, views, createdAt, likesCount } = video;
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const videoOwner = useUserInfo(owner.username);
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(true);
    const [likeStatus, setLikeStatus] = useState(isLikedByUser);
    const [likesCountState, setLikesCountState] = useState(Number(likesCount));
    const isLoggedIn = useMemo(() => !!currentUserData, [currentUserData]);
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [shortDescription, setShortDescription] = useState('')
    const [showShortDescription, setShowShortDescription] = useState(false)
    const ownerVideos = useUserVideos(String(owner._id)).filter((v) => v._id !== _id)
    const recommendedVideos = shuffleElements(ownerVideos).slice(0, 4)

    useEffect(() => {
        if (description.length > 100) {
            setShowShortDescription(true)
            setShortDescription(description.slice(0, 100))
        } else {
            setShortDescription(description)
        }
    }, [description])

    const toggleDescription = () => {
        setShowShortDescription(prev => !prev)
    }

    const secureVideoFile = videoFile.replace(/^http:\/\//, 'https://');

    const uploadAge = getUploadAge(createdAt);

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev)
    };

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

    return (
        <>
            <div className="rounded-lg overflow-hidden shadow-md">
                <div onClick={togglePlayPause} className="relative cursor-pointer">
                    <ReactPlayer
                        url={secureVideoFile}
                        playing={isPlaying}
                        controls
                        width="100%"
                        height="100%"
                        className="react-player"
                    />
                </div>

                <div className="px-2 py-1">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{formatNumber(views)} views • {uploadAge}</p>
                    <p
                        className="text-sm text-slate-700 dark:text-slate-200  mt-2 cursor-default"
                        onClick={toggleDescription}
                    >
                        {showShortDescription ? shortDescription : description}
                        {showShortDescription && <span className='text-gray-500'>...read more</span>}
                    </p>
                </div>

                <div className="mx-2 flex items-center justify-between">
                    <Button size="icon" onClick={toggleLike} className="flex items-center">
                        <Heart
                            className={likeStatus ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                            style={{ height: '24px', width: '24px' }}
                        />
                        <span className="ml-1 text-sm">{formatNumber(likesCountState)}</span>
                    </Button>

                    <Button size="icon"
                        onClick={() => {
                            if (isLoggedIn) {
                                setShowSaveModal(true)
                            } else {
                                router.push('/user/auth/login')
                            }
                        }}
                        className="flex items-center">
                        <Bookmark
                            className='text-slate-800 dark:text-slate-200'
                            style={{ height: '24px', width: '24px' }}
                        />
                    </Button>
                </div>

                {videoOwner && (
                    <div className="bg-slate-200 dark:bg-slate-800 bg-opacity-75">
                        <UserCard fetchedUser={videoOwner} enableBio={false} />
                    </div>
                )}

                {showSaveModal && (
                    <ToggleSaveVideo videoId={_id} onDone={() => setShowSaveModal(false)} />
                )}
            </div>
            <VideoComments />
            <div
                className="text-lg text-center font-medium mx-2 mt-2 mb-4 py-1 bg-blue-400 text-slate-50 dark:bg-blue-600 dark:text-slate-200"
            >
                You Might Also Like
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
