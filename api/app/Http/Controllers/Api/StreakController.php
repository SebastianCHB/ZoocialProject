<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Streak;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StreakController extends Controller
{
    /**
     * GET /streak/me
     * Returns the current user's streak data
     */
    public function show(Request $request)
    {
        $user = $request->user();
        $streak = Streak::firstOrCreate(
            ['id_usuario' => $user->id_usuario],
            [
                'current_streak' => 1,
                'max_streak' => 1,
                'last_interaction_date' => Carbon::today(),
            ]
        );

        return response()->json([
            'current_streak' => $streak->current_streak,
            'max_streak' => $streak->max_streak,
            'last_interaction_date' => $streak->last_interaction_date->toDateString(),
        ]);
    }

    /**
     * POST /streak/ping
     * Records an interaction today and updates streak accordingly
     */
    public function ping(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        $streak = Streak::firstOrCreate(
            ['id_usuario' => $user->id_usuario],
            [
                'current_streak' => 1,
                'max_streak' => 1,
                'last_interaction_date' => $today,
            ]
        );

        $lastDate = Carbon::parse($streak->last_interaction_date);

        // Already interacted today – no change
        if ($lastDate->isSameDay($today)) {
            return response()->json([
                'current_streak' => $streak->current_streak,
                'max_streak' => $streak->max_streak,
                'last_interaction_date' => $streak->last_interaction_date->toDateString(),
                'message' => 'already_pinged_today',
            ]);
        }

        // Interacted yesterday → increment streak
        if ($lastDate->isSameDay($today->copy()->subDay())) {
            $streak->current_streak += 1;
        } else {
            // More than 1 day gap → reset streak
            $streak->current_streak = 1;
        }

        // Update max_streak if needed
        if ($streak->current_streak > $streak->max_streak) {
            $streak->max_streak = $streak->current_streak;
        }

        $streak->last_interaction_date = $today;
        $streak->save();

        return response()->json([
            'current_streak' => $streak->current_streak,
            'max_streak' => $streak->max_streak,
            'last_interaction_date' => $streak->last_interaction_date->toDateString(),
            'message' => 'streak_updated',
        ]);
    }
}
