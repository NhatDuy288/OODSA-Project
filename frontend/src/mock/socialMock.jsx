// Hard-coded mock data for Facebook-like UI (Feed / Profile / Post / Comment).
// Backend will be added later.

const nowMinus = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

export function buildMockSocialData(meUser) {
    const me = {
        id: String(meUser?.id ?? "me"),
        fullName: meUser?.fullName || meUser?.name || meUser?.username || "Bạn",
        avatar: meUser?.avatar || meUser?.avatarUrl || "",
        coverUrl:
            meUser?.coverUrl ||
            "https://images.unsplash.com/photo-1520975869018-1b64a2f75c0f?auto=format&fit=crop&w=1600&q=60",
        bio: meUser?.bio || "Chào mọi người 👋",
        location: meUser?.location || "TP. Hồ Chí Minh",
        education: meUser?.education || "UTH",
        friends: ["2", "3", "4"],
    };

    const users = [
        me,
        {
            id: "2",
            fullName: "Nguyễn Minh Anh",
            avatar:
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=60",
            coverUrl:
                "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1600&q=60",
            bio: "Thích chụp ảnh, cà phê và mèo.",
            location: "Đà Nẵng",
            education: "UTH",
            friends: [String(me.id), "3", "4"],
        },
        {
            id: "3",
            fullName: "Trần Quốc Bảo",
            avatar:
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=60",
            coverUrl:
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=60",
            bio: "Đam mê công nghệ, thích làm đồ án.",
            location: "Hà Nội",
            education: "UTH",
            friends: [String(me.id), "2"],
        },
        {
            id: "4",
            fullName: "Lê Thuỳ Linh",
            avatar:
                "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=256&q=60",
            coverUrl:
                "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1600&q=60",
            bio: "Hôm nay bạn ổn không?",
            location: "Cần Thơ",
            education: "UTH",
            friends: [String(me.id), "2"],
        },
    ];

    const posts = [
        {
            id: "p1",
            userId: "2",
            content:
                "Cuối tuần đi uống cà phê không mọi người? Mình vừa tìm được quán view đẹp lắm ☕✨",
            imageUrl:
                "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1400&q=60",
            createdAt: nowMinus(45),
            likes: [String(me.id), "3"],
            comments: [
                {
                    id: "c1",
                    userId: "3",
                    content: "Ok nha, cho địa chỉ đi!",
                    createdAt: nowMinus(38),
                },
                {
                    id: "c2",
                    userId: String(me.id),
                    content: "Nghe hấp dẫn đó, mình đi được!",
                    createdAt: nowMinus(30),
                },
            ],
        },
        {
            id: "p2",
            userId: "3",
            content:
                "Hôm nay mình hoàn thành xong UI chat như Messenger. Giờ chuyển qua làm bảng tin như Facebook 😄",
            createdAt: nowMinus(180),
            likes: ["2"],
            comments: [
                {
                    id: "c3",
                    userId: "2",
                    content: "Đỉnh! Nhớ show demo nha.",
                    createdAt: nowMinus(160),
                },
            ],
        },
        {
            id: "p3",
            userId: String(me.id),
            content:
                "Test UI: đăng bài, like, comment. Backend làm sau nhưng UI phải mượt trước đã!",
            createdAt: nowMinus(600),
            likes: ["2", "3", "4"],
            comments: [],
        },
    ];

    return { users, posts };
}
