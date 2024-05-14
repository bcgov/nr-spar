type Step = {
  step: number;
  status: string;
  description: string;
  date: string;
}

type History = {
  id: number;
  steps: Step[];
}

export default History;
