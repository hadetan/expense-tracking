export type SupaUser = {
    admin: {
        id: string;
        createdAt: Date;
        userId: string;
    } | null;
} & {
    name: string | null;
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};
