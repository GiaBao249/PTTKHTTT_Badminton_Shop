import { Reply, Star, Send, X, Loader2, User2 } from "lucide-react";
import type { Products } from "../types/ProductTypes/ProductType";
import { useState } from "react";

const Review = ({ product }: { product: Products }) => {
  const [isAdmin] = useState(true);
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setReply("");
      setShowReply(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

      <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
            <User2 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Tên khách hàng</p>
              <p className="text-sm text-gray-500">1/1/2025</p>
            </div>

            <div className="mt-1 flex items-center gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4" fill="currentColor" />
              ))}
            </div>

            <p className="mt-3 text-gray-800">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit...
            </p>

            {isAdmin && !showReply && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setShowReply(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              </div>
            )}

            {isAdmin && showReply && (
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="pl-4 md:pl-10 border-l-2 border-gray-100">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={4}
                      placeholder="Nhập phản hồi của bạn..."
                      className="w-full rounded-md border border-blue-200 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {reply.trim().length}/500
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowReply(false);
                            setReply("");
                          }}
                          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={submitting || reply.trim().length === 0}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang gửi...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Gửi
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </article>
    </section>
  );
};

export default Review;
