Hardware-wise, open scale is meant to be run on a Raspberry Pi.

username: scale
password: open



Connect push button to GPIO 21 (pin 40) and GND (pin 39):

in rc.local:
``` bash
#!/bin/sh -e

sudo python3 /home/scale/Scripts/shutdown.py &

exit 0
```

in ~/Scripts/shutdown.py

``` python
#!/bin/python
#This script was authored by AndrewH7 and belongs to him (www.instructables.com/member/AndrewH7)
#You have permission to modify and use this script only for your own personal usage
#You do not have permission to redistribute this script as your own work
#Use this script at your own risk

import RPi.GPIO as GPIO
import os

gpio_pin_number=21
#Replace YOUR_CHOSEN_GPIO_NUMBER_HERE with the GPIO pin number you wish to use
#Make sure you know which rapsberry pi revision you are using first
#The line should look something like this e.g. "gpio_pin_number=7"

GPIO.setmode(GPIO.BCM)
#Use BCM pin numbering (i.e. the GPIO number, not pin number)
#WARNING: this will change between Pi versions
#Check yours first and adjust accordingly

GPIO.setup(gpio_pin_number, GPIO.IN, pull_up_down=GPIO.PUD_UP)
#It's very important the pin is an input to avoid short-circuits
#The pull-up resistor means the pin is high by default

try:
    GPIO.wait_for_edge(gpio_pin_number, GPIO.FALLING)
    #Use falling edge detection to see if pin is pulled
    #low to avoid repeated polling
    os.system("sudo shutdown -h now")
    #Send command to system to shutdown
except:
    pass

GPIO.cleanup()
#Revert all GPIO pins to their normal states (i.e. input = safe)
```

Run

``` bash
sudo chown root /etc/rc.local
sudo chmod 755 /etc/rc.local

sudo systemctl enable i
```
