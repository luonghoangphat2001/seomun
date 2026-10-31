<?php

namespace App\Rules;

use App\Models\UserAdminPermission;
use Illuminate\Contracts\Validation\Rule;

class UniqueUserPermission implements Rule
{
    /**
     * The user admin permission ID to exclude from the check (for updates).
     *
     * @var int|null
     */
    protected $excludeId;

    /**
     * Create a new rule instance.
     *
     * @param  int|null  $excludeId
     */
    public function __construct($excludeId = null)
    {
        $this->excludeId = $excludeId;
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $data = request()->all();

        if (! isset($data['user_id'])) {
            return true;
        }

        $query = UserAdminPermission::where('user_id', $data['user_id'])
            ->where('admin_permission_id', $value);

        if ($this->excludeId) {
            $query->where('id', '!=', $this->excludeId);
        }

        return ! $query->exists();
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'This user already has the specified permission.';
    }
}
