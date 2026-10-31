<?php

use App\Enums\PaymentMethod;
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
        Schema::create('payment_transactions', function (Blueprint $table) {
            // Get enum values for the comment
            $paymentMethodValues = array_column(PaymentMethod::cases(), 'value');
            $methodsList = implode(', ', $paymentMethodValues);

            // 1. Identification & Relationships
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_id')->unique()->comment('Internal unique transaction ID');
            $table->string('pg_transaction_id')->nullable()->comment('Transaction ID from Payment Gateway (PG)');
            $table->string('pg_name', 100)->nullable()->comment('Payment gateway provider (e.g., KG Inicis, Toss)');

            // 2. Payment details
            // Defined once with the correct comment, no need for ->change()
            $table->string('payment_method', 50)->comment("Available: $methodsList");
            $table->string('status', 50)->default('pending')->comment('pending, processing, paid, failed, cancelled, refunded');
            $table->decimal('amount', 15, 2); // Increased precision for currencies like KRW/VND
            $table->string('currency', 3)->default('KRW');

            // 3. Payment Method Specifics
            // Card details
            $table->string('card_name')->nullable()->comment('Card issuer name');
            $table->string('card_number')->nullable()->comment('Masked card number');

            // Virtual Account / Bank Transfer details
            $table->string('virtual_account_number')->nullable();
            $table->string('virtual_account_bank')->nullable();
            $table->timestamp('virtual_account_expires_at')->nullable();
            $table->string('bank_account_holder')->nullable();

            // 4. Logs & Response Data
            // Use json type for PG data to allow easier querying if needed
            $table->json('pg_request')->nullable()->comment('Original request sent to PG');
            $table->json('pg_response')->nullable()->comment('Final response received from PG');
            $table->text('refund_reason')->nullable();

            // 5. Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // 6. Indexes for Performance
            $table->index(['order_id', 'status']);
            $table->index('pg_transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
