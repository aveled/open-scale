import { platform } from 'node:os';



export const copyToUSB = async (
    filepath: string,
    name: string,
) => {
    switch (platform()) {
        case 'win32':
            break;
        case 'linux':
            break;
        case 'darwin':
            break;
        default:
            throw new Error('Unsupported platform');
    }
}
