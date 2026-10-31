<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_order_groups', function (Blueprint $table) {
            $table->id();
            $table->string('group_order_number')->unique()->comment('Generated group reference number');
            $table->unsignedBigInteger('customer_id')->nullable()->index();
            $table->string('status')->default('pending');

            // Shared contact info for the group
            $table->string('contact_name')->nullable();
            $table->string('contact_tel')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_phone2')->nullable();
            $table->string('contact_email')->nullable();

            // Shared sender info
            $table->string('sender_name')->nullable();
            $table->string('sender_phone')->nullable();
            $table->string('sender_zipcode')->nullable();
            $table->string('sender_address')->nullable();
            $table->string('sender_address2')->nullable();

            // Shared shipping info
            $table->string('shipping_name')->nullable();
            $table->string('shipping_phone')->nullable();
            $table->string('shipping_phone2')->nullable();
            $table->string('shipping_postcode')->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_address_detail')->nullable();
            $table->string('shipping_method')->nullable();
            $table->string('shipping_time')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('partner_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('order_group_id')->nullable()->after('customer_id')->index();
            $table->foreign('order_group_id')->references('id')->on('partner_order_groups')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('partner_orders', function (Blueprint $table) {
            $table->dropForeign(['order_group_id']);
            $table->dropColumn('order_group_id');
        });

        Schema::dropIfExists('partner_order_groups');
    }
};
