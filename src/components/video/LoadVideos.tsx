"use client";
import React from 'react';
import useLoadVideos from '@/hooks/video/useLoadVideos';
import VideoPreviewCard from './VideoPreviewCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { shuffleElements } from '@/lib/helpers';
import InfiniteScroll from "react-infinite-scroll-component";

interface LoadVideosProps {
    query?: string
}

const LoadVideos: React.FC<LoadVideosProps> = ({ query = '' }) => {
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const { loadedVideos, fetchVideos, hasMore, loading } = useLoadVideos(query);

    const accessibleVideos = loadedVideos.filter(
        (video) => video.isPublished || currentUserData?._id === video.owner._id
    );

    if (!accessibleVideos.length && !loading) {
        return (
            <div className="text-center text-gray-500 p-4">
                No videos found.
            </div>
        )
    }

    return (
        <InfiniteScroll
            dataLength={accessibleVideos.length} // Length of currently loaded videos
            next={fetchVideos} // Function to fetch more videos
            hasMore={hasMore} // Whether there are more videos to load
            loader={<p className="text-center text-gray-500 p-4">Loading...</p>} // Loader component
            endMessage={<p className="text-center text-gray-500 p-4">No more videos to show</p>} // Message when all videos are loaded
        >
            <div className="sm:grid sm:grid-cols-2 sm:gap-4 sm:mx-2">
                {accessibleVideos.map((video) => {
                    return <VideoPreviewCard key={video._id} {...video}   />
                })}
            </div>

        </InfiniteScroll>
    )
}
export default LoadVideos
