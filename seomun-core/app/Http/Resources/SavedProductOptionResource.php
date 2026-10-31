<?php

namespace App\Http\Resources;

use App\Models\ProductOption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavedProductOptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $options = collect($this->options ?? []);

        $optionIds = $options->pluck('option_id');

        $productOptions = ProductOption::with('group')
            ->whereIn('id', $optionIds)
            ->get()
            ->keyBy('id');


        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->whenLoaded('product', fn() => $this->product?->name),
            'product_slug' => $this->whenLoaded('product', fn() => $this->product?->slug),
            'order_name' => $this->order_name,
            'notes' => $this->notes,
            'quantity' => $this->quantity,
            'number_of_cases' => $this->number_of_cases,
            'options' => $options->map(function ($item) use ($productOptions) {
                $option = $productOptions[$item['option_id']] ?? null;
                return [
                    'group' => [
                        'id' => $option?->group?->id,
                        'name' => $option?->group?->name,
                        'code' => $option?->group?->code,
                    ],
                    'option' => [
                        'id' => $option?->id,
                        'label' => $option?->label,
                        'value' => $option?->value,
                    ],
                ];
            }),
            'input_options' => $this->input_options,
            'saved_at' => $this->created_at,
            'expires_at' => $this->expires_at,
        ];
    }
}
