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
        Schema::create('inquiry_attachments', function (Blueprint $table) {
            // 1. Identification & Relationship
            $table->id();
            $table->foreignId('inquiry_id')->constrained()->onDelete('cascade');

            // 2. File Details
            $table->string('file_name')->comment('Original name of the uploaded file');
            $table->string('file_path')->comment('Storage path or S3 URL of the file');
            $table->string('file_type', 50)->nullable()->comment('MIME type or extension: PDF, JPEG, PNG, etc.');
            $table->unsignedBigInteger('file_size')->nullable()->comment('File size in bytes');

            // 3. Flags & Metadata
            // Distinguishes between files uploaded by the customer vs files attached by the admin in the reply
            $table->boolean('is_reply_attachment')->default(false)->comment('True if attached by staff in the response');

            $table->timestamps();

            // 4. Performance Index
            $table->index('inquiry_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiry_attachments');
    }
};
