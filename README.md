# Novation Bass Station II Web interface

This application requires a browser that support the [Web MIDI API](http://webaudio.github.io/web-midi-api/).

Currently, only Chrome 43+ and Opera 44+ support this standard. This app will therefore _not_ works in Firefox, Safari or IE. 

![light theme](/images/BS2-Web-light-theme.png "Light theme")

# How to use

1. Open https://francoisgeorgy.github.io/BS2-Web/
2. Allow the browser to use your MIDI devices
3. If it's not already done, connect your Bass Station II to your computer
4. On the top-right corner of the application, "midi", "IN" and "OUT" must be ON (gold/yellow) 
5. Move a dial or a slider on your Bass Station II, the corresponding on-screen control must move accordingly.

# Why this app?

The Bass Station II is my first synthesizer. I bought one a couple of weeks ago. For a beginner like me the number
of controls and parameters available is huge. I want to understand how some patches and sound are done. Quite a lot of 
parameters are hidden behind "FN  Keys" and I wanted to be able to change them in a more direct, visual way.
The introduction of the Web MIDI API seemed just a perfect match for this kind of development. So, here is the result.

# Bass Station II MIDI messages

The MIDI parameters are documented in the official Novation Bass Station II user manual. 

## SysEx Dump

The application is able to receive and decode SysEx dumps coming from the Bass Station II ("FN-Key _Global: Dump_") as well as .syx patch files.

The SysEx dump format is not documented by Novation. I have reverse-engineered it and you can find the result
 in my other project [BS2-SysEx](https://github.com/francoisgeorgy/BS2-SysEx).

## Two-bytes values

Some parameters use two bytes to increase the value range from 0..127 to 0..255. 

### Example:

#### Sending:

Value = `201`. In binary : `11001001`

1. The seven _most significants_ bits are `1100100`. Left-pad them to form a byte: `01100100` = `100`. This will be the first byte to send.
2. The _least significant_ bit is `1`. We left-shift it by 6 positions : `01000000` = `64`. This will be the second byte so send.

In summary:

    byte1 = integer part of value/2
    byte2 = 0 if value is even, 64 if value is odd

#### Sending:

We receive two bytes: `01100100` and `01000000`

1. Left-shift byte 1 by one position: `01100100 << 1 = 11001000`
2. Right-shift byte 2 by 6 position:  `01000000 >>> 6 = 00000001`
3. Add them: `11001000 + 00000001 = 11001001 = 201`

In summary:

    value = byte1*2 + byte2/64

# Libs used

- jQuery Knob: http://anthonyterrien.com/knob/ (https://github.com/aterrien/jQuery-Knob)
- Lity Lightbox: http://sorgalla.com/lity/
- js-cookie: https://github.com/js-cookie/js-cookie
- maybe in a future release: Store.js: https://github.com/marcuswestin/store.js/

I quite heavily modified the jQuery Knob lib. In particular I swapped the `input` element by a `span` element. It is therefore
not possible anymore to enter a value with the keyboard. Only the mouse is supported. 

# Trademarks

Novation is a registered trade mark of Focusrite Audio Engineering Limited.

Bass Station II is a trade mark of Focusrite Audio Engineering Limited.
