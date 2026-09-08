<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Billing\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * index() — Return device contacts for the authenticated merchant,
     * optionally filtered by name or phone number (?q=).
     *
     * Table shape:
     *   contacts(id, user_id, contacts JSON, created_at)
     *   contacts column: [{name: "", phones: [{number: "...", label: ""}]}]
     *
     * Without ?q=  → full flattened list (login sync).
     * With    ?q=  → up to 20 results matching name or phone.
     */
    public function index(Request $request)
    {
        // Base query — scope to this user only
        $query = Contact::where('user_id', auth()->id());

        // Optional search: filter rows whose contacts JSON contains the term
        if ($request->has('q') && strlen($request->q) >= 2) {
            $q = $request->q;
            $query->where(function ($builder) use ($q) {
                // Match contact name stored anywhere inside the JSON column
                $builder->whereRaw(
                    "JSON_SEARCH(contacts, 'all', ?, NULL, '$[*].name') IS NOT NULL",
                    ["%{$q}%"]
                )
                // Match phone numbers stored inside the nested phones arrays
                ->orWhereRaw(
                    "JSON_SEARCH(contacts, 'all', ?, NULL, '$[*].phones[*].number') IS NOT NULL",
                    ["%{$q}%"]
                );
            });
        }

        $rows = $query->get(['contacts']);

        // Flatten every row → every contact → every phone into one list
        $flattened = [];
        $seen      = [];

        foreach ($rows as $row) {
            $contactList = is_string($row->contacts)
                ? json_decode($row->contacts, true)
                : $row->contacts;

            if (!is_array($contactList)) {
                continue;
            }

            foreach ($contactList as $contact) {
                $name   = $contact['name'] ?? '';
                $phones = $contact['phones'] ?? [];

                if (!is_array($phones)) {
                    continue;
                }

                // Optional: if ?q= is present, skip contacts that don't match
                if ($request->has('q')) {
                    $q      = $request->q;
                    $nameOk = stripos($name, $q) !== false;
                    if (!$nameOk) {
                        // Check if any phone matches
                        $phoneMatch = false;
                        foreach ($phones as $p) {
                            if (stripos($p['number'] ?? '', $q) !== false) {
                                $phoneMatch = true;
                                break;
                            }
                        }
                        if (!$phoneMatch) {
                            continue; // this contact doesn't match the query
                        }
                    }
                }

                foreach ($phones as $phoneEntry) {
                    $raw = $phoneEntry['number'] ?? '';

                    // Normalise: strip non-digits, keep last 10 digits
                    $digits = preg_replace('/\D/', '', $raw);
                    if (strlen($digits) > 10) {
                        $digits = substr($digits, -10);
                    }
                    if (strlen($digits) < 10) {
                        continue;          // too short — skip
                    }
                    if (isset($seen[$digits])) {
                        continue;          // duplicate — skip
                    }

                    $seen[$digits] = true;
                    $flattened[]   = [
                        'name'  => $name,   // may be empty string — intentional
                        'phone' => $digits,
                    ];
                }
            }
        }

        // Cap to 20 results only when ?q= is present
        if ($request->has('q')) {
            $flattened = array_slice($flattened, 0, 20);
        }

        return response()->json([
            'status' => true,
            'data'   => array_values($flattened),
        ]);
    }
}
