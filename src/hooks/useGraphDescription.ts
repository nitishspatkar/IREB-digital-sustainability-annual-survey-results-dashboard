import graphDescriptions from '../data/graphDescriptions.json';

export type GraphId = keyof typeof graphDescriptions;

export const useGraphDescription = <T extends GraphId>(id: T) => {
  return graphDescriptions[id];
};
