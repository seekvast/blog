export interface PollData {
  options: string[];
  isMultipleChoice: boolean;
  showVoters: boolean;
  hasDeadline: boolean;
  startTime?: string;
  endTime?: string;
}
