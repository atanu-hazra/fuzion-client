"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import { EllipsisVertical, ThumbsUp } from 'lucide-react';
import { formatNumber, getUploadAge } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Comment } from '@/types';
import { enhanceAvatarResolution } from '@/lib/utils';
import Image from 'next/image';

interface CommentCardProps {
    comment: Comment;
    reduceCommentCount: () => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, reduceCommentCount }) => {
    const { _id, createdAt, content, owner, isLikedByUser } = comment;
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const currentUserData = useSelector((state: RootState) => state.user.currentUserData);
    const [commentContent, setCommentContent] = useState(content)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [likeStatus, setLikeStatus] = useState(isLikedByUser);
    const [likesCount, setLikesCount] = useState(Number(comment.likesCount));
    const [menuOpen, setMenuOpen] = useState(false);
    const [showReportMenu, setShowReportMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [reportStatus, setReportStatus] = useState('');
    const [showReportStatus, setShowReportStatus] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState('');
    const [ownComment, setOwnComment] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false)
    const router = useRouter();

    const issueOptions = [
        "Sexual content", "Spam or misleading", "Hateful or abusive content",
        "Violent content", "Copyright violation", "Privacy violation",
        "Harmful or dangerous acts", "Scams/fraud", "Others"
    ];

    useEffect(() => {
        if (currentUserData) setIsLoggedIn(true);
        if (currentUserData?._id === owner._id) setOwnComment(true);
    }, [currentUserData, owner._id]);

    const toggleLike = async () => {
        if (!isLoggedIn) {
            router.push('/user/auth/login');
            return;
        }

        if (likeStatus) {
            setLikesCount(prev => prev - 1);
        } else {
            setLikesCount(prev => prev + 1);
        }
        setLikeStatus(prev => !prev);

        try {
            await api.post(`/api/v1/likes/toggle/comment/${_id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
        } catch (error: any) {
            setLikeStatus(prev => !prev);
            setLikesCount(prev => (likeStatus ? prev + 1 : prev - 1));
            console.error(error.response?.data?.message || "Something went wrong while liking or disliking the comment.");
        }
    };

    const handleReport = () => {
        if (!isLoggedIn) {
            router.push('/user/auth/login');
            return;
        }
        setMenuOpen(false);
        setShowReportMenu(true);
    };

    const handleCancelReport = () => {
        setShowReportMenu(false);
        setSelectedIssue('');
    };

    const handleSubmitReport = async () => {
        try {
            setShowReportMenu(false);
            const response = await api.post(`/api/v1/reports/${_id}`, { issue: selectedIssue }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setSelectedIssue('');
            setReportStatus(response.data.message);
            setShowReportStatus(true);
        } catch (error: any) {
            setReportStatus(error.response?.data?.message || 'Failed to submit report.');
            setShowReportStatus(true);
        }
    };

    const handleEdit = () => {
        setMenuOpen(false);
        setShowEditModal(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(e.target.value);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditedContent(commentContent);
    };

    const handleSubmitEdit = async () => {
        if (!editedContent.trim()) return;

        try {
            const response = await api.patch(`/api/v1/comments/${_id}`, { content: editedContent }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setShowEditModal(false);
            setCommentContent(response.data.data.content);
        } catch (error: any) {
            console.error(error.response?.data?.message || 'Failed to update the comment.');
        }
    };

    const handleDelete = async () => {
        setMenuOpen(false)
        try {
            await api.delete(`/api/v1/comments/${_id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setIsDeleted(true)
            reduceCommentCount()
        } catch (error: any) {
            console.error(error.response?.data?.message || 'Failed to delete comment');
        }
    };

    if (isDeleted) return null;

    return (
        <div className="group flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors px-1 sm:px-2 rounded-xl">
            {/* Left: Avatar */}
            <div 
                className="shrink-0 cursor-pointer"
                onClick={() => router.push(`/user/${owner.username}`)}
            >
                <Image
                    src={enhanceAvatarResolution(owner.avatar)}
                    alt={owner.username}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
            </div>

            {/* Right: Content Section */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-0.5">
                        <span 
                            className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:underline"
                            onClick={() => router.push(`/user/${owner.username}`)}
                        >
                            {owner.fullName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {getUploadAge(createdAt)}
                        </span>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                        <button 
                            onClick={() => setMenuOpen(prev => !prev)}
                            className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 
                                ${menuOpen ? 'bg-slate-100 dark:bg-slate-800 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <EllipsisVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </button>
                        
                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                                {!ownComment ? (
                                    <button
                                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        onClick={handleReport}
                                    >
                                        Report
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={handleEdit}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment Body */}
                {showEditModal ? (
                    <div className="mt-2 space-y-3">
                        <textarea
                            value={editedContent}
                            onChange={handleEditChange}
                            rows={3}
                            className="w-full text-sm bg-slate-100 dark:bg-slate-800/50 border-b-2 border-slate-900 dark:border-slate-100 p-2 focus:outline-none resize-none rounded-t-lg transition-all"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-8 px-4 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitEdit}
                                disabled={!editedContent.trim()}
                                className={`h-8 px-5 rounded-full text-xs font-medium transition-all
                                    ${!editedContent.trim()
                                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                        : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                                    }`}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words">
                        {commentContent}
                    </p>
                )}

                {/* Actions Row */}
                <div className="flex items-center gap-1 mt-1.5">
                    <button 
                        onClick={toggleLike}
                        className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/like"
                    >
                        <ThumbsUp className={`w-4 h-4 transition-all ${likeStatus ? 'text-slate-900 dark:text-slate-100 fill-slate-900 dark:fill-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`} />
                        {likesCount > 0 && (
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {formatNumber(likesCount)}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Modals & Status */}
            {showReportMenu && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm z-[100]">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Report comment</h3>
                        <div className="space-y-1 mb-6">
                            {issueOptions.map((issue) => (
                                <button
                                    key={issue}
                                    onClick={() => setSelectedIssue(issue)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors
                                        ${selectedIssue === issue 
                                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    {issue}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={handleCancelReport}
                                className="rounded-full px-6"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmitReport} 
                                disabled={!selectedIssue}
                                className="rounded-full px-6 bg-rose-500 hover:bg-rose-600 text-white border-none"
                            >
                                Report
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showReportStatus && (
                <div className="fixed bottom-4 right-4 z-[110] animate-in slide-in-from-right duration-300">
                    <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-xl text-sm font-medium">
                        {reportStatus}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentCard;
