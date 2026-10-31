<?php

namespace Database\Factories;

use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inquiry>
 */
class InquiryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'product_id' => null,
            'category' => $this->faker->randomElement(InquiryCategory::cases()),
            'title' => $this->faker->sentence,
            'content' => $this->faker->paragraph,
            'order_number' => null,
            'contact' => $this->faker->phoneNumber,
            'status' => $this->faker->randomElement(InquiryStatus::cases()),
            'replied_by' => User::factory(),
            'reply_contact_phone' => $this->faker->phoneNumber,
            'reply_content' => $this->faker->paragraph,
            'is_edited_reply' => $this->faker->boolean(),
        ];
    }

    /**
     * Define an user for the inquiry.
     */
    public function forUser(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'user_id' => User::factory(),
            ];
        });
    }
}
