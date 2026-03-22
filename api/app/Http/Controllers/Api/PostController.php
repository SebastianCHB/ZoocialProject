<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PostLike;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    // GET_POSTS_WITH_COMMENTS
    public function index()
    {
        // EXTRACT_POSTS_WITH_RELATIONS
        $posts = Post::with(['usuario:id_usuario,nombre_completo,rol', 'comments.usuario:id_usuario,nombre_completo,rol', 'likesCount'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($posts, 200);
    }

    // CREATE_NEW_POST
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048' // VALIDATE_IMAGE
        ]);

        $imageUrl = null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts', 'public');
            // url
            $imageUrl = Storage::disk('public')->url($path);
        }

        $post = Post::create([
            'id_usuario' => $request->user()->id_usuario,
            'content' => $request->content,
            'image_url' => $imageUrl,
            'likes' => 0
        ]);

        return response()->json($post, 201);
    }
    
    // TOGGLE_POST_LIKE
    public function like($id, Request $request)
    {
        $post = Post::findOrFail($id);
        $userId = $request->user()->id_usuario;

        $existingLike = PostLike::where('id_post', $id)->where('id_usuario', $userId)->first();

        if ($existingLike) {
            // UNLIKE_POST
            $existingLike->delete();
            $post->decrement('likes');
            return response()->json(['message' => 'Post unliked', 'likes' => $post->likes, 'likedByUser' => false], 200);
        } else {
            // LIKE_POST
            PostLike::create(['id_post' => $id, 'id_usuario' => $userId]);
            $post->increment('likes');
            return response()->json(['message' => 'Post liked', 'likes' => $post->likes, 'likedByUser' => true], 200);
        }
    }

    // DELETE_POST
    public function destroy($id, Request $request)
    {
        try {
            $post = Post::findOrFail($id);
            
            // ADMIN_OR_OWNER_VALIDATION
            $currentUser = $request->user();
            if ($currentUser->rol !== 'admin' && $currentUser->id_usuario !== $post->id_usuario) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $post->delete();
            return response()->json(['message' => 'Post deleted'], 200);
        } catch (\Exception $e) {
            \Log::error("Error deleting post $id: " . $e->getMessage());
            return response()->json(['message' => 'Error al eliminar la publicación', 'error' => $e->getMessage()], 500);
        }
    }

    // GET_USER_POSTS
    public function userPosts(Request $request)
    {
        $userId = $request->user()->id_usuario;
        
        $posts = Post::with(['usuario:id_usuario,nombre_completo,rol', 'comments.usuario:id_usuario,nombre_completo,rol', 'likesCount'])
            ->where('id_usuario', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($posts, 200);
    }
}
