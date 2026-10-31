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
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->string('tax_invoice_status', 20)->nullable()->default(null)->after('metadata')
                ->comment('null=not applicable, pending=pending issue, issued=issued, deleted=archived');
            $table->timestamp('tax_invoice_issued_at')->nullable()->after('tax_invoice_status');
            $table->string('cash_receipt_status', 20)->nullable()->default(null)->after('tax_invoice_issued_at')
                ->comment('null=not applicable, pending=pending issue, issued=issued, deleted=archived');
            $table->timestamp('cash_receipt_issued_at')->nullable()->after('cash_receipt_status');
            $table->text('receipt_notes')->nullable()->after('cash_receipt_issued_at');
        });
    }

    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropColumn([
                'tax_invoice_status',
                'tax_invoice_issued_at',
                'cash_receipt_status',
                'cash_receipt_issued_at',
                'receipt_notes',
            ]);
        });
    }
};
