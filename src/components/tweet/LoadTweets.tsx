"use client";
import React from 'react';
import useLoadTweets from '@/hooks/tweet/useLoadTweets';
import TweetCard from './TweetCard';
import { shuffleElements } from '@/lib/helpers';
import InfiniteScroll from 'react-infinite-scroll-component';

interface LoadTweetsProps {
    query?: string
}

const LoadTweets: React.FC<LoadTweetsProps> = ({ query = '' }) => {
    const { loadedTweets, fetchTweets, hasMore, loading } = useLoadTweets(query)

    if (!loadedTweets.length && !loading) {
        return (
            <div className="text-center text-gray-500 p-4">
                No tweets found.
            </div>
        )
    }

    return (
        <InfiniteScroll
            dataLength={loadedTweets.length}
            next={fetchTweets}
            hasMore={hasMore}
            loader={<p className="text-center text-gray-500 p-4">Loading...</p>}
            endMessage={<p className="text-center text-gray-500 p-4">No more tweets to show</p>}
        >
            <div>
                {loadedTweets.map((tweet) => {
                    return <TweetCard key={tweet._id} tweet={tweet} />
                })}
            </div>
        </InfiniteScroll>
    )
}
export default LoadTweets
