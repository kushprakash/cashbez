// k6 Load Test for Laravel ERP
// Run: k6 run k6/load-test.js
// Docs: https://k6.io/docs/

import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://banking.cashbez.com';

export const options = {
  // Stages: ramp up, sustain, ramp down
  stages: [
    { duration: '10s', target: 20 },   // Ramp up to 20 users
    { duration: '30s', target: 50 },   // Sustain 50 users
    { duration: '10s', target: 0 },    // Ramp down
  ],

  // Thresholds - CI fails if these are crossed
  thresholds: {
    http_req_duration: ['p(95)<500'],     // P95 must be under 500ms
    http_req_failed: ['rate<0.01'],       // Error rate must be under 1%
    'checks': ['rate>0.99'],              // 99% of checks must pass
  },
};

// Health check test
export default function () {
  // 1. Hit /api/health - the main observability endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  
  check(healthRes, {
    'health: status is 200': (r) => r.status === 200,
    'health: response has status': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch {
        return false;
      }
    },
    'health: response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Small delay between requests (realistic user behavior)
  sleep(0.5);
}

// Optional: Custom summary for CI output
export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration.values['p(95)'];
  const errorRate = data.metrics.http_req_failed.values.rate;
  const checks = data.metrics.checks.values.rate;

  console.log('\n========== PERFORMANCE SUMMARY ==========');
  console.log(`P95 Latency:   ${p95.toFixed(2)}ms (threshold: <500ms)`);
  console.log(`Error Rate:    ${(errorRate * 100).toFixed(2)}% (threshold: <1%)`);
  console.log(`Check Pass:    ${(checks * 100).toFixed(2)}% (threshold: >99%)`);
  console.log('==========================================\n');

  // Return JSON for CI parsing
  return {
    'stdout': JSON.stringify({
      p95_latency_ms: p95,
      error_rate_percent: errorRate * 100,
      check_pass_rate: checks * 100,
      passed: p95 < 500 && errorRate < 0.01 && checks > 0.99,
    }),
  };
}
