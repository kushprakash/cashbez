<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->randomElement(['Savings Account', 'Current Account', 'Salary Account', 'Business Account']),
            'number' => $this->faker->unique()->numerify('##########'),
            'hold_amount' => $this->faker->randomFloat(2, 0, 1000),
            'created_by' => function (array $attributes) {
                return $attributes['user_id'];
            },
            'admin_id' => function (array $attributes) {
                return $attributes['user_id'];
            },
            'status' => 1
        ];
    }

    /**
     * Indicate that the account is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 0,
        ]);
    }

    /**
     * Indicate that the account has zero balance.
     */
    public function zeroBalance(): static
    {
        return $this->state(fn (array $attributes) => [
            'balance' => 0.00,
            'hold_amount' => 0.00,
        ]);
    }
}
