<?php
namespace App\Http\Controllers;

use App\Models\Payslip;
use Illuminate\Http\Request;

class PayslipController extends Controller
{
    // List all payslips with filtering support
    public function index(Request $request)
    {
        $query = Payslip::with(['user', 'salaryPayment']);

        // Apply filters based on request parameters
        if ($request->has('month') && $request->month) {
            $query->where('month', $request->month);
        }

        if ($request->has('year') && $request->year) {
            $query->where('year', $request->year);
        }

        if ($request->has('employee') && $request->employee) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->employee . '%');
            });
        }


        $payslips = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payslip) {
                return [
                    'id' => $payslip->id,
                    'employee_name' => $payslip->user ? $payslip->user->name : 'Unknown',
                    'month' => $payslip->month,
                    'year' => $payslip->year,
                    'net_salary' => $payslip->net,
                    'created_at' => $payslip->created_at
                ];
            });
            
        return response()->json([
            'status' => 1,
            'data' => $payslips
        ]);
    }

    // View payslip
    public function view($id)
    {
        $payslip = Payslip::with(['user', 'salaryPayment'])->find($id);
        if (!$payslip) {
            return response()->json([
                'status' => 0,
                'message' => 'Payslip not found'
            ], 404);
        }
        
        return response()->json([
            'status' => 1,
            'data' => [
                'id' => $payslip->id,
                'employee_name' => $payslip->user ? $payslip->user->name : 'Unknown',
                'month' => $payslip->month,
                'year' => $payslip->year,
                'net_salary' => $payslip->net,
                'earnings' => $payslip->earnings,
                'deductions' => $payslip->deductions,
                'salary_payment_id' => $payslip->salary_payment_id,
                'created_at' => $payslip->created_at,
                'updated_at' => $payslip->updated_at
            ]
        ]);
    }

    // Download payslip PDF (stub, implement PDF generation as needed)
    public function download($id)
    {
        $payslip = Payslip::find($id);
        if (!$payslip) {
            return response()->json([
                'status' => 0,
                'message' => 'Payslip not found'
            ], 404);
        }
        
        // TODO: Implement PDF generation and return file response
        return response()->json([
            'status' => 0, 
            'message' => 'PDF download feature is not yet implemented',
            'payslip' => $payslip
        ]);
    }
}
