export class GameService {
  constructor(roomId: string);
  readonly actions: Record<string, (data: any, socket: any) => void>;
  readonly loadingEvent: string;
  readonly startEvent: string;
  readonly guessStartEvent: string;
  readonly guessEvent: string;
  readonly repeatGuessEvent: string;
  readonly autocompleteEvent: string;
  readonly winEvent: string;
  readonly stateEvent: string;

  record: any;
  enemy: any;
  currentActor: number;
  broadcastFn: (event: string, data?: any) => void;
}
