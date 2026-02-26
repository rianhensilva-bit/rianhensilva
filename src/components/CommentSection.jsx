import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function CommentSection({ predictionId, userId }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', predictionId],
    queryFn: () => base44.entities.Comment.filter({ prediction_id: predictionId }),
    enabled: isOpen
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', predictionId]);
      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Comentário enviado!');
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const comment = comments.find(c => c.id === commentId);
      const commentData = comment.data || comment;
      const liked_by = commentData.liked_by || [];
      
      const isLiked = liked_by.includes(userId);
      const newLikedBy = isLiked 
        ? liked_by.filter(id => id !== userId)
        : [...liked_by, userId];
      
      await base44.entities.Comment.update(commentId, {
        liked_by: newLikedBy,
        likes: newLikedBy.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', predictionId]);
    }
  });

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    createCommentMutation.mutate({
      prediction_id: predictionId,
      user_id: userId,
      username: 'Jogador', // Em produção vem do auth
      content: newComment
    });
  };

  const handleSubmitReply = (parentId) => {
    if (!replyContent.trim()) return;

    createCommentMutation.mutate({
      prediction_id: predictionId,
      user_id: userId,
      username: 'Jogador', // Em produção vem do auth
      content: replyContent,
      parent_comment_id: parentId
    });
  };

  const topLevelComments = comments.filter(c => !(c.data || c).parent_comment_id);
  const getReplies = (commentId) => comments.filter(c => (c.data || c).parent_comment_id === commentId);

  return (
    <div className="border-t pt-4">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <MessageCircle className="h-4 w-4" />
        {isOpen ? 'Fechar Comentários' : `Abrir Comentários (${topLevelComments.length})`}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Novo Comentário */}
          <form onSubmit={handleSubmitComment} className="space-y-2">
            <Textarea
              placeholder="Escreva seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button 
              type="submit" 
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Comentar
            </Button>
          </form>

          {/* Lista de Comentários */}
          <div className="space-y-4">
            {topLevelComments.length === 0 ? (
              <p className="text-center text-zinc-500 py-4">Nenhum comentário ainda. Seja o primeiro!</p>
            ) : (
              topLevelComments.map((comment) => {
                const commentData = comment.data || comment;
                const replies = getReplies(comment.id);
                const isLiked = (commentData.liked_by || []).includes(userId);

                return (
                  <div key={comment.id} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold">
                        {commentData.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{commentData.username}</span>
                          <span className="text-xs text-zinc-500">
                            {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{commentData.content}</p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeCommentMutation.mutate(comment.id)}
                            className={`gap-1 ${isLiked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                            {commentData.likes || 0}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="gap-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Responder
                          </Button>
                        </div>

                        {/* Formulário de Resposta */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Escreva sua resposta..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim() || createCommentMutation.isPending}
                              >
                                Enviar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Respostas */}
                        {replies.length > 0 && (
                          <div className="mt-3 space-y-3 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                            {replies.map((reply) => {
                              const replyData = reply.data || reply;
                              const isReplyLiked = (replyData.liked_by || []).includes(userId);

                              return (
                                <div key={reply.id} className="flex items-start gap-2">
                                  <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold">
                                    {replyData.username?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm">{replyData.username}</span>
                                      <span className="text-xs text-zinc-500">
                                        {formatDistanceToNow(new Date(reply.created_date), { addSuffix: true, locale: ptBR })}
                                      </span>
                                    </div>
                                    <p className="text-sm mb-1">{replyData.content}</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => likeCommentMutation.mutate(reply.id)}
                                      className={`gap-1 h-6 text-xs ${isReplyLiked ? 'text-red-500' : ''}`}
                                    >
                                      <Heart className={`h-3 w-3 ${isReplyLiked ? 'fill-current' : ''}`} />
                                      {replyData.likes || 0}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}