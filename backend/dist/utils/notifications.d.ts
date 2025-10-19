export interface CreateNotificationData {
    userId: string;
    title: string;
    message: string;
}
export declare const createNotification: (data: CreateNotificationData) => Promise<{
    userId: string;
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const createWelcomeNotification: (userId: string) => Promise<{
    userId: string;
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
} | null>;
//# sourceMappingURL=notifications.d.ts.map