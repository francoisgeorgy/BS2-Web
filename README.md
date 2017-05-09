# Novation Bass Station II Web interface

# MIDI

## Messages

    MIDI_SYSTEM_MESSAGES: {
        value: {
            // System common messages
            "sysex": 0xF0,            // 240
            "timecode": 0xF1,         // 241
            "songposition": 0xF2,     // 242
            "songselect": 0xF3,       // 243
            "tuningrequest": 0xF6,    // 246
            "sysexend": 0xF7,         // 247 (never actually received - simply ends a sysex)

            // System real-time messages
            "clock": 0xF8,            // 248
            "start": 0xFA,            // 250
            "continue": 0xFB,         // 251
            "stop": 0xFC,             // 252
            "activesensing": 0xFE,    // 254
            "reset": 0xFF,            // 255
            "unknownsystemmessage": -1
            }
    },


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

# Trademarks

Novation is a registered trade mark of Focusrite Audio Engineering Limited.

Bass Station II is a trade mark of Focusrite Audio Engineering Limited.
