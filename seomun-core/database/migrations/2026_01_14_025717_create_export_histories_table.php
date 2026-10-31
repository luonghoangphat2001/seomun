<?php

use App\Enums\ExcelHistoryStatus;
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
        $exportHistoryStatusValues = array_column(ExcelHistoryStatus::cases(), 'value');

        Schema::create('export_histories', function (Blueprint $table) use ($exportHistoryStatusValues) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('module');
            $table->string('file_name');
            $table->string('file_path')->nullable();
            $table->enum('status', $exportHistoryStatusValues)->default(ExcelHistoryStatus::PROCESSING->value);
            $table->json('filters')->nullable();
            $table->string('batch_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('export_histories');
    }
};
