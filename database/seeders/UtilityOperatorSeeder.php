<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UtilityOperator;

class UtilityOperatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // DTH Operators
        $dthOperators = [
            [
                'type' => 'DTH',
                'state' => null,
                'code' => 'TATASKY',
                'name' => 'Tata Sky',
                'category' => 'DTH',
                'label' => 'Tata Sky DTH Services',
                'icon' => 'https://cdn.bitrefill.com/content/cn/b_rgb%3AFFFFFF%2Cc_pad%2Ch_720%2Cw_1280/v1557745925/tatasky.webp',
                'is_active' => true
            ],
            [
                'type' => 'DTH',
                'state' => null,
                'code' => 'AIRTEL_DTH',
                'name' => 'Airtel Digital TV',
                'category' => 'DTH',
                'label' => 'Airtel Digital TV Services',
                'icon' => 'https://cdn.bitrefill.com/content/cn/b_rgb%3AFFFFFF%2Cc_pad%2Ch_720%2Cw_1280/v1557745925/airtel.webp',
                'is_active' => true
            ],
            [
                'type' => 'DTH',
                'state' => null,
                'code' => 'DISH_TV',
                'name' => 'Dish TV',
                'category' => 'DTH',
                'label' => 'Dish TV Services',
                'icon' => 'https://cdn.bitrefill.com/content/cn/b_rgb%3AFFFFFF%2Cc_pad%2Ch_720%2Cw_1280/v1557745925/dish.webp',
                'is_active' => true
            ],
            [
                'type' => 'DTH',
                'state' => null,
                'code' => 'VIDEOCON',
                'name' => 'Videocon D2H',
                'category' => 'DTH',
                'label' => 'Videocon D2H Services',
                'icon' => 'https://cdn.bitrefill.com/content/cn/b_rgb%3AFFFFFF%2Cc_pad%2Ch_720%2Cw_1280/v1557745925/videocon.webp',
                'is_active' => true
            ],
            [
                'type' => 'DTH',
                'state' => null,
                'code' => 'SUNDIRECT',
                'name' => 'Sun Direct',
                'category' => 'DTH',
                'label' => 'Sun Direct DTH Services',
                'icon' => 'https://cdn.bitrefill.com/content/cn/b_rgb%3AFFFFFF%2Cc_pad%2Ch_720%2Cw_1280/v1557745925/sundirect.webp',
                'is_active' => true
            ],
            [
                'type' => 'DTH',
                'state' => null,
                'code' => 'BIG_TV',
                'name' => 'Big TV',
                'category' => 'DTH',
                'label' => 'Big TV DTH Services',
                'icon' => 'https://cdn.bitrefill.com/content/cn/b_rgb%3AFFFFFF%2Cc_pad%2Ch_720%2Cw_1280/v1557745925/bigtv.webp',
                'is_active' => true
            ]
        ];

        // Electric Utility Operators (for future use)
        $electricOperators = [
            [
                'type' => 'Electric',
                'state' => 'Delhi',
                'code' => 'BSES_RAJDHANI',
                'name' => 'BSES Rajdhani Power Limited',
                'category' => 'Electric',
                'label' => 'BSES Rajdhani - Delhi',
                'icon' => null,
                'is_active' => true
            ],
            [
                'type' => 'Electric',
                'state' => 'Delhi',
                'code' => 'BSES_YAMUNA',
                'name' => 'BSES Yamuna Power Limited',
                'category' => 'Electric',
                'label' => 'BSES Yamuna - Delhi',
                'icon' => null,
                'is_active' => true
            ],
            [
                'type' => 'Electric',
                'state' => 'Maharashtra',
                'code' => 'MSEDCL',
                'name' => 'Maharashtra State Electricity Distribution Company Limited',
                'category' => 'Electric',
                'label' => 'MSEDCL - Maharashtra',
                'icon' => null,
                'is_active' => true
            ]
        ];

        // Insert DTH operators
        foreach ($dthOperators as $operator) {
            UtilityOperator::create($operator);
        }

        // Insert Electric operators
        foreach ($electricOperators as $operator) {
            UtilityOperator::create($operator);
        }
    }
}
