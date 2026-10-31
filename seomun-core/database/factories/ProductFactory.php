<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1000, 9999),
            'description' => $this->faker->paragraph(),
            'short_description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'compare_price' => $this->faker->optional()->randomFloat(2, 1000, 2000),
            'sku' => $this->faker->unique()->bothify('SKU-####-???'),
            'images' => [
                $this->faker->imageUrl(),
                $this->faker->imageUrl(),
            ],
            'is_popular' => $this->faker->boolean(30),
            'is_featured' => $this->faker->boolean(20),
            'stock_quantity' => $this->faker->numberBetween(0, 1000),
            'min_quantity' => 1,
            'max_quantity' => $this->faker->numberBetween(100, 1000),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'is_active' => true,
            'view_count' => $this->faker->numberBetween(0, 10000),
            'exposure_count' => $this->faker->numberBetween(0, 10000),
        ];
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the product is popular.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_popular' => true,
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'is_active' => true,
        ]);
    }
}
