export type CreateUserDetails = {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
};

export type ValidateUserDetails = {
    username: string;
    password: string;
};

export type FindUserParams = Partial<{
    id: number;
    email: string;
    username: string;
}>;

export type FindUserOptions = Partial<{
    selectAll: boolean;
}>;

