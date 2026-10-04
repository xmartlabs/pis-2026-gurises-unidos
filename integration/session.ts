let currentUserId: number | null = null;

export function signInAs(userId: number) {
  currentUserId = userId;
}

export function signOut() {
  currentUserId = null;
}

export function currentSession() {
  return currentUserId === null ? null : { user: { id: String(currentUserId) } };
}
