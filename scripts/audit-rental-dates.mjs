import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import service from '../apps/EliteDriverFrontEndSoft/src/services/reservationService.js';

// Exercise the actual service with the business clock fixed at 19:00 Guatemala.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const instant = '2026-10-17T01:00:00Z';
const results = [];
for (const [name, start, end, days, total] of [
  ['One day', '2026-11-20', '2026-11-21', 1, 33.89],
  ['Two days', '2026-11-20', '2026-11-22', 2, 67.78],
  ['Three days', '2026-11-20', '2026-11-23', 3, 101.67],
  ['Month boundary', '2026-10-31', '2026-11-01', 1, 33.89],
  ['Leap year', '2028-02-28', '2028-03-01', 2, 67.78],
  ['Non leap year', '2027-02-28', '2027-03-01', 1, 33.89],
  ['Year boundary', '2026-12-31', '2027-01-01', 1, 33.89],
  ['Same day', '2026-11-20', '2026-11-20', 0, 0],
  ['Reversed dates', '2026-11-23', '2026-11-20', 0, 0],
]) {
  const actual = service.calculateTotalPrice(start, end, 29.99);
  results.push({ name, passed: actual.days === days && actual.totalPrice === total, expected: {days, total}, actual });
}
const localToday = service.validateReservation({ vehicleId: 'local-test', startDate: '2026-10-16', endDate: '2026-10-17' }, new Date(instant));
results.push({ name: 'Today remains valid at 19:00 Guatemala', passed: localToday.isValid, instant, actual: localToday });
try {
  const invalid = service.validateReservation({ vehicleId: 'local-test', startDate: 'invalid-date', endDate: '2026-11-20' });
  results.push({ name: 'Invalid date returns validation errors without throwing', passed: !invalid.isValid, actual: invalid });
} catch (error) {
  results.push({ name: 'Invalid date returns validation errors without throwing', passed: false, error: error.message });
}
const report = { timezone: process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone, results,
  passed: results.filter(r=>r.passed).length, failed: results.filter(r=>!r.passed).length };
fs.writeFileSync(path.join(root, 'docs/VERIFICACION-FECHAS-2026-10-16.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
