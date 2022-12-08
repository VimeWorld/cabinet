import { Dispatch, useEffect, useState } from 'react';
import { EventBus, EventType } from '../lib/eventbus';

export default function useSharedState<S>(
  event: EventType,
  initialState: S | (() => S)
): [S, Dispatch<S>] {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    return EventBus.on(event, (newState) => {
      setState(newState);
    });
  }, [state]);

  const setStateHooked = (value: S) => {
    EventBus.emit(event, value);
  };

  return [state, setStateHooked];
}
