export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;

    constructor(accessToken: string, refreshToken: string, expiresIn = 900) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.tokenType = 'Bearer';
    }
}
