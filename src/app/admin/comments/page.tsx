"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils"; // We'll create this utility

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setComments(comments.filter((c) => c._id !== id));
      } else {
        alert("Failed to delete comment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete comment");
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="font-heading text-4xl text-[#e8e8e8]">COMMENTS</h1>
      </header>

      <div className="bg-[#111111] border border-[#2a2a2a] rounded overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cccccc]">
            <thead className="bg-[#0a0a0a] border-b border-[#2a2a2a] text-[#888888] font-body text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Case</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Comment</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">
                    Loading comments...
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">
                    No comments found.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr
                    key={comment._id}
                    className="border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#e8e8e8]">
                      {comment.caseId ? (
                        <Link href={`/cases/${comment.caseId.slug}`} className="hover:text-[#8b0000]">
                          {comment.caseId.title}
                        </Link>
                      ) : (
                        <span className="text-[#555555]">Deleted Case</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{comment.userName}</td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {comment.body}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#888888]">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-[#888888] hover:text-[#8b0000] font-semibold text-xs tracking-wider uppercase transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
