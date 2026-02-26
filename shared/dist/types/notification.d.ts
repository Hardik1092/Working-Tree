export interface NotificationItem {
    _id: string;
    type?: string;
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
    read?: boolean;
    createdAt: string;
    [key: string]: unknown;
}
export interface NotificationSettings {
    social?: {
        likes?: boolean;
        comments?: boolean;
        connections?: boolean;
        messages?: boolean;
    };
    alerts?: {
        market?: boolean;
        weather?: boolean;
        pestDisease?: boolean;
        jobs?: boolean;
    };
    delivery?: {
        push?: boolean;
        emailDigest?: boolean;
    };
    [key: string]: unknown;
}
export interface UnreadCountResponse {
    count: number;
}
//# sourceMappingURL=notification.d.ts.map