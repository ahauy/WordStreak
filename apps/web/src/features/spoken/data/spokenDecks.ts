export interface SpokenWordCard {
  word: string;
  pos: string;
  ipa: string;
  meaningVi: string;
  context: "DAILY_LIFE" | "WORKPLACE" | "TRAVEL" | "EMOTIONS" | "SOCIALIZING";
  contextLabel: string;
  dialogue: {
    speakerA: string;
    speakerAVi: string;
    speakerB: string;
    speakerBVi: string;
  };
  collocations: string[];
}

export interface SpokenDeckSummary {
  id: string;
  slug: string;
  order: number;
  context: "DAILY_LIFE" | "WORKPLACE" | "TRAVEL" | "EMOTIONS" | "SOCIALIZING";
  contextLabel: string;
  title: string;
  titleVi: string;
  cardsCount: number;
  estMinutes: number;
}

export const SAMPLE_SPOKEN_WORDS: SpokenWordCard[] = [
  {
    word: "catch up",
    pos: "phrasal verb",
    ipa: "/kætʃ ʌp/",
    meaningVi: "Gặp gỡ tâm sự sau lâu ngày không gặp",
    context: "SOCIALIZING",
    contextLabel: "Giao lưu Bạn bè",
    dialogue: {
      speakerA: "It's been ages since graduation! We definitely need to catch up soon.",
      speakerAVi: "Đã bao lâu rồi kể từ ngày tốt nghiệp! Chúng mình nhất định phải gặp nhau hàn huyên sớm nhé.",
      speakerB: "Totally agree! How about coffee this Saturday afternoon?",
      speakerBVi: "Hoàn toàn đồng ý luôn! Chiều thứ Bảy này đi cafe được không?",
    },
    collocations: ["catch up over coffee", "play catch up", "catch up on news"],
  },
  {
    word: "touch base",
    pos: "idiom",
    ipa: "/tʌtʃ beɪs/",
    meaningVi: "Trao đổi nhanh, liên lạc để cập nhật tình hình",
    context: "WORKPLACE",
    contextLabel: "Công sở Đàm thoại",
    dialogue: {
      speakerA: "Let's touch base right after lunch to review the client feedback.",
      speakerAVi: "Đầu giờ chiều sau bữa trưa mình trao đổi nhanh để xem qua phản hồi của khách nhé.",
      speakerB: "Sure thing, I'll have the bullet points ready on Slack.",
      speakerBVi: "Nhất trí, tôi sẽ tóm tắt sẵn các ý chính trên Slack.",
    },
    collocations: ["touch base briefly", "touch base next week", "touch base on progress"],
  },
  {
    word: "grab a bite",
    pos: "phrase",
    ipa: "/ɡræb ə baɪt/",
    meaningVi: "Đi kiếm gì đó ăn nhanh",
    context: "DAILY_LIFE",
    contextLabel: "Đời sống Thường nhật",
    dialogue: {
      speakerA: "I'm starving. Do you want to grab a quick bite across the street?",
      speakerAVi: "Đói bụng quá rồi. Cậu có muốn qua bên đường kiếm gì đó ăn nhanh không?",
      speakerB: "Sounds great, I could really go for some noodles.",
      speakerBVi: "Nghe tuyệt đấy, tớ cũng đang rất thèm một bát mì.",
    },
    collocations: ["grab a bite to eat", "quick bite", "grab lunch"],
  },
  {
    word: "head out",
    pos: "phrasal verb",
    ipa: "/hed aʊt/",
    meaningVi: "Rời đi, bắt đầu xuất phát",
    context: "TRAVEL",
    contextLabel: "Du lịch & Di chuyển",
    dialogue: {
      speakerA: "Traffic gets terrible after five. We should head out right now.",
      speakerAVi: "Sau 5 giờ đường tắc nghẽn kinh khủng lắm. Mình nên xuất phát ngay bây giờ.",
      speakerB: "Let me grab my umbrella and we're good to go.",
      speakerBVi: "Chờ tớ lấy chiếc ô là chúng mình có thể đi được rồi.",
    },
    collocations: ["head out early", "head out for dinner", "ready to head out"],
  },
  {
    word: "bummed out",
    pos: "adj",
    ipa: "/bʌmd aʊt/",
    meaningVi: "Thất vọng, buồn chán vì chuyện không như ý",
    context: "EMOTIONS",
    contextLabel: "Cảm xúc & Tâm trạng",
    dialogue: {
      speakerA: "Why the long face? Are you still bummed out about the concert being canceled?",
      speakerAVi: "Sao mặt buồn thiu thế kia? Vẫn đang rầu rĩ vì buổi hòa nhạc bị hủy à?",
      speakerB: "Yeah, I'd been looking forward to seeing them live for months.",
      speakerBVi: "Ừ, tớ đã mong chờ được xem họ diễn trực tiếp suốt mấy tháng nay rồi.",
    },
    collocations: ["really bummed out", "feel bummed out", "look bummed out"],
  },
];

export const SPOKEN_24_DECKS_CATALOG: SpokenDeckSummary[] = [
  // Context 1: DAILY_LIFE (5 Decks)
  { id: "spk-01", slug: "ngsl-s-01-morning-routines", order: 1, context: "DAILY_LIFE", contextLabel: "Đời sống Thường nhật", title: "Morning Routines & Coffee Talk", titleVi: "Thói quen Buổi sáng & Chuyện Cafe", cardsCount: 30, estMinutes: 8 },
  { id: "spk-02", slug: "ngsl-s-02-errands-shopping", order: 2, context: "DAILY_LIFE", contextLabel: "Đời sống Thường nhật", title: "Errands, Groceries & Street Food", titleVi: "Chạy việc Vặt, Mua sắm & Ăn vặt", cardsCount: 30, estMinutes: 8 },
  { id: "spk-03", slug: "ngsl-s-03-house-chores", order: 3, context: "DAILY_LIFE", contextLabel: "Đời sống Thường nhật", title: "House Chores & Neighborhood Life", titleVi: "Việc nhà & Chuyện Xóm giềng", cardsCount: 30, estMinutes: 8 },
  { id: "spk-04", slug: "ngsl-s-04-cooking-dining", order: 4, context: "DAILY_LIFE", contextLabel: "Đời sống Thường nhật", title: "Home Cooking & Dining Etiquette", titleVi: "Nấu ăn Tại nhà & Thưởng thức Bữa tối", cardsCount: 30, estMinutes: 8 },
  { id: "spk-05", slug: "ngsl-s-05-fitness-sports", order: 5, context: "DAILY_LIFE", contextLabel: "Đời sống Thường nhật", title: "Fitness, Gym & Weekend Hobbies", titleVi: "Tập gym, Thể thao & Sở thích Cuối tuần", cardsCount: 30, estMinutes: 8 },

  // Context 2: WORKPLACE (5 Decks)
  { id: "spk-06", slug: "ngsl-s-06-watercooler-chat", order: 6, context: "WORKPLACE", contextLabel: "Công sở Đàm thoại", title: "Watercooler Chat & Friendly Banter", titleVi: "Trò chuyện Bên máy Nước & Tán gẫu", cardsCount: 30, estMinutes: 8 },
  { id: "spk-07", slug: "ngsl-s-07-meeting-catchups", order: 7, context: "WORKPLACE", contextLabel: "Công sở Đàm thoại", title: "Quick Standups & Meeting Syncs", titleVi: "Họp Nhanh Standup & Đồng bộ Công việc", cardsCount: 30, estMinutes: 8 },
  { id: "spk-08", slug: "ngsl-s-08-deadline-stress", order: 8, context: "WORKPLACE", contextLabel: "Công sở Đàm thoại", title: "Deadlines, Overtime & Team Support", titleVi: "Áp lực Deadline, Tăng ca & Hỗ trợ Nhóm", cardsCount: 30, estMinutes: 8 },
  { id: "spk-09", slug: "ngsl-s-09-workplace-feedback", order: 9, context: "WORKPLACE", contextLabel: "Công sở Đàm thoại", title: "Giving Courteous Feedback & Kudos", titleVi: "Góp ý Lịch thiệp & Khen ngợi Đồng nghiệp", cardsCount: 30, estMinutes: 8 },
  { id: "spk-10", slug: "ngsl-s-10-lunch-breaks", order: 10, context: "WORKPLACE", contextLabel: "Công sở Đàm thoại", title: "Lunch Breaks & Friday Celebration", titleVi: "Nghỉ trưa Cùng Nhóm & Tiệc Thứ Sáu", cardsCount: 30, estMinutes: 8 },

  // Context 3: SOCIALIZING (5 Decks)
  { id: "spk-11", slug: "ngsl-s-11-making-plans", order: 11, context: "SOCIALIZING", contextLabel: "Giao lưu Bạn bè", title: "Making Hangout Plans & RSVP", titleVi: "Lên lịch Đi chơi & Nhận lời Hẹn", cardsCount: 30, estMinutes: 8 },
  { id: "spk-12", slug: "ngsl-s-12-pop-culture", order: 12, context: "SOCIALIZING", contextLabel: "Giao lưu Bạn bè", title: "Movies, Netflix & Music Buzz", titleVi: "Bàn luận Phim ảnh, Âm nhạc & Xu hướng", cardsCount: 30, estMinutes: 8 },
  { id: "spk-13", slug: "ngsl-s-13-humor-irony", order: 13, context: "SOCIALIZING", contextLabel: "Giao lưu Bạn bè", title: "Slang, Sarcasm & Friendly Jokes", titleVi: "Tiếng lóng, Châm biếm Hài hước & Đùa vui", cardsCount: 30, estMinutes: 8 },
  { id: "spk-14", slug: "ngsl-s-14-reconnecting-friends", order: 14, context: "SOCIALIZING", contextLabel: "Giao lưu Bạn bè", title: "Reconnecting with Old Acquaintances", titleVi: "Hàn huyên với Bạn cũ & Ôn Kỷ niệm", cardsCount: 30, estMinutes: 8 },
  { id: "spk-15", slug: "ngsl-s-15-party-gatherings", order: 15, context: "SOCIALIZING", contextLabel: "Giao lưu Bạn bè", title: "Housewarming & Social Gatherings", titleVi: "Tiệc Tân gia & Gặp mặt Đông người", cardsCount: 30, estMinutes: 8 },

  // Context 4: TRAVEL & MOBILITY (5 Decks)
  { id: "spk-16", slug: "ngsl-s-16-airport-transit", order: 16, context: "TRAVEL", contextLabel: "Du lịch & Di chuyển", title: "Airport Check-in & Transit Inquiries", titleVi: "Check-in Sân bay & Hỏi đường Quá cảnh", cardsCount: 30, estMinutes: 8 },
  { id: "spk-17", slug: "ngsl-s-17-hotel-hospitality", order: 17, context: "TRAVEL", contextLabel: "Du lịch & Di chuyển", title: "Hotel Bookings & Special Requests", titleVi: "Đặt phòng Khách sạn & Yêu cầu Dịch vụ", cardsCount: 30, estMinutes: 8 },
  { id: "spk-18", slug: "ngsl-s-18-asking-directions", order: 18, context: "TRAVEL", contextLabel: "Du lịch & Di chuyển", title: "Getting Lost & Friendly Directions", titleVi: "Lạc đường & Nhờ Người dân Chỉ đường", cardsCount: 30, estMinutes: 8 },
  { id: "spk-19", slug: "ngsl-s-19-ordering-cafe-bar", order: 19, context: "TRAVEL", contextLabel: "Du lịch & Di chuyển", title: "Cafes, Pubs & Night Market Stalls", titleVi: "Gọi đồ tại Quán bar, Cafe & Chợ đêm", cardsCount: 30, estMinutes: 8 },
  { id: "spk-20", slug: "ngsl-s-20-travel-emergencies", order: 20, context: "TRAVEL", contextLabel: "Du lịch & Di chuyển", title: "Lost Luggage & Medical Assistance", titleVi: "Thất lạc Hành lý & Trợ giúp Y tế Khẩn", cardsCount: 30, estMinutes: 8 },

  // Context 5: EMOTIONS & LIFE TALK (4 Decks)
  { id: "spk-21", slug: "ngsl-s-21-empathy-comfort", order: 21, context: "EMOTIONS", contextLabel: "Cảm xúc & Tâm trạng", title: "Showing Sympathy & Heartfelt Comfort", titleVi: "Thể hiện Sự Đồng cảm & Lời An ủi Chân thành", cardsCount: 30, estMinutes: 8 },
  { id: "spk-22", slug: "ngsl-s-22-excitement-joy", order: 22, context: "EMOTIONS", contextLabel: "Cảm xúc & Tâm trạng", title: "Sharing Great News & Celebration", titleVi: "Báo Tin mừng & Chia sẻ Niềm vui Lớn", cardsCount: 30, estMinutes: 8 },
  { id: "spk-23", slug: "ngsl-s-23-resolving-misunderstandings", order: 23, context: "EMOTIONS", contextLabel: "Cảm xúc & Tâm trạng", title: "Clearing the Air & Sincere Apologies", titleVi: "Hóa giải Hiểu lầm & Lời Xin lỗi Chân thành", cardsCount: 30, estMinutes: 8 },
  { id: "spk-24", slug: "ngsl-s-24-future-dreams", order: 24, context: "EMOTIONS", contextLabel: "Cảm xúc & Tâm trạng", title: "Sharing Aspirations & Life Choices", titleVi: "Tâm sự Về Ước mơ & Ngã rẽ Cuộc sống", cardsCount: 31, estMinutes: 8 },
];

export const getSpokenDecksByContext = (context: "ALL" | "DAILY_LIFE" | "WORKPLACE" | "TRAVEL" | "EMOTIONS" | "SOCIALIZING"): SpokenDeckSummary[] => {
  if (context === "ALL") return SPOKEN_24_DECKS_CATALOG;
  return SPOKEN_24_DECKS_CATALOG.filter((d) => d.context === context);
};

export const getTotalSpokenWordsCount = (): number => {
  return SPOKEN_24_DECKS_CATALOG.reduce((acc, d) => acc + d.cardsCount, 0);
};
