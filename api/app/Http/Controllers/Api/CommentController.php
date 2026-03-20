<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    // CREATE_COMMENT
    public function store(Request $request, $postId)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'id_post' => $postId,
            'id_usuario' => $request->user()->id_usuario,
            'content' => $request->content,
        ]);

        $loadedComment = Comment::with('usuario:id_usuario,nombre_completo,rol')->find($comment->id);

        return response()->json($loadedComment, 201);
    }

    // DELETE_COMMENT
    public function destroy($id, Request $request)
    {
        $comment = Comment::findOrFail($id);
        
        if ($request->user()->rol !== 'admin' && $request->user()->id_usuario !== $comment->id_usuario) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Comment deleted'], 200);
    }
}
