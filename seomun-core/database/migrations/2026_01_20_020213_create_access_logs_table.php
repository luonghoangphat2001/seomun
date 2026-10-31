<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->comment('User ID (nullable for failed login attempts)');
            $table->string('login_id', 255)->index()->comment('Login ID (email or username used for login attempt)');
            $table->string('ip_address', 45)->index()->comment('IP address');
            $table->string('browser_info', 255)->nullable()->comment('Browser information (e.g., Chrome 131.0 - Windows 10)');
            $table->text('user_agent')->nullable()->comment('Full user agent string');
            $table->string('event_type', 50)->index()->comment('Event type: login, logout, login_failed');
            $table->string('management', 50)->nullable()->comment('Management/Action type (e.g., Login failed, log out, log in)');
            $table->text('explanation')->nullable()->comment('Explanation/Description (e.g., Invalid credentials provided)');
            $table->timestamp('connection_time')->useCurrent()->index()->comment('Connection/Access timestamp');
            $table->date('access_date')->index()->comment('Access date (for grouping/filtering)');
            $table->timestamps();

            $table->index(['user_id', 'connection_time']);
            $table->index(['login_id', 'connection_time']);
            $table->index(['ip_address', 'connection_time']);
            $table->index(['event_type', 'connection_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_logs');
    }
};
