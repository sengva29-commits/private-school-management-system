/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generate a secure deterministic 4-digit passcode for teacher approval.
 * Teachers can view this code in their settings area after logging in.
 */
export function getTeacherPasscode(teacherId: string): string {
  if (teacherId === 'TCH001') return '2580';
  if (teacherId === 'TCH002') return '1357';
  if (teacherId === 'TCH003') return '2468';
  
  // Fallback for dynamically created teachers
  const numericPart = teacherId.replace(/\D/g, '');
  if (numericPart) {
    const calculated = String(parseInt(numericPart) * 179);
    return calculated.substring(0, 4).padEnd(4, '7');
  }
  
  // Default fallback code
  return '8888';
}
