import fs from 'node:fs';

import drivelist from 'drivelist';

import {
    EXTERNAL_USB,
} from './data';



export const copyToUSB = async (
    filepath: string,
    name: string,
) => {
    const drives = await drivelist.list();
    const USBs = drives.filter(drive => drive.isUSB);

    USBs.forEach(usb => {
        if (usb.device !== EXTERNAL_USB) {
            return;
        }

        const mountpoint = usb.mountpoints[0];
        if (!mountpoint) {
            return;
        }

        fs.copyFileSync(filepath, `${mountpoint.path}/${name}`);
    });
}
