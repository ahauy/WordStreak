export interface MiniLesson {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  relatedDeckOrder: number; // Deck mà bài học này bổ trợ trực tiếp
  content: {
    summary: string;
    keyPoints: Array<{
      heading: string;
      explanation: string;
      example: {
        en: string;
        vi: string;
        highlight?: string;
      };
    }>;
    tip: string;
  };
}

export const FOUNDATION_MINI_LESSONS: MiniLesson[] = [
  {
    id: "lesson-parts-of-speech",
    order: 1,
    title: "4 Từ loại cốt lõi",
    subtitle: "Nắm vững Danh từ, Động từ, Tính từ, Trạng từ trong 2 phút",
    estimatedMinutes: 2,
    relatedDeckOrder: 1,
    content: {
      summary:
        "Tiếng Anh giống như xếp hình lego: mỗi câu được tạo nên từ 4 khối từ loại chính. Biết từ loại giúp bạn đặt đúng vị trí từ trong câu mà không sợ sai.",
      keyPoints: [
        {
          heading: "1. Danh từ (Noun - N)",
          explanation: "Chỉ người, vật, địa điểm, khái niệm. Thường đứng đầu câu làm chủ ngữ hoặc sau động từ làm tân ngữ.",
          example: {
            en: "Water is good for life.",
            vi: "Nước rất tốt cho sự sống.",
            highlight: "Water, life",
          },
        },
        {
          heading: "2. Động từ (Verb - V)",
          explanation: "Chỉ hành động hoặc trạng thái. Đây là trái tim của câu, bắt buộc phải có.",
          example: {
            en: "I learn new words every day.",
            vi: "Tôi học từ mới mỗi ngày.",
            highlight: "learn",
          },
        },
        {
          heading: "3. Tính từ (Adjective - Adj)",
          explanation: "Miêu tả tính chất của danh từ. Đứng TRƯỚC danh từ hoặc SAU động từ 'to be'.",
          example: {
            en: "She has a new friend.",
            vi: "Cô ấy có một người bạn mới.",
            highlight: "new",
          },
        },
        {
          heading: "4. Trạng từ (Adverb - Adv)",
          explanation: "Bổ nghĩa cho động từ hoặc tính từ, thường có đuôi -ly (hoặc các từ như very, well).",
          example: {
            en: "He speaks very well.",
            vi: "Anh ấy nói rất tốt.",
            highlight: "very, well",
          },
        },
      ],
      tip: "Mẹo nhớ nhanh: Đồ vật là Danh từ, Hành động là Động từ, Đẹp/xấu là Tính từ, Làm như thế nào là Trạng từ!",
    },
  },
  {
    id: "lesson-svo-order",
    order: 2,
    title: "Trật tự câu cơ bản (S + V + O)",
    subtitle: "Ghép câu tự nhiên, tránh bẫy dịch từng từ (word-by-word)",
    estimatedMinutes: 2,
    relatedDeckOrder: 4,
    content: {
      summary:
        "Trong tiếng Anh, thứ tự câu đơn giản gần như luôn cố định: Ai làm gì (S) -> Làm hành động gì (V) -> Tác động lên cái gì (O).",
      keyPoints: [
        {
          heading: "1. S (Subject - Chủ ngữ)",
          explanation: "Người hoặc vật thực hiện hành động (I, you, we, they, he, she, it, people...). Luôn đứng đầu câu khẳng định.",
          example: {
            en: "We want water.",
            vi: "Chúng tôi muốn nước.",
            highlight: "We",
          },
        },
        {
          heading: "2. V (Verb - Động từ)",
          explanation: "Hành động theo sau chủ ngữ ngay lập tức. Đừng bỏ quên động từ 'to be' (am/is/are) khi miêu tả.",
          example: {
            en: "We want water.",
            vi: "Chúng tôi muốn nước.",
            highlight: "want",
          },
        },
        {
          heading: "3. O (Object - Tân ngữ)",
          explanation: "Đối tượng nhận hành động. Thường là một danh từ đứng sau động từ.",
          example: {
            en: "We want water.",
            vi: "Chúng tôi muốn nước.",
            highlight: "water",
          },
        },
      ],
      tip: "Bẫy người Việt hay mắc: Nói 'I water drink' (sai). Nhớ luôn giữ: Ai (I) -> Làm gì (drink) -> Cái gì (water)!",
    },
  },
  {
    id: "lesson-verb-forms",
    order: 3,
    title: "Dạng động từ (-ed và -ing)",
    subtitle: "Phân biệt hành động đang diễn ra vs hành động đã qua",
    estimatedMinutes: 2,
    relatedDeckOrder: 6,
    content: {
      summary:
        "Động từ tiếng Anh thay đổi đuôi để báo cho người nghe biết thời điểm xảy ra hành động.",
      keyPoints: [
        {
          heading: "1. Đuôi -ing (Đang làm)",
          explanation: "Đi sau động từ to be (am/is/are) để diễn tả việc đang xảy ra ngay lúc này.",
          example: {
            en: "I am learning English now.",
            vi: "Tôi đang học tiếng Anh bây giờ.",
            highlight: "am learning",
          },
        },
        {
          heading: "2. Đuôi -ed (Đã làm xong trong quá khứ)",
          explanation: "Thêm vào sau động từ có quy tắc để nói về chuyện hôm qua, tuần trước.",
          example: {
            en: "They worked yesterday.",
            vi: "Hôm qua họ đã làm việc.",
            highlight: "worked",
          },
        },
      ],
      tip: "Đừng lo lắng về các động từ bất quy tắc lúc này! Khi học 300 từ đầu tiên, bạn chỉ cần nhớ ý nghĩa gốc trước.",
    },
  },
  {
    id: "lesson-singular-plural",
    order: 4,
    title: "Số ít & Số nhiều (-s và -es)",
    subtitle: "Quy tắc đếm danh từ và các ngoại lệ hay gặp nhất",
    estimatedMinutes: 2,
    relatedDeckOrder: 7,
    content: {
      summary:
        "Khi có từ 2 người hoặc 2 vật trở lên, tiếng Anh sẽ thêm đuôi -s hoặc -es vào danh từ đếm được.",
      keyPoints: [
        {
          heading: "1. Quy tắc chung: Thêm -s",
          explanation: "Hầu hết danh từ khi số nhiều chỉ cần thêm -s ở cuối và phát âm âm gió nhẹ.",
          example: {
            en: "one friend -> two friends",
            vi: "một người bạn -> hai người bạn",
            highlight: "friends",
          },
        },
        {
          heading: "2. Thêm -es với từ tận cùng là s, sh, ch, x, z",
          explanation: "Thêm -es giúp bạn phát âm dễ dàng hơn (ví dụ: house -> houses).",
          example: {
            en: "one house -> two houses",
            vi: "một ngôi nhà -> hai ngôi nhà",
            highlight: "houses",
          },
        },
        {
          heading: "3. Ngoại lệ sinh tồn không thêm -s",
          explanation: "Một số từ thay đổi hoàn toàn hình thức khi số nhiều. Hãy học thuộc lòng 2 từ này:",
          example: {
            en: "one person -> many people / one child -> two children",
            vi: "1 người -> nhiều người / 1 đứa trẻ -> 2 đứa trẻ",
            highlight: "people, children",
          },
        },
      ],
      tip: "Người Việt rất hay quên bật âm -s ở đuôi danh từ số nhiều. Hãy chú ý phát âm nhẹ âm xì để nói tự nhiên hơn!",
    },
  },
];
