import { practiceService } from "../../features/practice/services/practiceService";

export { practiceService };
export const getListeningQuiz = practiceService.getListeningQuiz;
export const getMultipleChoiceQuiz = practiceService.getMultipleChoiceQuiz;
export const getFillBlankQuiz = practiceService.getFillBlankQuiz;
export const submitQuiz = practiceService.submitQuiz;
