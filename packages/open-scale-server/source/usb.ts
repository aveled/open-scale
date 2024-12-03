import fs from 'node:fs';

import drivelist from 'drivelist';



export const copyToUSB = async (
    filepath: string,
    name: string,
) => {
    const drives = await drivelist.list();
    const USBs = drives.filter(drive => drive.isUSB);

    USBs.forEach(usb => {
        if (usb.device === '/dev/ttyUSB0' || usb.device === '/dev/ttyUSB1') {
            return;
        }

        usb.mountpoints.forEach(mountpoint => {
            fs.copyFileSync(filepath, `${mountpoint.path}/${name}`);
        });
    });
}
