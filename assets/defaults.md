Hardware-wise, open scale is meant to be run on a Raspberry Pi.

username: scale
password: open



Connect push button to GPIO 21 (pin 40) and GND (pin 39):

in rc.local:
``` bash
#!/bin/sh -e

sudo python3 /home/scale/Scripts/shutdown.py

exit 0
```

in ~/Scripts/shutdown.py

``` python
import RPi.GPIO as GPIO
import time
import os

# Use the Broadcom SOC Pin numbers
# Setup the pin with internal pullups enabled and pin in reading mode.
GPIO.setmode(GPIO.BCM)
GPIO.setup(21, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Our function on what to do when the button is pressed
def Shutdown(channel):
    print("Shutting Down")
    time.sleep(2)
    os.system("sudo shutdown -h now")

# Add our function to execute when the button pressed event happens
GPIO.add_event_detect(21, GPIO.FALLING, callback=Shutdown, bouncetime=2000)

# Now wait!
while 1:
    time.sleep(1)
```

Run

``` bash
sudo chown root /etc/rc.local
sudo chmod 755 /etc/rc.local
```
