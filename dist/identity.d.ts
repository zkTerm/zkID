import { ZkIdIdentity } from './types';
export declare function generateZkId(): string;
export declare function createZkIdIdentity(password: string): Promise<ZkIdIdentity>;
export declare function truncateZkId(zkId: string): string;
export declare function validateZkId(zkId: string): boolean;
