"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";

interface Comment {
  _id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

export default function CaseComments({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const COMMENTS_PER_PAGE = 10;

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/cases/${slug}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
          setTotalCount(data.comments.length);
        }
      } catch (error) {
        console.error("Failed to fetch comments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [slug]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || commentBody.length < 3) return;
    if (!session?.user) return;

    setPosting(true);

    const newComment = {
      _id: `temp-${Date.now()}`,
      userId: session.user.id,
      userName: session.user.name || "User",
      body: commentBody.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
    };

    // Optimistic update
    setComments([newComment, ...comments]);
    setTotalCount((prev) => prev + 1);
    setCommentBody("");

    try {
      const res = await fetch(`/api/cases/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newComment.body }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp comment with actual comment
        setComments((prev) =>
          prev.map((c) => (c._id === newComment._id ? data.comment : c))
        );
      } else {
        // Revert optimistic update
        setComments((prev) => prev.filter((c) => c._id !== newComment._id));
        setTotalCount((prev) => prev - 1);
        setCommentBody(newComment.body); // restore body
        alert("Failed to post comment.");
      }
    } catch (error) {
      console.error("Failed to post comment", error);
      // Revert optimistic update
      setComments((prev) => prev.filter((c) => c._id !== newComment._id));
      setTotalCount((prev) => prev - 1);
      setCommentBody(newComment.body); // restore body
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id: string) => {
    if (!session?.user) return;

    const originalComments = [...comments];
    const commentIndex = comments.findIndex((c) => c._id === id);
    if (commentIndex === -1) return;

    const comment = comments[commentIndex];
    const hasLiked = comment.likedBy.includes(session.user.id);

    // Optimistic update
    const updatedComment = {
      ...comment,
      likes: hasLiked ? Math.max(0, comment.likes - 1) : comment.likes + 1,
      likedBy: hasLiked
        ? comment.likedBy.filter((userId) => userId !== session.user.id)
        : [...comment.likedBy, session.user.id],
    };

    setComments((prev) =>
      prev.map((c) => (c._id === id ? updatedComment : c))
    );

    try {
      const res = await fetch(`/api/comments/${id}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to like");
      }
    } catch (error) {
      console.error("Like error", error);
      // Revert
      setComments(originalComments);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== id));
        setTotalCount((prev) => prev - 1);
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      console.error("Delete error", error);
      alert("Failed to delete comment");
    }
  };

  const visibleComments = comments.slice(0, page * COMMENTS_PER_PAGE);
  const hasMore = visibleComments.length < comments.length;

  return (
    <div className="mt-16 pt-12 border-t border-[#2a2a2a]">
      <header className="mb-8 flex justify-between items-baseline">
        <div>
          <div className="font-body text-[#8b0000] text-[12px] uppercase tracking-[0.25em] font-bold mb-2">
            — DISCUSSION
          </div>
          <h2 className="font-heading text-[#e8e8e8] text-[28px]">
            Case Theories & Discussion
          </h2>
        </div>
        <div className="text-[#888888] font-body text-[14px]">
          {totalCount} Comment{totalCount !== 1 ? 's' : ''}
        </div>
      </header>

      {session?.user ? (
        <form onSubmit={handlePostComment} className="bg-[#111111] border border-[#2a2a2a] p-5 rounded-[4px] mb-12">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value.slice(0, 1000))}
            placeholder="Share your theory or analysis..."
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] focus:border-[#8b0000] text-[#e8e8e8] p-4 min-h-[100px] outline-none transition-colors rounded-sm resize-y font-body text-[15px]"
            disabled={posting}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-[#555555] text-[11px] font-body">
              {commentBody.length} / 1000
            </span>
            <button
              type="submit"
              disabled={posting || commentBody.trim().length < 3}
              className="bg-[#8b0000] hover:bg-[#a00000] text-white uppercase text-[12px] font-bold tracking-widest px-6 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? "POSTING..." : "POST COMMENT"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#111111] border border-[#2a2a2a] p-8 rounded-[4px] mb-12 text-center flex flex-col items-center justify-center">
          <h3 className="font-heading text-[#e8e8e8] text-[22px] mb-2">Join the discussion</h3>
          <p className="text-[#888888] font-body text-[14px] mb-6">You must be logged in to share your theories</p>
          <Link
            href="/login"
            className="bg-[#8b0000] hover:bg-[#a00000] text-white uppercase text-[12px] font-bold tracking-widest px-8 py-3 transition-colors inline-block"
          >
            LOGIN TO COMMENT
          </Link>
        </div>
      )}

      {loading ? (
        <div className="text-[#888888] text-center py-8">Loading theories...</div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center border border-[#1f1f1f] border-dashed rounded-sm">
          <div className="font-heading text-[#e8e8e8] text-[24px] mb-2">NO THEORIES YET</div>
          <div className="text-[#888888] font-body text-[15px]">Be the first to share your analysis of this case</div>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <div key={comment._id} className="bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a] p-4 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-body text-[#e8e8e8] text-[14px] font-bold">
                    {comment.userName}
                  </span>
                  {/* Mock admin check for demo purposes - replace with real if author is known */}
                  {(comment.userName === "Admin" || comment.userName.includes("Agent")) && (
                    <span className="bg-[#8b0000] text-white text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                      ANALYST
                    </span>
                  )}
                </div>
                <span className="text-[#555555] font-body text-[12px]">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              
              <div className="font-body text-[#cccccc] text-[15px] leading-[1.8] mb-4 whitespace-pre-wrap">
                {comment.body}
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleLike(comment._id)}
                  className="flex items-center gap-1.5 group"
                >
                  <svg
                    className={`w-4 h-4 transition-colors ${
                      session?.user && comment.likedBy.includes(session.user.id)
                        ? "text-[#8b0000] fill-[#8b0000]"
                        : "text-[#888888] group-hover:text-[#e8e8e8]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span
                    className={`text-[12px] font-body font-semibold ${
                      session?.user && comment.likedBy.includes(session.user.id)
                        ? "text-[#8b0000]"
                        : "text-[#888888] group-hover:text-[#e8e8e8]"
                    }`}
                  >
                    {comment.likes}
                  </span>
                </button>
                
                {session?.user && (session.user.id === comment.userId || session.user.role === "admin") && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-[#555555] hover:text-[#8b0000] font-body text-[11px] font-bold uppercase tracking-widest transition-colors"
                  >
                    DELETE
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full mt-6 py-4 border border-[#2a2a2a] text-[#e8e8e8] font-body text-[12px] uppercase tracking-widest font-bold hover:bg-[#1a1a1a] transition-colors"
            >
              LOAD MORE COMMENTS
            </button>
          )}
        </div>
      )}
    </div>
  );
}
