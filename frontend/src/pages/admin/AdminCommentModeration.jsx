import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Check, X, MessageSquare, Clock, ExternalLink, Loader2 } from 'lucide-react';

const AdminCommentModeration = () => {
  const [pendingComments, setPendingComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingComments();
  }, []);

  const fetchPendingComments = async () => {
    try {
      const comments = await adminApi.getPendingComments();
      setPendingComments(comments);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId) => {
    setActionLoading(commentId);
    try {
      await adminApi.approveComment(commentId);
      setPendingComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {

    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (commentId) => {
    setActionLoading(commentId);
    try {
      await adminApi.rejectComment(commentId);
      setPendingComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {

    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e73be]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Comment Moderation
        </h1>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {pendingComments.length} pending
        </span>
      </div>

      {pendingComments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No pending comments</h3>
          <p className="text-gray-400 mt-1">All comments have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              data-testid={`pending-comment-${comment.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Comment Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-800">{comment.author}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {/* Poem Link */}
                  {comment.poemTitle && (
                    <Link
                      to={`/poem/${comment.poemSlug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm text-[#1e73be] hover:underline"
                    >
                      On: {comment.poemTitle}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(comment.id)}
                    disabled={actionLoading === comment.id}
                    className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    data-testid={`approve-${comment.id}`}
                  >
                    {actionLoading === comment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(comment.id)}
                    disabled={actionLoading === comment.id}
                    className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    data-testid={`reject-${comment.id}`}
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommentModeration;
