"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { RootState } from '@/store/store';
import { EllipsisVertical, Heart } from 'lucide-react';
import { formatNumber, getUploadAge } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ApiError, Comment } from '@/types';
import { enhanceAvatarResolution } from '@/lib/utils';

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
        setEditedContent(content); // Reset to original content
    };

    const handleSubmitEdit = async () => {
        if (!editedContent.trim()) return; // Prevent empty submission

        try {
            const response = await api.patch(`/api/v1/comments/${_id}`, { content: editedContent }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setShowEditModal(false);
            setEditedContent(response.data.data.content); // Update the content after edit
            setCommentContent(response.data.data.content)
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
            // Optionally, handle UI update after deletion
            setIsDeleted(true)
            // console.log('Comment deleted');
            reduceCommentCount()
        } catch (error: any) {
            console.error(error.response?.data?.message || 'Failed to delete comment');
        }
    };

    return (
        <>

            {!isDeleted ? (
                <div className="flex flex-col p-2 border-b border-[#a5bdc5] dark:border-[#485f67]">
                    <div className="flex items-center justify-between">
                        <div
                            className="flex justify-start cursor-default"
                            onClick={() => router.push(`/user/${owner.username}`)}
                        >
                            <img
                                src={enhanceAvatarResolution(owner.avatar)}
                                alt={`${owner.username} avatar`}
                                className="rounded-full w-10 h-10 object-cover mr-4"
                            />
                            <div className="flex flex-col">
                                <div className="flex justify-start gap-2">
                                    <div>{owner.fullName}</div>
                                    <div className="text-slate-500 dark:text-slate-400">@{owner.username}</div>
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm">• {getUploadAge(createdAt)}</div>
                            </div>
                        </div>
                        <div className="relative">
                            <Button size="icon" onClick={() => setMenuOpen(prev => !prev)}>
                                <EllipsisVertical className="ml-5" style={{ height: '24px', width: '24px' }} />
                            </Button>
                            {menuOpen && (
                                <div className="absolute right-0 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-10">
                                    {!ownComment && (
                                        <button
                                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                            onClick={() => handleReport()}
                                        >
                                            Report
                                        </button>
                                    )}
                                    {ownComment && (
                                        <>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                onClick={() => handleEdit()}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                onClick={() => handleDelete()}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {showEditModal ? (
                        <div className="flex flex-col mt-2">
                            <textarea
                                value={editedContent}
                                onChange={handleEditChange}
                                rows={4}
                                className="border border-gray-300 dark:border-gray-700 bg-slate-200 dark:bg-slate-800 text-gray-900 dark:text-gray-200 p-2 rounded-xl"
                            />
                            <div className="flex justify-end gap-4 mt-4">
                                <Button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 w-20 rounded-full text-gray-600 bg-gray-300 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="px-4 py-2 w-20 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                                    onClick={handleSubmitEdit}
                                    disabled={!editedContent.trim()}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="ml-1 mt-2 cursor-default">{commentContent}</div>
                    )}

                    <div className="flex space-x-4 items-center justify-between">
                        <Button size="icon" onClick={toggleLike} className="flex ml-2 gap-1 items-center justify-start">
                            <Heart className={likeStatus ? "text-red-500 fill-red-500" : "text-gray-500 dark:text-gray-300"} />
                            <span>{formatNumber(likesCount)}</span>
                        </Button>
                    </div>

                    {showReportMenu && (
                        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-[#0b3644] bg-opacity-60 z-50">
                            <div className="bg-white dark:bg-[#103c4b] p-4 rounded-lg shadow-md text-center text-gray-900 dark:text-gray-200 w-80">
                                <h3 className="font-bold mb-2">Report this comment</h3>
                                <select
                                    value={selectedIssue}
                                    onChange={(e) => setSelectedIssue(e.target.value)}
                                    className="w-full p-2 bg-gray-100 dark:bg-[#0c2e39] text-gray-900 dark:text-gray-200 rounded-md"
                                >
                                    <option value="">Select an issue</option>
                                    {issueOptions.map((issue) => (
                                        <option key={issue} value={issue}>{issue}</option>
                                    ))}
                                </select>
                                <div className="flex justify-between mt-2">
                                    <Button size="sm" onClick={handleCancelReport}>Cancel</Button>
                                    <Button size="sm" onClick={handleSubmitReport} disabled={!selectedIssue}>Submit</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showReportStatus && (
                        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-opacity-60 backdrop-blur-md z-50">
                            <div className="bg-white dark:bg-[#103c4b] p-4 rounded-lg shadow-md text-center text-gray-900 dark:text-gray-200">
                                {reportStatus}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <></>
            )}

        </>
    );
};

export default CommentCard;
