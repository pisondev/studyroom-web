// src/types/automata.ts

export type State = string;
export type Alphabet = string;

// Mapping: State -> Input -> Tujuan State
export type Transitions = Record<State, Record<Alphabet, State>>;

export interface DFADefinition {
  states: State[];
  alphabet: Alphabet[];
  transitions: Transitions;
  startState: State;
  finalStates: State[];
}