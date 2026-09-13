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
        Schema::create('financial_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('admin_id')->index();

            $table->string('service_type')->index(); // SAVING, DD, RD, FD, MIS
            $table->string('plan_code');
            $table->string('plan_name');
            $table->text('description')->nullable();
            $table->string('status')->default('ACTIVE'); // ACTIVE, INACTIVE
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();

            // Amounts & Investment limits
            $table->decimal('minimum_opening_amount', 18, 2)->default(0.00);
            $table->decimal('maximum_opening_amount', 18, 2)->default(0.00);
            $table->decimal('minimum_balance', 18, 2)->default(0.00);
            $table->decimal('maximum_total_balance', 18, 2)->default(0.00);
            $table->decimal('maximum_daily_deposit', 18, 2)->default(0.00);
            $table->decimal('maximum_monthly_deposit', 18, 2)->default(0.00);
            
            $table->decimal('minimum_daily_deposit', 18, 2)->default(0.00);
            $table->decimal('minimum_installment', 18, 2)->default(0.00);
            $table->decimal('maximum_installment', 18, 2)->default(0.00);
            $table->string('installment_frequency')->default('MONTHLY'); // DAILY, MONTHLY, QUARTERLY

            $table->decimal('minimum_investment', 18, 2)->default(0.00);
            $table->decimal('maximum_investment', 18, 2)->default(0.00);
            $table->decimal('maximum_total_investment', 18, 2)->default(0.00);

            // Duration
            $table->integer('minimum_duration')->default(1);
            $table->integer('maximum_duration')->default(60);
            $table->string('duration_unit')->default('MONTHS'); // DAYS, MONTHS, YEARS

            // Interest
            $table->decimal('interest_rate', 5, 2)->default(0.00);
            $table->string('interest_type')->default('SIMPLE'); // SIMPLE, COMPOUND
            $table->string('interest_calculation_method')->default('DAILY_PRODUCT');
            $table->string('interest_calculation_frequency')->default('QUARTERLY');
            $table->string('interest_credit_frequency')->default('QUARTERLY');
            $table->string('compounding_frequency')->default('QUARTERLY');
            $table->string('interest_payout')->default('AT_MATURITY');
            $table->string('payout_frequency')->default('MONTHLY');
            $table->integer('payout_day')->default(1);

            // Overdue & Penalties
            $table->integer('grace_period')->default(0);
            $table->boolean('late_payment_allowed')->default(true);
            $table->decimal('late_payment_charge', 18, 2)->default(0.00);
            $table->decimal('late_fee', 18, 2)->default(0.00);
            $table->decimal('missed_installment_charge', 18, 2)->default(0.00);
            $table->integer('maximum_missed_deposits')->default(3);
            $table->integer('maximum_missed_installments')->default(3);

            // Withdrawal & Charges
            $table->boolean('withdrawal_allowed')->default(true);
            $table->decimal('minimum_withdrawal', 18, 2)->default(0.00);
            $table->decimal('maximum_withdrawal', 18, 2)->default(0.00);
            $table->decimal('daily_withdrawal_limit', 18, 2)->default(0.00);
            $table->decimal('monthly_withdrawal_limit', 18, 2)->default(0.00);
            $table->decimal('withdrawal_charge', 18, 2)->default(0.00);
            $table->decimal('account_opening_charge', 18, 2)->default(0.00);
            $table->decimal('account_closure_charge', 18, 2)->default(0.00);

            // Premature Closure & Renewal
            $table->boolean('premature_closure_allowed')->default(true);
            $table->decimal('premature_closure_charge', 18, 2)->default(0.00);
            $table->decimal('premature_closure_penalty', 18, 2)->default(0.00);
            $table->integer('minimum_lockin_period')->default(0);
            $table->integer('lockin_period')->default(0);
            $table->decimal('premature_penalty', 18, 2)->default(0.00);
            $table->decimal('reduced_interest_rate', 5, 2)->default(0.00);
            $table->boolean('auto_renewal')->default(false);
            $table->string('renewal_type')->default('NO_RENEWAL'); // PRINCIPAL_ONLY, PRINCIPAL_PLUS_INTEREST, NO_RENEWAL

            // Account Features
            $table->boolean('nominee_required')->default(true);
            $table->boolean('joint_account_allowed')->default(false);
            $table->boolean('minor_account_allowed')->default(false);
            $table->integer('dormant_period')->default(365); // Days

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'admin_id']);
            $table->index(['user_id', 'admin_id', 'service_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_plans');
    }
};
