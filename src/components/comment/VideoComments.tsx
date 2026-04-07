"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import useVideoComments from '@/hooks/comment/useVideoComments';
import CommentCard from './CommentCard';
import Image from 'next/image';
import { enhanceAvatarResolution } from '@/lib/utils';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

const VideoComments: React.FC = () => {
    const { id } = useParams();
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const router = useRouter();

    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!currentUserData);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showAllComments, setShowAllCommnets] = useState(false)
    const [commentsCount, setCommentsCount] = useState(0)
    const videoComments = useVideoComments(String(id), refreshTrigger);

    useEffect(() => {
        setCommentsCount(videoComments.length)
    }, [videoComments, refreshTrigger, id])

    useEffect(() => {
        setIsLoggedIn(!!currentUserData);
    }, [currentUserData]);

    const handleAddComment = async () => {
        if (!isLoggedIn) {
            router.push("/user/auth/login");
            return;
        }

        if (!newComment.trim()) {
            alert("Comment content cannot be empty.");
            return;
        }

        setLoading(true);
        try {
            await api.post(
                `/api/v1/comments/v/${id}`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            setRefreshTrigger((prev) => !prev);
            setNewComment('');
            setIsFocused(false);
        } catch (error: any) {
            console.error("Error adding comment:", error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelComment = () => {
        setNewComment('');
        setIsFocused(false);
    };

    const reduceCommentCount = () => {
        setCommentsCount(prev => prev - 1)
    }

    const currentAvatar = currentUserData?.avatar
        ? enhanceAvatarResolution(currentUserData.avatar)
        : null;

    return (
        <div className="px-2 mt-4">
            {/* Header */}
            <button
                className="w-full flex items-center justify-between py-3 px-1 group"
                onClick={() => setShowAllCommnets(prev => !prev)}
            >
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Comments
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {commentsCount}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    <span>{showAllComments ? "Show less" : "Show all"}</span>
                    {showAllComments
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    }
                </div>
            </button>

            <div className="border-t border-slate-200 dark:border-slate-800" />

            {/* Comment input */}
            <div className="py-4 flex gap-3 items-start">
                {/* Current user avatar */}
                {currentAvatar && (
                    <Image
                        src={currentAvatar}
                        alt="Your avatar"
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                )}

                <div className="flex-1 min-w-0">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        rows={isFocused ? 3 : 1}
                        className={`w-full text-sm border-b-2 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent
                            text-slate-900 dark:text-slate-100
                            transition-all duration-200
                            focus:outline-none
                            ${isFocused
                                ? 'border-slate-900 dark:border-slate-100 pb-2'
                                : 'border-slate-200 dark:border-slate-700 pb-1'
                            }`}
                        placeholder="Add a comment..."
                    />
                    {isFocused && (
                        <div className="mt-2 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleCancelComment}
                                disabled={loading}
                                className="h-8 px-4 rounded-full text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddComment}
                                disabled={loading || !newComment.trim()}
                                className={`h-8 px-5 rounded-full text-sm font-medium transition-all duration-200
                                    ${loading || !newComment.trim()
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                        : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-80 active:scale-[0.97]'
                                    }`}
                            >
                                {loading ? "Posting..." : "Comment"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments list */}
            <div>
                {videoComments && videoComments.length ? (
                    videoComments.length > 1
                        ? showAllComments
                            ? (videoComments.map((comment) => (
                                <CommentCard
                                    key={comment._id}
                                    comment={comment}
                                    reduceCommentCount={reduceCommentCount}
                                />
                            )))
                            : (
                            <CommentCard
                                key={videoComments[0]._id}
                                comment={videoComments[0]}
                                reduceCommentCount={reduceCommentCount}
                            />
                        )
                        : (
                        <CommentCard
                            key={videoComments[0]._id}
                            comment={videoComments[0]}
                            reduceCommentCount={reduceCommentCount}
                        />
                    )
                ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">
                        No comments yet. Be the first to comment!
                    </p>
                )}
            </div>
        </div>
    );
};

export default VideoComments;
