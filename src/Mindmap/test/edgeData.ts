// Explicit edges data (with explicit handles added)
export const edgesData: Array<{
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}> = [
  {
    id: "e-module1-topic1-module1-topic2",
    source: "module1-topic1",
    target: "module1-topic2",
  },
  {
    id: "e-module1-topic2-module1-topic3",
    source: "module1-topic2",
    target: "module1-topic3",
  },
  {
    id: "e-module2-topic1-module2-topic2",
    source: "module2-topic1",
    target: "module2-topic2",
  },
  {
    id: "e-module2-topic2-module2-topic3",
    source: "module2-topic2",
    target: "module2-topic3",
  },
  {
    id: "e-module1-module2",
    source: "module1",
    target: "module2",
  },
];
