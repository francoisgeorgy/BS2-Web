# Novation Bass Station II Web interface

This web application requires a browser that support the [Web MIDI API](http://webaudio.github.io/web-midi-api/).

Currently, only Chrome 43+ and Opera 44+ support this standard. This app will therefore _not_ works in Firefox, Safari or IE. 

# How to use

1. Open https://francoisgeorgy.github.io/BS2-Web/
2. Allow the browser to use your MIDI devices
3. If it's not already done, connect your Bass Station II to your computer
4. On the top-right corner of the application, "midi", "IN" and "OUT" must ne ON (gold/yellow) 
5. Move a dial or a slider on your Bass Station II, the corresponding on-screen control must move accordingly.

# Why this app?

The Bass Station II is my first synthesizer. I just bought one a couple of month ago. For a beginner like me the number
of controls and parameters available is huge. I want to understand how some patches and sound are done. Quite a lot of 
parameters are hidden behind "FN  Keys" and I  wanted to be able to change them in a more direct, visual way.
The introduction of the Web MIDI API seemed just a perfect match for this kind of development. So, here is the result.

# Bass Station II MIDI messages

## Messages

    0b1011nnnn 0b0ccccccc 0b0vvvvvvv: CC - Control Change

    0b1011nnnn 0b0ccccccc 0b0vvvvvvv: Channel Mode Message

    0b11110000 : System Exclusive

    0b11110111 : End of System Exclusive

## CC

## NRPN

CC=99 : NRPN MSB
CC=98 : NRPM LSB

Example: Arp Seq Retrig (Control 106):

    set ot OFF:

    14:54:14.979	From Bass Station II	Control	1	99	0
    14:54:14.979	From Bass Station II	Control	1	98	106
    14:54:14.979	From Bass Station II	Control	1	6	0

    set ot ON:

    14:54:16.218	From Bass Station II	Control	1	99	0
    14:54:16.218	From Bass Station II	Control	1	98	106
    14:54:16.218	From Bass Station II	Control	1	6	1

Example: Osc 1 Waveform (Control 0:72)

    Sine:

    14:55:18.291	From Bass Station II	Control	1	99	0
    14:55:18.291	From Bass Station II	Control	1	98	72
    14:55:18.291	From Bass Station II	Control	1	6	0

    Triangle:

    14:55:28.989	From Bass Station II	Control	1	99	0
    14:55:28.989	From Bass Station II	Control	1	98	72
    14:55:28.989	From Bass Station II	Control	1	6	1

## Two-bytes values



# Trademarks

Novation is a registered trade mark of Focusrite Audio Engineering Limited.

Bass Station II is a trade mark of Focusrite Audio Engineering Limited.
