// deno-lint-ignore-file

import usb from 'usb';



export const copyToUSB = async (
    filepath: string,
    name: string,
) => {
    const devices = usb.getDeviceList();

    for (const device of devices) {

    }
}
