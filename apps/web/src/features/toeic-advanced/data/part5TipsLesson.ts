export interface SuffixRule {
  pos: string;
  posVi: string;
  suffixes: string[];
  examples: string[];
  tips: string;
}

export interface Part5QuizQuestion {
  id: string;
  sentence: string;
  blankWord: string;
  options: { label: string; text: string; pos: string }[];
  correctOption: string;
  explanation: string;
}

export interface Part5LessonData {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  badge: string;
  rules: {
    number: number;
    title: string;
    description: string;
    formula: string;
    sampleSentence: string;
  }[];
  suffixRules: SuffixRule[];
  commonTraps: {
    trapName: string;
    explanation: string;
    comparison: {
      left: string;
      leftNote: string;
      right: string;
      rightNote: string;
    };
  }[];
  interactiveCheck: Part5QuizQuestion[];
}

export const PART5_WORD_FORM_LESSON: Part5LessonData = {
  id: "part5-word-form-strategy",
  title: "Chiến thuật Loại trừ Dạng từ Part 5",
  subtitle: "Mẹo định vị từ loại chỗ trống trong 15 giây mà không cần dịch nghĩa toàn câu",
  estimatedMinutes: 2,
  badge: "Part 5 Strategy",
  rules: [
    {
      number: 1,
      title: "Xác định vai trò chỗ trống qua các từ bao quanh",
      description: "Nhìn ngay 1 từ phía trước và 1 từ phía sau chỗ trống để đoán cấu trúc ngữ pháp.",
      formula: "Mạo từ (a/an/the) + [ Tính từ ] + Danh từ chính",
      sampleSentence: "Please provide a [ comprehensive ] summary of the financial report.",
    },
    {
      number: 2,
      title: "Vị trí sau Động từ to be hoặc Linking Verbs",
      description: "Sau be, remain, seem, appear, become thường là Tính từ (bổ ngữ chủ ngữ).",
      formula: "Subject + be / remain / seem + [ Tính từ ]",
      sampleSentence: "All test results will remain strictly [ confidential ].",
    },
    {
      number: 3,
      title: "Trạng từ đứng đầu câu hoặc xen giữa trợ động từ và động từ chính",
      description: "Trạng từ (-ly) đóng vai trò bổ nghĩa, có thể lược bỏ mà câu vẫn đúng ngữ pháp.",
      formula: "Have/has + [ Trạng từ ] + V3/ed hoặc be + [ Trạng từ ] + V-ing",
      sampleSentence: "The technician has [ successfully ] restored the main server database.",
    },
    {
      number: 4,
      title: "Sau giới từ (in, on, at, for, about, without)",
      description: "Giới từ chỉ có thể đi kèm Danh từ, Cụm danh từ hoặc Danh động từ V-ing (kèm tân ngữ).",
      formula: "Preposition + [ Noun / V-ing + Object ]",
      sampleSentence: "Thank you for your valuable [ contribution ] to the project.",
    },
  ],
  suffixRules: [
    {
      pos: "Noun (Danh từ)",
      posVi: "Danh từ",
      suffixes: ["-tion", "-sion", "-ment", "-ance", "-ence", "-ity", "-ness"],
      examples: ["production", "decision", "agreement", "performance", "priority", "fairness"],
      tips: "Chỉ người thường có đuôi: -er (manager), -or (supervisor), -ee (trainee), -ant (assistant).",
    },
    {
      pos: "Adjective (Tính từ)",
      posVi: "Tính từ",
      suffixes: ["-ive", "-able", "-ible", "-al", "-ful", "-ous", "-ic"],
      examples: ["productive", "reliable", "flexible", "financial", "successful", "hazardous"],
      tips: "Bỏ đuôi -ly của hầu hết trạng từ sẽ được tính từ gốc (ví dụ: quickly -> quick).",
    },
    {
      pos: "Adverb (Trạng từ)",
      posVi: "Trạng từ",
      suffixes: ["-ly"],
      examples: ["promptly", "closely", "efficiently", "strictly", "temporarily"],
      tips: "Cẩn thận một số danh từ + ly tạo thành tính từ: friendly, timely, costly, lovely.",
    },
    {
      pos: "Verb (Động từ)",
      posVi: "Động từ",
      suffixes: ["-ize", "-ate", "-en", "-ify"],
      examples: ["finalize", "participate", "widen", "clarify"],
      tips: "Dấu hiệu nhận biết động từ ngắn, thường đứng ngay sau Chủ ngữ hoặc Trợ động từ.",
    },
  ],
  commonTraps: [
    {
      trapName: "Bẫy Tính từ đuôi -ING vs -ED",
      explanation: "V-ing mô tả tính chất sự vật/sự việc; V-ed mô tả cảm xúc/tâm trạng của con người.",
      comparison: {
        left: "an interesting seminar",
        leftNote: "Hội thảo mang tính chất thú vị (-ing)",
        right: "interested attendees",
        rightNote: "Khán giả cảm thấy hào hứng (-ed)",
      },
    },
    {
      trapName: "Bẫy Danh từ chỉ người vs Danh từ chỉ vật",
      explanation: "Danh từ chỉ người là danh từ đếm được, BẮT BUỘC có mạo từ (a/an/the) hoặc số nhiều (-s).",
      comparison: {
        left: "an applicant / applicants",
        leftNote: "Người ứng tuyển (phải có 'an' hoặc đuôi '-s')",
        right: "application",
        rightNote: "Hồ sơ ứng tuyển (chỉ vật/khái niệm)",
      },
    },
  ],
  interactiveCheck: [
    {
      id: "q-01",
      sentence: "The newly hired accountant completed the annual audit report _______ without any assistance.",
      blankWord: "thành công (trạng từ bổ nghĩa cho động từ completed)",
      options: [
        { label: "A", text: "success", pos: "Noun" },
        { label: "B", text: "successful", pos: "Adjective" },
        { label: "C", text: "successfully", pos: "Adverb" },
        { label: "D", text: "succeed", pos: "Verb" },
      ],
      correctOption: "C",
      explanation: "Chỗ trống đứng cuối mệnh đề đầy đủ (S + V + O), cần một Trạng từ (-ly) để bổ nghĩa cho động từ 'completed'. Chọn 'successfully'.",
    },
    {
      id: "q-02",
      sentence: "Due to unforeseen budget constraints, management made the difficult _______ to freeze hiring.",
      blankWord: "quyết định (danh từ đứng sau tính từ difficult)",
      options: [
        { label: "A", text: "decide", pos: "Verb" },
        { label: "B", text: "decision", pos: "Noun" },
        { label: "C", text: "decisively", pos: "Adverb" },
        { label: "D", text: "decisive", pos: "Adjective" },
      ],
      correctOption: "B",
      explanation: "Cấu trúc: the + Tính từ (difficult) + [ Danh từ ]. Chọn 'decision' (đuôi -sion đặc trưng của danh từ).",
    },
  ],
};
