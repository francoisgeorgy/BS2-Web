# Novation Bass Station II Web interface

Control your Bass Station II synthesizer from your web browser. 
No more hidden parameters. All of the Bass Station II parameters are visible on screen.
Save, load and even print your patches!
And, for the fun, leave the application create a patch with the _randomizer_!

![screenshot](/images/BS2-Web_v2.0.0.png "screenshot of current version running in Chrome")

# Requirements &amp; Limitations

This application requires a browser that support the [Web MIDI API](http://webaudio.github.io/web-midi-api/).

Currently, only Chrome 43+ and Opera 44+ support this standard. This app will therefore _not_ works in Firefox, Safari or IE. 

Still under active development. Feel free to log bugs/issues.

### Limitations

- Can only be used with one Bass Station II at a time. 

# How to use

1. Open https://francoisgeorgy.github.io/BS2-Web/
2. Allow the browser to use your MIDI devices
3. If it's not already done, connect your Bass Station II to your computer.
4. When the Bass Station II is connected the logo will glow. 
5. Move a dial or a slider on your Bass Station II, the corresponding on-screen control must move accordingly.

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

# Credits

- jQuery Knob: http://anthonyterrien.com/knob/ (https://github.com/aterrien/jQuery-Knob)
- Lity Lightbox: http://sorgalla.com/lity/
- js-cookie: https://github.com/js-cookie/js-cookie
- maybe in a future release: Store.js: https://github.com/marcuswestin/store.js/
- Roboto font by Google: https://fonts.google.com/specimen/Roboto

I quite heavily modified the jQuery Knob lib. In particular I swapped the `input` element by a `span` element. It is therefore
not possible anymore to enter a value with the keyboard. Only the mouse is supported. 

# Trademarks

Novation is a registered trade mark of Focusrite Audio Engineering Limited.

Bass Station II is a trade mark of Focusrite Audio Engineering Limited.

# Useful links

- http://beta.novationmusic.com/releases/bass_station_ii/
- https://support.novationmusic.com/hc/en-gb/articles/206861739-How-do-I-Control-the-Arp-on-the-Bass-Station-II-from-an-external-Controller-
- https://support.novationmusic.com/hc/en-gb/articles/207561465-How-to-export-User-presets-on-Bass-Station-II-
- https://www.reddit.com/r/synthesizers/comments/3nh3pc/your_bass_station_2_tips_and_tricks/

## Other BS2 editors

- https://cycling74.com/projects/bass-station-ii-patch-editor


# Recommended tools

- https://github.com/gbevin/SendMIDI
- https://github.com/gbevin/ReceiveMIDI