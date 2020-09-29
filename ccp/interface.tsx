
export interface RunningState {
  type: string,
  status: string,
  lastTransitionTime: string,
  reason: string,
  message: string,
}

export interface InvolvedObject {
  kind: string,
} 

export interface Events {
  key: number,
  firstTimestamp: string,
  lastTransitionTime: string,
  type: string,
  reason: string,
  message: string,
  count: string,
  involvedObject: InvolvedObject
}
