import { useSyncExternalStore } from 'react';

let badgeState = {
  messages: undefined,
  notifications: undefined,
};

const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function normalizeBadgeValue(value) {
  if (typeof value !== 'number' || value <= 0) {
    return undefined;
  }

  return value;
}

export function setTabBadges(nextState = {}) {
  const nextMessages = normalizeBadgeValue(nextState.messages);
  const nextNotifications = normalizeBadgeValue(nextState.notifications);

  if (
    badgeState.messages === nextMessages &&
    badgeState.notifications === nextNotifications
  ) {
    return;
  }

  badgeState = {
    messages: nextMessages,
    notifications: nextNotifications,
  };

  emitChange();
}

export function clearTabBadges() {
  setTabBadges({});
}

function subscribe(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return badgeState;
}

export function useTabBadges() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
