/**
 * Validation Utilities
 * 
 * 입력 검증 함수
 */

/**
 * Gateway URL 검증
 */
export function isValidGatewayUrl(url: string): boolean {
  if (!url || url.trim().length === 0) return false;
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
  } catch {
    return false;
  }
}

/**
 * 토큰 검증 (빈 값 아닌지)
 */
export function isValidToken(token: string): boolean {
  return Boolean(token && token.trim().length > 0);
}

/**
 * Room 이름 검증
 */
export function isValidRoomName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.trim().length > 30) return false;
  return true;
}

/**
 * Agent 이름 검증
 */
export function isValidAgentName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.trim().length > 50) return false;
  return true;
}

/**
 * 이메일 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 메시지 검증 (빈 메시지 방지)
 */
export function isValidMessage(message: string): boolean {
  return Boolean(message && message.trim().length > 0);
}
